"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertUser } from "./guards";
import { q, q1, tx } from "./db";
import { rateLimit } from "./rate-limit";
import { isLocale, lp } from "./i18n/config";
import { canUseSetBuilder, LIBRARY_MAX } from "./setbuilder";
import { cleanTrack, type Track } from "./sets/logic";
import type { FormState } from "./auth/actions";

async function gate() {
  const user = await assertUser();
  if (!(await canUseSetBuilder(user.id))) throw new Error("plan");
  return user;
}
const loc = (fd: FormData) => { const l = String(fd.get("locale") ?? "en"); return isLocale(l) ? l : "en"; };

export type ImportResult = { ok: boolean; added?: number; skipped?: number; error?: string };

/** Tracks are parsed in the browser; the server re-validates every field. */
export async function importLibraryAction(raw: unknown, source: "csv" | "rekordbox"): Promise<ImportResult> {
  let user;
  try { user = await gate(); } catch { return { ok: false, error: "plan" }; }
  if (!rateLimit(`lib:${user.id}`, 10, 60_000)) return { ok: false, error: "rateLimited" };
  if (!Array.isArray(raw) || !["csv", "rekordbox"].includes(source)) return { ok: false, error: "invalid" };
  if (raw.length > 5000) return { ok: false, error: "tooMany" };
  const tracks = raw.map((t) => cleanTrack((t ?? {}) as Record<string, unknown>)).filter((t): t is Track => t !== null);
  const have = (await q1<{ n: number }>(`select count(*)::int n from library_tracks where user_id=$1`, [user.id]))!.n;
  if (have + tracks.length > LIBRARY_MAX) return { ok: false, error: "tooMany" };
  // skip duplicates (same artist + title, case-insensitive)
  const existing = new Set((await q<{ k: string }>(`select lower(artist || '|' || title) k from library_tracks where user_id=$1`, [user.id])).map((r) => r.k));
  const fresh: Track[] = [];
  for (const t of tracks) { const k = `${t.artist}|${t.title}`.toLowerCase(); if (!existing.has(k)) { existing.add(k); fresh.push(t); } }
  await tx(async (c) => {
    for (let i = 0; i < fresh.length; i += 500) {
      const part = fresh.slice(i, i + 500);
      await c.query(
        `insert into library_tracks (user_id, title, artist, bpm, camelot, duration_sec, genre, energy, source)
         select $1, x.title, x.artist, x.bpm, x.camelot, x.duration_sec, x.genre, x.energy, $3
           from jsonb_to_recordset($2::jsonb) as x(title text, artist text, bpm numeric, camelot text, duration_sec int, genre text, energy smallint)`,
        [user.id, JSON.stringify(part), source],
      );
    }
  });
  revalidatePath("/[locale]/app/set-builder", "layout");
  return { ok: true, added: fresh.length, skipped: raw.length - fresh.length };
}

export async function addTrackAction(_s: FormState, fd: FormData): Promise<FormState> {
  let user;
  try { user = await gate(); } catch { return { error: "plan" }; }
  const t = cleanTrack({ title: fd.get("title"), artist: fd.get("artist"), bpm: fd.get("bpm"), camelot: fd.get("key"), duration_sec: String(fd.get("duration") ?? ""), genre: fd.get("genre"), energy: fd.get("energy") } as Record<string, unknown>);
  if (!t) return { error: "titleRequired" };
  if (String(fd.get("key") ?? "").trim() && !t.camelot) return { error: "badKey" };
  await q(`insert into library_tracks (user_id, title, artist, bpm, camelot, duration_sec, genre, energy, source) values ($1,$2,$3,$4,$5,$6,$7,$8,'manual')`,
    [user.id, t.title, t.artist, t.bpm, t.camelot, t.duration_sec, t.genre, t.energy]);
  revalidatePath("/[locale]/app/set-builder", "layout");
  return { ok: true, message: "trackAdded" };
}

export async function deleteTrackAction(id: string) {
  const user = await assertUser();
  await q(`delete from library_tracks where id=$1 and user_id=$2`, [id, user.id]);
  revalidatePath("/[locale]/app/set-builder", "layout");
}

export async function clearLibraryAction(_s: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  if (fd.get("confirm") !== "on") return { error: "confirmClear" };
  await q(`delete from library_tracks where user_id=$1`, [user.id]);
  revalidatePath("/[locale]/app/set-builder", "layout");
  return { ok: true, message: "cleared" };
}

const Ctx = z.object({ minutes: z.coerce.number().int().min(10).max(600), slot: z.enum(["opening", "warmup", "peak", "closing"]), genre: z.string().trim().max(60) });

export async function createSetAction(_s: FormState, fd: FormData): Promise<FormState> {
  let user;
  try { user = await gate(); } catch { return { error: "plan" }; }
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  const ctx = Ctx.safeParse({ minutes: fd.get("minutes"), slot: fd.get("slot"), genre: fd.get("genre") ?? "" });
  if (!title || !ctx.success) return { error: "invalid" };
  const r = await q1<{ id: string }>(`insert into dj_sets (user_id, title, context) values ($1,$2,$3) returning id`, [user.id, title, JSON.stringify(ctx.data)]);
  redirect(lp(loc(fd), `/app/set-builder/${r!.id}`));
}

const SetTrackSchema = z.object({
  libId: z.string().uuid().optional(), title: z.string().trim().min(1).max(200), artist: z.string().max(200), bpm: z.number().min(40).max(250).nullable(),
  camelot: z.string().regex(/^(1[0-2]|[1-9])[AB]$/).nullable(), duration_sec: z.number().int().min(1).max(21600).nullable(), genre: z.string().max(60), energy: z.number().int().min(1).max(10).nullable(),
});
const SaveSchema = z.object({ title: z.string().trim().min(1).max(120), context: Ctx, tracks: z.array(SetTrackSchema).max(200) });

export async function saveSetAction(id: string, data: unknown): Promise<{ ok: boolean; error?: string }> {
  let user;
  try { user = await gate(); } catch { return { ok: false, error: "plan" }; }
  const p = SaveSchema.safeParse(data);
  if (!p.success) return { ok: false, error: "invalid" };
  const r = await q1(`update dj_sets set title=$3, context=$4, tracks=$5, updated_at=now() where id=$1 and user_id=$2 returning id`,
    [id, user.id, p.data.title, JSON.stringify(p.data.context), JSON.stringify(p.data.tracks)]);
  if (!r) return { ok: false, error: "notFound" };
  revalidatePath("/[locale]/app/set-builder", "layout");
  return { ok: true };
}

export async function deleteSetAction(_s: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const r = await q1(`delete from dj_sets where id=$1 and user_id=$2 returning id`, [String(fd.get("id") ?? ""), user.id]);
  if (!r) return { error: "notFound" };
  redirect(lp(loc(fd), "/app/set-builder"));
}
