import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { q, q1 } from "./db";
import { env } from "./env";
import { COACH_PRICE, getUsage, getUserPlan, recordUsage } from "./plan";
import type { Locale } from "./i18n/config";
import type { Analysis } from "./audio/analyze";

export const COACH_MODEL = "claude-opus-5-5";
const MAX_HISTORY = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ChatMsg = { role: "user" | "assistant"; content: string; at: string };
export type Conversation = {
  id: string; title: string; messages: ChatMsg[]; uses_learning_context: boolean;
  context: { mixId?: string; setId?: string }; updated_at: string;
};

export async function listConversations(userId: string) {
  return q<{ id: string; title: string; updated_at: string; n: number }>(
    `select id, title, updated_at, jsonb_array_length(messages) n from ai_conversations
      where user_id=$1 and kind='coach' order by updated_at desc limit 50`,
    [userId],
  );
}

export async function getConversation(userId: string, id: string) {
  if (!UUID.test(id)) return null;
  return q1<Conversation>(
    `select id, title, messages, uses_learning_context, context, updated_at from ai_conversations where id=$1 and user_id=$2 and kind='coach'`,
    [id, userId],
  );
}

const LANG: Record<Locale, string> = { en: "English", ja: "Japanese", th: "Thai" };

/** Stable across users so the prompt cache is shared; per-user facts go in a separate block. */
const SYSTEM = `You are the AI DJ Coach of THE DJ COLLECTIVE, a DJ academy in Bangkok that teaches in English, Japanese and Thai.

How you work:
- Coach DJ technique: beatmatching, phrasing, EQ, gain staging, transitions, harmonic mixing, track selection, set building, practice planning, and the music career side (promos, gigs, networking).
- Be concrete. Prefer short practice drills with a clear goal, steps, and how to tell it worked. Keep answers focused; use short lists when they help.
- Ground every claim about the student's own mixing in the CONTEXT block. Measured values are signal measurements; estimated values (tempo, key, transition points) are heuristics that can be wrong — say so when it matters. Never invent numbers, scores, timestamps or analysis results that are not in the context.
- If you do not know something (for example the exact menu of a specific mixer or controller firmware), say so and suggest checking the manual or asking an instructor. Do not guess model-specific button names.
- You cannot hear audio and you cannot watch the student play. For hand technique, posture or anything that needs observation, recommend booking a lesson with an instructor.
- Do not present yourself as a human or as an instructor. Instructor feedback in the context is from a human instructor; keep it separate from your own view.
- Protect hearing: if the student mentions loud monitoring or ringing ears, advise lower levels and breaks.
- Music rights: do not help to rip, pirate or redistribute music. Recorded mixes can be shared only where the rights allow it.
- Always answer in the language requested in the CONTEXT block, unless the student writes in another language.`;

type Ctx = { userId: string; locale: Locale; useLearning: boolean; mixId?: string; setId?: string };

/** Builds the per-user CONTEXT block. Only data the student owns, and learning data only with consent. */
export async function buildContext(c: Ctx) {
  const lines: string[] = [`Reply language: ${LANG[c.locale]}.`];
  const p = await q1<{ display_name: string; experience_level: string; goal: string | null }>(
    `select display_name, experience_level, goal from profiles where user_id=$1`, [c.userId]);
  if (p) lines.push(`Student: experience=${p.experience_level}${p.goal ? `, goal=${p.goal}` : ""}.`);
  const plan = await getUserPlan(c.userId);
  lines.push(`Plan: ${plan.name}.`);

  if (c.useLearning) {
    const done = await q<{ level: number; sort_order: number; title: string; quiz_score: number | null }>(
      `select c.level, m.sort_order, m.title->>'en' title, lp.quiz_score from learning_progress lp
         join course_modules m on m.id=lp.module_id join courses c on c.id=m.course_id
        where lp.user_id=$1 and lp.status='completed' order by c.level, m.sort_order`, [c.userId]);
    lines.push(done.length
      ? `Completed course modules: ${done.map((d) => `${d.level}.${d.sort_order + 1} ${d.title}${d.quiz_score != null ? ` (quiz ${d.quiz_score}%)` : ""}`).join("; ")}.`
      : "Completed course modules: none yet.");
    const skills = await q<{ skill: string; score: number; source: string }>(
      `select distinct on (skill, source) skill, score, source from skill_scores where user_id=$1 order by skill, source, created_at desc`, [c.userId]);
    if (skills.length) lines.push(`Latest skill scores (source in brackets; "analysis" = rule-based from Mix Lab): ${skills.map((s) => `${s.skill} ${s.score} [${s.source}]`).join(", ")}.`);
    const lessons = await q<{ starts_at: string; status: string }>(
      `select starts_at, status from bookings where user_id=$1 and status in ('confirmed','completed') order by starts_at desc limit 5`, [c.userId]);
    if (lessons.length) lines.push(`Lessons: ${lessons.map((l) => `${new Date(l.starts_at).toISOString().slice(0, 10)} ${l.status}`).join(", ")}.`);
  }

  if (c.mixId && UUID.test(c.mixId)) {
    const r = await q1<{ title: string; measured: Analysis["measured"] & { sampleRate: number }; estimated: Analysis["estimated"]; scores: Record<string, unknown>; duration_sec: number; id: string }>(
      `select r.id, r.title, r.measured, r.estimated, r.scores, u.duration_sec from mix_analysis_results r
         join mix_analysis_jobs j on j.id=r.job_id join audio_uploads u on u.id=j.upload_id where r.id=$1 and r.user_id=$2`, [c.mixId, c.userId]);
    if (r) {
      const m = r.measured, e = r.estimated;
      const reviews = await q<{ comment: string }>(`select comment from analysis_reviews where result_id=$1 order by created_at`, [r.id]);
      lines.push(
        `MIX ANALYSIS "${r.title}" (${Math.round(r.duration_sec / 60)} min, analysed in the browser at ${m.sampleRate} Hz):`,
        `  measured: integrated ${m.integratedLufs} LUFS, loudness range ${m.lra} LU, sample peak ${m.peakDbfs} dBFS, clipping events ${m.clipEvents}${m.clipTimes?.length ? ` at ${m.clipTimes.slice(0, 10).map(mmss).join(", ")}` : ""}, stereo correlation ${m.stereoCorrelation}, silent gaps ${m.gaps?.length ?? 0}${m.gaps?.length ? ` at ${m.gaps.slice(0, 10).map((g) => mmss(g.t)).join(", ")}` : ""}.`,
        `  estimated: tempo ${e.bpm?.value} BPM (confidence ${e.bpm?.confidence}, range ${e.bpm?.min}–${e.bpm?.max}), key ${e.key?.camelot ?? "unknown"} ${e.key?.name ?? ""} (confidence ${e.key?.confidence}), key timeline ${(e.key?.segments ?? []).filter((s) => s.c >= 0.5).map((s) => `${mmss(s.t)} ${s.camelot}`).slice(0, 30).join(", ") || "n/a"}, possible transitions ${(e.transitions ?? []).map((x) => `${mmss(x.t)} (${x.reasons.join("+")})`).slice(0, 30).join(", ") || "none"}.`,
        `  rule-based scores (fixed formulas, not a judgement): ${JSON.stringify(r.scores)}.`,
        ...(reviews.length ? [`  instructor reviews: ${reviews.map((x) => JSON.stringify(x.comment)).join(" | ")}`] : []),
      );
    }
  }

  if (c.setId && UUID.test(c.setId)) {
    const s = await q1<{ title: string; context: Record<string, unknown>; tracks: { title: string; artist?: string; bpm?: number | null; camelot?: string | null; energy?: number | null; duration_sec?: number | null }[] }>(
      `select title, context, tracks from dj_sets where id=$1 and user_id=$2`, [c.setId, c.userId]);
    if (s) {
      lines.push(
        `DJ SET PLAN "${s.title}" ${JSON.stringify(s.context)} — ${s.tracks.length} tracks (metadata entered or imported by the student):`,
        ...s.tracks.slice(0, 60).map((t, i) => `  ${i + 1}. ${t.artist ? `${t.artist} – ` : ""}${t.title} | ${t.bpm ?? "?"} BPM | ${t.camelot ?? "?"} | energy ${t.energy ?? "?"}`),
      );
    }
  }
  return lines.join("\n");
}

function mmss(t: number) {
  const s = Math.round(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export class CoachError extends Error {}

let client: Anthropic | null = null;
/** Exposed for tests (base URL can be pointed at a mock server via ANTHROPIC_BASE_URL). */
export function anthropic() {
  if (!env.llmApiKey) throw new CoachError("not_connected");
  return (client ??= new Anthropic({ apiKey: env.llmApiKey, maxRetries: 2 }));
}

export type CoachEvent = { t: "delta"; v: string } | { t: "done"; id: string } | { t: "error"; code: string };

/**
 * Runs one coach turn and yields text deltas. Persists the turn and records token usage + cost.
 * Server-side fallbacks are enabled ("default"): if the model declines, the API can re-run the request
 * on a fallback model inside the same call.
 */
export async function* coachTurn(input: {
  userId: string; locale: Locale; message: string; conversationId?: string; mixId?: string; setId?: string; useLearning: boolean;
}): AsyncGenerator<CoachEvent> {
  const [plan, usage] = await Promise.all([getUserPlan(input.userId), getUsage(input.userId)]);
  if (usage.coach >= plan.quotas.ai_coach_messages) { yield { t: "error", code: "quota" }; return; }

  let conv = input.conversationId ? await getConversation(input.userId, input.conversationId) : null;
  if (input.conversationId && !conv) { yield { t: "error", code: "notFound" }; return; }
  const ctx = { mixId: input.mixId ?? conv?.context.mixId, setId: input.setId ?? conv?.context.setId };
  const history = (conv?.messages ?? []).slice(-MAX_HISTORY);
  const context = await buildContext({ userId: input.userId, locale: input.locale, useLearning: input.useLearning, ...ctx });

  const api = anthropic();
  let text = "";
  let final: Anthropic.Beta.Messages.BetaMessage;
  try {
    const stream = api.beta.messages.stream({
      model: COACH_MODEL,
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      cache_control: { type: "ephemeral" },
      system: [
        { type: "text", text: SYSTEM },
        { type: "text", text: `CONTEXT (from the academy database; trust it over memory):\n${context}` },
      ],
      messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user" as const, content: input.message }],
      metadata: { user_id: input.userId },
    });
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        text += ev.delta.text;
        yield { t: "delta", v: ev.delta.text };
      }
    }
    final = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) yield { t: "error", code: "busy" };
    else if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) yield { t: "error", code: "auth" };
    else if (e instanceof Anthropic.APIError) yield { t: "error", code: "upstream" };
    else throw e;
    return;
  }

  const u = final.usage;
  const inTok = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  const cost = (u.input_tokens ?? 0) * COACH_PRICE.input + (u.cache_creation_input_tokens ?? 0) * COACH_PRICE.input * 1.25
    + (u.cache_read_input_tokens ?? 0) * COACH_PRICE.input * 0.1 + (u.output_tokens ?? 0) * COACH_PRICE.output;
  await recordUsage(input.userId, "coach", { input: inTok, output: u.output_tokens ?? 0, costUsd: Math.round(cost * 1e5) / 1e5 });

  if (final.stop_reason === "refusal" || !text.trim()) { yield { t: "error", code: "refusal" }; return; }

  const now = new Date().toISOString();
  const add: ChatMsg[] = [{ role: "user", content: input.message, at: now }, { role: "assistant", content: text, at: now }];
  if (conv) {
    await q(`update ai_conversations set messages = messages || $3::jsonb, context=$4, uses_learning_context=$5, updated_at=now() where id=$1 and user_id=$2`,
      [conv.id, input.userId, JSON.stringify(add), JSON.stringify(ctx), input.useLearning]);
  } else {
    conv = await q1<Conversation>(
      `insert into ai_conversations (user_id, kind, title, messages, context, uses_learning_context) values ($1,'coach',$2,$3,$4,$5)
       returning id, title, messages, uses_learning_context, context, updated_at`,
      [input.userId, input.message.replace(/\s+/g, " ").slice(0, 80), JSON.stringify(add), JSON.stringify(ctx), input.useLearning],
    );
  }
  yield { t: "done", id: conv!.id };
}
