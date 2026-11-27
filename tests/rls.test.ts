/**
 * RLS defence-in-depth check, run against a LOCAL database:
 *   npx tsx tests/rls.test.ts
 * Simulates Supabase API roles (anon / authenticated with a JWT sub) and checks what they can read.
 */
import pg from "pg";
import assert from "node:assert/strict";

const url = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/djc";
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("local database only");
const c = new pg.Client({ connectionString: url });
let passed = 0;
const ok = (name: string) => { passed++; console.log("  ✓", name); };

async function as<T>(role: "anon" | "authenticated", sub: string | null, sql: string, params: unknown[] = []): Promise<T[]> {
  await c.query("begin");
  try {
    await c.query(`set local role ${role}`);
    await c.query(`select set_config('request.jwt.claim.sub', $1, true)`, [sub ?? ""]);
    return (await c.query(sql, params)).rows as T[];
  } finally {
    await c.query("rollback");
  }
}
async function denied(role: "anon" | "authenticated", sub: string | null, sql: string) {
  try { await as(role, sub, sql); return false; } catch (e) { return (e as { code?: string }).code === "42501"; }
}

(async () => {
  await c.connect();
  const withBooking = (await c.query(`select user_id id from bookings group by user_id limit 2`)).rows;
  assert.ok(withBooking.length >= 1, "need at least one booking (run the E2E suite first)");
  const a = withBooking[0].id as string;
  const b = (withBooking[1]?.id ?? (await c.query(`select id from users where id <> $1 limit 1`, [a])).rows[0].id) as string;

  // anon
  assert.equal((await as("anon", null, "select * from bookings")).length, 0); ok("anon sees no bookings");
  assert.equal((await as("anon", null, "select * from payments")).length, 0); ok("anon sees no payments");
  assert.ok(await denied("anon", null, "select id from users")); ok("anon cannot read users");
  assert.ok(await denied("anon", null, "select * from audit_logs") || (await as("anon", null, "select * from audit_logs")).length === 0); ok("anon cannot read audit logs");
  assert.ok((await as("anon", null, "select * from lessons")).length > 0); ok("anon can read public lessons");

  // authenticated
  const mine = await as<{ user_id: string }>("authenticated", a, "select user_id from bookings");
  assert.ok(mine.length > 0 && mine.every((r) => r.user_id === a)); ok("member sees only own bookings");
  const pays = await as<{ user_id: string }>("authenticated", a, "select user_id from payments");
  assert.ok(pays.every((r) => r.user_id === a)); ok("member sees only own payments");
  const us = await as<{ id: string }>("authenticated", a, "select id from users");
  assert.deepEqual(us.map((r) => r.id), [a]); ok("member sees only own user row");
  assert.ok(await denied("authenticated", a, "select totp_secret from users")); ok("totp_secret column is not readable");
  assert.ok(await denied("authenticated", a, "update bookings set status='confirmed'")); ok("member cannot update bookings directly");
  assert.ok(await denied("authenticated", a, `insert into payments (provider, amount_satang) values ('demo', 0)`)); ok("member cannot insert payments");
  assert.ok(await denied("authenticated", a, "update users set role='admin'")); ok("member cannot escalate role");
  assert.ok((await as("authenticated", a, "select * from webhook_events")).length === 0 || await denied("authenticated", a, "select * from webhook_events")); ok("webhook events hidden");
  const other = await as("authenticated", a, "select * from bookings where user_id=$1", [b]);
  assert.equal(other.length, 0); ok("member cannot read another member's bookings");

  // Phase 02 tables: owners read their own rows only; nobody writes through the API roles
  for (const tbl of ["mix_analysis_results", "audio_uploads", "ai_conversations", "ai_usage", "library_tracks", "dj_sets", "quiz_attempts", "skill_scores", "subscriptions"]) {
    assert.equal((await as("anon", null, `select * from ${tbl}`).catch(() => [])).length, 0);
    const rows = await as<{ user_id: string }>("authenticated", a, `select user_id from ${tbl}`).catch(() => [] as { user_id: string }[]);
    assert.ok(rows.every((r) => r.user_id === a), tbl);
  }
  ok("phase 02 tables: anon sees nothing, members see only their own rows");
  for (const sql of [
    `insert into dj_sets (user_id, title) values ('${b}', 'x')`,
    `insert into library_tracks (user_id, title) values ('${a}', 'x')`,
    `insert into ai_usage (user_id, feature) values ('${a}', 'coach')`,
    `update subscriptions set plan_code='stage_elite'`,
    `insert into analysis_reviews (result_id, instructor_id, comment) values (gen_random_uuid(), gen_random_uuid(), 'x')`,
  ]) assert.ok(await denied("authenticated", a, sql), sql);
  ok("phase 02 tables are not writable by API roles (no quota or plan tampering)");
  const shared = await as<{ id: string }>("authenticated", a, "select r.id from analysis_reviews v join mix_analysis_results r on r.id=v.result_id where r.user_id <> $1", [a]);
  assert.equal(shared.length, 0); ok("reviews of other members' analyses are hidden");

  console.log(`\nRLS: ${passed} checks passed`);
  await c.end();
})().catch(async (e) => { console.error("RLS FAILED:", e); await c.end(); process.exit(1); });
