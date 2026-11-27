/**
 * AI Coach pipeline test against a LOCAL mock of the Messages API (no network, no real key).
 * Verifies request shape (model, fallbacks, beta header, caching, grounding context), streaming,
 * persistence, usage/cost recording, and refusal handling.
 *   npx tsx --conditions=react-server tests/coach.test.ts
 */
import assert from "node:assert/strict";
import http from "node:http";
import pg from "pg";

const url = (process.env.DATABASE_URL ||= "postgres://postgres@localhost:5432/djc");
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("local database only");

type Seen = { headers: http.IncomingHttpHeaders; body: any };
const seen: Seen[] = [];
let mode: "ok" | "refusal" = "ok";

const sse = (ev: string, data: unknown) => `event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`;
const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    seen.push({ headers: req.headers, body: JSON.parse(raw) });
    res.writeHead(200, { "content-type": "text/event-stream" });
    const msg = { id: "msg_test", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, stop_sequence: null,
      usage: { input_tokens: 1000, output_tokens: 0, cache_creation_input_tokens: 2000, cache_read_input_tokens: 0 } };
    res.write(sse("message_start", { type: "message_start", message: msg }));
    if (mode === "ok") {
      res.write(sse("content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }));
      for (const part of ["Lower your ", "channel gain ", "at 0:30."]) res.write(sse("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: part } }));
      res.write(sse("content_block_stop", { type: "content_block_stop", index: 0 }));
    }
    res.write(sse("message_delta", { type: "message_delta", delta: { stop_reason: mode === "ok" ? "end_turn" : "refusal", stop_sequence: null }, usage: { output_tokens: 50 } }));
    res.write(sse("message_stop", { type: "message_stop" }));
    res.end();
  });
});

(async () => {
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-local-mock";
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
  const { coachTurn } = await import("../src/lib/coach");
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  let passed = 0;
  const ok = (n: string) => { passed++; console.log("  ✓", n); };

  // a member with an active member plan and one stored mix analysis
  const u = (await c.query(`insert into auth.users (id, email) values (gen_random_uuid(), 'coach-test-' || floor(random()*1e9) || '@local.test') returning id, email`)).rows[0];
  await c.query(`insert into users (id, email) values ($1,$2) on conflict do nothing`, [u.id, u.email]);
  await c.query(`insert into subscriptions (user_id, plan_code, status, provider, current_period_end) values ($1,'member','active','demo', now() + interval '1 month')`, [u.id]);
  const up = (await c.query(`insert into audio_uploads (user_id, storage_path, filename, mime, size_bytes, duration_sec, sha256) values ($1,'device-only','x.wav','audio/wav',1,600,'0') returning id`, [u.id])).rows[0];
  const job = (await c.query(`insert into mix_analysis_jobs (upload_id, user_id, status) values ($1,$2,'completed') returning id`, [up.id, u.id])).rows[0];
  const measured = { integratedLufs: -9.3, lra: 4.2, peakDbfs: 0, clipEvents: 2, clipTimes: [30, 95], stereoCorrelation: 0.9, gaps: [], sampleRate: 22050 };
  const estimated = { bpm: { value: 124, confidence: 0.9, min: 123.8, max: 124.2, curve: [] }, key: { camelot: "8A", name: "Am", confidence: 0.8, segments: [] }, transitions: [] };
  const mix = (await c.query(`insert into mix_analysis_results (job_id, user_id, title, measured, estimated, scores) values ($1,$2,'Test mix',$3,$4,'{"overall":80}') returning id`,
    [job.id, u.id, JSON.stringify(measured), JSON.stringify(estimated)])).rows[0];

  const run = async (args: Parameters<typeof coachTurn>[0]) => { const out = []; for await (const e of coachTurn(args)) out.push(e); return out; };

  const ev = await run({ userId: u.id, locale: "ja", message: "How was my mix?", mixId: mix.id, useLearning: false });
  const req = seen[0];
  assert.equal(req.body.model, "claude-opus-5-5"); ok("model claude-opus-5-5");
  assert.equal(req.body.fallbacks, "default"); ok("server-side fallbacks: default");
  assert.match(String(req.headers["anthropic-beta"]), /server-side-fallback-2026-07-01/); ok("fallback beta header");
  assert.deepEqual(req.body.thinking, { type: "adaptive" }); assert.equal(req.body.output_config.effort, "medium"); ok("adaptive thinking + explicit effort");
  assert.deepEqual(req.body.cache_control, { type: "ephemeral" }); ok("prompt caching enabled");
  assert.ok(!("temperature" in req.body) && req.body.messages.at(-1).role === "user"); ok("no prefill / sampling params");
  const ctx = req.body.system[1].text as string;
  assert.match(ctx, /Reply language: Japanese/); assert.match(ctx, /-9\.3 LUFS/); assert.match(ctx, /clipping events 2 at 0:30, 1:35/); assert.match(ctx, /124 BPM/);
  ok("grounding context contains the stored measurements");
  assert.doesNotMatch(ctx, /Completed course modules/); ok("learning data not sent without consent");
  assert.equal(ev.filter((e) => e.t === "delta").map((e) => (e as { v: string }).v).join(""), "Lower your channel gain at 0:30."); ok("streams text deltas");
  const done = ev.at(-1) as { t: string; id: string };
  assert.equal(done.t, "done");
  const conv = (await c.query(`select messages, context from ai_conversations where id=$1`, [done.id])).rows[0];
  assert.equal(conv.messages.length, 2); assert.equal(conv.context.mixId, mix.id); ok("conversation persisted with context");
  const use = (await c.query(`select input_tokens, output_tokens, cost_usd from ai_usage where user_id=$1 and feature='coach'`, [u.id])).rows;
  assert.equal(use.length, 1); assert.equal(use[0].input_tokens, 3000); assert.equal(use[0].output_tokens, 50);
  assert.equal(Number(use[0].cost_usd), Math.round((1000 * 4e-6 + 2000 * 4e-6 * 1.25 + 50 * 20e-6) * 1e5) / 1e5); ok("usage tokens and cost recorded");

  await run({ userId: u.id, locale: "en", message: "And my progress?", conversationId: done.id, useLearning: true });
  assert.equal(seen[1].body.messages.length, 3); assert.match(seen[1].body.system[1].text, /Completed course modules/); ok("follow-up sends history; learning context with consent");

  mode = "refusal";
  const r = await run({ userId: u.id, locale: "en", message: "x", conversationId: done.id, useLearning: false });
  assert.deepEqual(r.at(-1), { t: "error", code: "refusal" });
  assert.equal((await c.query(`select jsonb_array_length(messages) n from ai_conversations where id=$1`, [done.id])).rows[0].n, 4); ok("refusal is reported and not stored");

  const other = await run({ userId: u.id, locale: "en", message: "x", conversationId: "00000000-0000-4000-8000-000000000000", useLearning: false });
  assert.deepEqual(other.at(-1), { t: "error", code: "notFound" }); ok("foreign/unknown conversation rejected");

  await c.query(`update plans set quotas = quotas || '{"ai_coach_messages": 3}' where code='member'`);
  try {
    const q = await run({ userId: u.id, locale: "en", message: "x", useLearning: false });
    assert.deepEqual(q.at(-1), { t: "error", code: "quota" }); assert.equal(seen.length, 3); ok("monthly quota enforced before calling the API");
  } finally {
    await c.query(`update plans set quotas = quotas || '{"ai_coach_messages": 300}' where code='member'`);
  }
  await c.query(`delete from auth.users where id=$1`, [u.id]);
  await c.end(); server.close();
  console.log(`coach: ${passed} checks passed`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
