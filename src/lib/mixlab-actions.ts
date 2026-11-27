"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, lp } from "./i18n/config";
import { z } from "zod";
import { assertInstructor, assertUser } from "./guards";
import { q, q1, tx } from "./db";
import { getUsage, getUserPlan, recordUsage } from "./plan";
import { rateLimit } from "./rate-limit";
import { canReview, BROWSER_MAX_MINUTES } from "./mixlab";
import { ANALYZER_VERSION, type Analysis } from "./audio/analyze";
import { scoreAnalysis } from "./audio/scores";
import type { FormState } from "./auth/actions";

const num = z.number().finite();
const nul = num.nullable();
const curve = (max: number) => z.array(num).max(max);
const MAXPTS = 5000;

const AnalysisSchema = z.object({
  version: z.literal(ANALYZER_VERSION),
  durationSec: num.min(1).max(BROWSER_MAX_MINUTES * 60 + 60),
  sampleRate: num.min(4000).max(48000),
  channels: z.number().int().min(1).max(2),
  measured: z.object({
    peakDbfs: num.max(6).min(-200),
    clipEvents: z.number().int().min(0).max(1e7),
    clipTimes: curve(200),
    integratedLufs: nul,
    lra: nul,
    stereoCorrelation: nul,
    curveStep: num.min(1).max(10),
    shortTerm: z.array(nul).max(MAXPTS),
    bands: z.object({ low: curve(MAXPTS), mid: curve(MAXPTS), high: curve(MAXPTS) }),
    highBandValid: z.boolean(),
    gaps: z.array(z.object({ t: num, dur: num })).max(500),
  }),
  estimated: z.object({
    bpm: z.object({
      value: nul, confidence: num.min(0).max(1), min: nul, max: nul,
      curve: z.array(z.object({ t: num, bpm: num, c: num })).max(MAXPTS),
    }),
    key: z.object({
      camelot: z.string().regex(/^(1[0-2]|[1-9])[AB]$/).nullable(), name: z.string().max(8).nullable(), confidence: num.min(0).max(1),
      segments: z.array(z.object({ t: num, camelot: z.string().regex(/^(1[0-2]|[1-9])[AB]$/), c: num })).max(MAXPTS),
    }),
    transitions: z.array(z.object({ t: num, reasons: z.array(z.enum(["tempo", "key", "texture"])).max(3), c: num })).max(500),
  }),
});

const FileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive(),
  mime: z.enum(["audio/mpeg", "audio/wav", "audio/x-wav", "audio/aiff", "audio/x-aiff", "audio/mp4", "audio/x-m4a"]),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  title: z.string().trim().min(1).max(120),
});

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Stores the browser's measurements. The audio itself never leaves the device (storage_path 'device-only').
 * Scores and advice are recomputed here from the measurements so the client cannot submit its own scores.
 */
export async function saveAnalysisAction(file: unknown, analysis: unknown): Promise<SaveResult> {
  const user = await assertUser();
  if (!rateLimit(`mix:${user.id}`, 10, 60_000)) return { ok: false, error: "rateLimited" };
  const f = FileSchema.safeParse(file);
  const a = AnalysisSchema.safeParse(analysis);
  if (!f.success || !a.success) return { ok: false, error: "invalid" };
  const [plan, usage] = await Promise.all([getUserPlan(user.id), getUsage(user.id)]);
  if (usage.mix >= plan.quotas.mix_analyses) return { ok: false, error: "quota" };
  if (f.data.size > plan.quotas.max_upload_mb * 1024 * 1024) return { ok: false, error: "tooLarge" };
  if (a.data.durationSec > Math.min(plan.quotas.max_minutes, BROWSER_MAX_MINUTES) * 60 + 30) return { ok: false, error: "tooLong" };

  const an = a.data as Analysis;
  const { scores, advice } = scoreAnalysis(an);
  const measured = { ...an.measured, sampleRate: an.sampleRate, channels: an.channels };
  const id = await tx(async (c) => {
    const up = await c.query<{ id: string }>(
      `insert into audio_uploads (user_id, storage_path, filename, mime, size_bytes, duration_sec, sha256, stored)
       values ($1,'device-only',$2,$3,$4,$5,$6,false) returning id`,
      [user.id, f.data.name, f.data.mime, f.data.size, Math.round(an.durationSec), f.data.sha256],
    );
    const job = await c.query<{ id: string }>(
      `insert into mix_analysis_jobs (upload_id, user_id, status, attempts, started_at, finished_at) values ($1,$2,'completed',1,now(),now()) returning id`,
      [up.rows[0].id, user.id],
    );
    const res = await c.query<{ id: string }>(
      `insert into mix_analysis_results (job_id, user_id, title, analyzer, measured, estimated, scores, advice)
       values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`,
      [job.rows[0].id, user.id, f.data.title, an.version, JSON.stringify(measured), JSON.stringify(an.estimated), JSON.stringify(scores), JSON.stringify(advice)],
    );
    const rid = res.rows[0].id;
    const skills: [string, number | null][] = [["gain_staging", scores.clipping], ["loudness", scores.loudness], ["beatmatching", scores.tempo], ["harmonic_mixing", scores.harmonic], ["flow", scores.flow]];
    for (const [skill, v] of skills) if (v != null) await c.query(`insert into skill_scores (user_id, skill, score, source, source_id) values ($1,$2,$3,'analysis',$4)`, [user.id, skill, v, rid]);
    return rid;
  });
  await recordUsage(user.id, "mix_analysis");
  revalidatePath("/[locale]/app/mix-lab", "page");
  return { ok: true, id };
}

export async function shareMixAction(_s: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const id = String(fd.get("id") ?? "");
  const share = fd.get("share") === "1";
  const r = await q1(`update mix_analysis_results set shared_with_instructor=$3 where id=$1 and user_id=$2 returning id`, [id, user.id, share]);
  if (!r) return { error: "notFound" };
  revalidatePath("/[locale]/app/mix-lab/[id]", "page");
  return { ok: true, message: share ? "shared" : "unshared" };
}

export async function deleteMixAction(_s: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const id = String(fd.get("id") ?? "");
  // deleting the upload cascades to job, result, reviews; usage stays counted for the month
  const r = await q1(
    `delete from audio_uploads u using mix_analysis_jobs j, mix_analysis_results r
      where r.id=$1 and r.user_id=$2 and j.id=r.job_id and u.id=j.upload_id returning u.id`,
    [id, user.id],
  );
  if (!r) return { error: "notFound" };
  await q(`delete from skill_scores where source='analysis' and source_id=$1 and user_id=$2`, [id, user.id]);
  revalidatePath("/[locale]/app/mix-lab", "page");
  const locale = String(fd.get("locale") ?? "en");
  redirect(lp(isLocale(locale) ? locale : "en", "/app/mix-lab"));
}

const ReviewSchema = z.object({ id: z.string().uuid(), comment: z.string().trim().min(10).max(4000) });
export async function reviewMixAction(_s: FormState, fd: FormData): Promise<FormState> {
  const me = await assertInstructor();
  const p = ReviewSchema.safeParse({ id: fd.get("id"), comment: fd.get("comment") });
  if (!p.success) return { error: "reviewTooShort" };
  const row = await q1<{ user_id: string; shared_with_instructor: boolean }>(`select user_id, shared_with_instructor from mix_analysis_results where id=$1`, [p.data.id]);
  if (!row || !row.shared_with_instructor || !(await canReview(me.id, row.user_id))) return { error: "forbidden" };
  const ins = await q1<{ id: string }>(`select id from instructors where user_id=$1`, [me.id]);
  if (!ins) return { error: "forbidden" };
  await q(`insert into analysis_reviews (result_id, instructor_id, comment) values ($1,$2,$3)`, [p.data.id, ins.id, p.data.comment]);
  revalidatePath("/[locale]/app/mix-lab/[id]", "page");
  return { ok: true, message: "reviewSaved" };
}
