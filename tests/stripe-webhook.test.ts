/**
 * Stripe webhook integration test (no network): signs events locally with a test secret and
 * calls the real route handler against the LOCAL database.
 *   npx tsx --conditions=react-server tests/stripe-webhook.test.ts
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

process.env.STRIPE_SECRET_KEY ||= "sk_test_dummy_for_signature_tests";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_e2e_secret";
const url = (process.env.DATABASE_URL ||= "postgres://postgres@localhost:5432/djc");
if (!/localhost|127\.0\.0\.1/.test(url)) throw new Error("local database only");

(async () => {
  const Stripe = (await import("stripe")).default;
  const { POST } = await import("../src/app/api/stripe/webhook/route");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  let passed = 0;
  const ok = (n: string) => { passed++; console.log("  ✓", n); };

  const ctx = (await c.query(`select (select id from instructors limit 1) i, (select id from lessons where slug='online-private-60') l, (select id from users where role='member' limit 1) u`)).rows[0];
  const start = new Date(Date.now() + 60 * 86400_000); start.setUTCHours(6, 0, 0, 0);
  const end = new Date(start.getTime() + 3600_000);
  const sessionId = `cs_test_${randomUUID().replace(/-/g, "")}`;
  const booking = (await c.query(
    `insert into bookings (user_id, instructor_id, lesson_id, mode, starts_at, ends_at, status, hold_expires_at, price_satang)
     values ($1,$2,$3,'online',$4,$5,'pending_payment', now() + interval '35 min', 120000) returning id`,
    [ctx.u, ctx.i, ctx.l, start.toISOString(), end.toISOString()],
  )).rows[0].id;
  await c.query(`insert into payments (user_id, booking_id, provider, provider_ref, amount_satang, status) values ($1,$2,'stripe',$3,120000,'pending')`, [ctx.u, booking, sessionId]);

  const event = (id: string, type: string, obj: object) => JSON.stringify({ id, object: "event", type, data: { object: obj }, api_version: "2025-01-01", created: Math.floor(Date.now() / 1000) });
  const send = (payload: string, sig?: string) =>
    POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: payload, headers: { "stripe-signature": sig ?? stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET! }) } }));
  const status = async () => (await c.query(`select status from bookings where id=$1`, [booking])).rows[0].status;

  const evtId = `evt_${randomUUID()}`;
  const completed = event(evtId, "checkout.session.completed", { id: sessionId, object: "checkout.session", payment_status: "paid", payment_method_types: ["promptpay"], payment_intent: "pi_test_1", amount_total: 120000, currency: "thb" });

  let r = await send(completed, "t=1,v1=bad");
  assert.equal(r.status, 400); assert.equal(await status(), "pending_payment"); ok("bad signature → 400, booking untouched");

  const unpaid = event(`evt_${randomUUID()}`, "checkout.session.completed", { id: sessionId, object: "checkout.session", payment_status: "unpaid" });
  r = await send(unpaid);
  assert.equal(r.status, 200); assert.equal(await status(), "pending_payment"); ok("completed-but-unpaid (PromptPay pending) does not confirm");

  r = await send(completed);
  assert.equal(r.status, 200); assert.equal(await status(), "confirmed"); ok("signed + paid → booking confirmed");
  const pay = (await c.query(`select status, method from payments where provider_ref=$1`, [sessionId])).rows[0];
  assert.deepEqual(pay, { status: "succeeded", method: "promptpay" }); ok("payment marked succeeded (promptpay)");

  r = await send(completed);
  assert.equal((await r.json()).duplicate, true); ok("replayed event is ignored (idempotent)");

  // subscriptions: created → updated (plan change, cancel at period end) → deleted
  const subId = `sub_test_${randomUUID().replace(/-/g, "")}`;
  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 86400;
  const subObj = (plan: string, status: string, cancel = false) => ({ id: subId, object: "subscription", customer: "cus_test_1", status, cancel_at_period_end: cancel,
    metadata: { user_id: ctx.u, plan }, items: { object: "list", data: [{ id: "si_1", price: { id: "price_not_in_db" }, current_period_end: periodEnd }] } });
  const subRow = async () => (await c.query(`select plan_code, status, cancel_at_period_end, extract(epoch from current_period_end)::int pe from subscriptions where provider_subscription_id=$1`, [subId])).rows[0];
  await c.query(`insert into subscriptions (user_id, plan_code, status, provider, current_period_end) values ($1,'member','active','demo', now() + interval '1 month')`, [ctx.u]);
  r = await send(event(`evt_${randomUUID()}`, "customer.subscription.created", subObj("member", "active")));
  assert.equal(r.status, 200);
  assert.deepEqual(await subRow(), { plan_code: "member", status: "active", cancel_at_period_end: false, pe: periodEnd }); ok("subscription.created → active member, period end from item");
  const live = (await c.query(`select count(*)::int n from subscriptions where user_id=$1 and status in ('trialing','active','past_due','incomplete')`, [ctx.u])).rows[0].n;
  assert.equal(live, 1); ok("older demo subscription retired (one live subscription per user)");
  r = await send(event(`evt_${randomUUID()}`, "customer.subscription.updated", subObj("artist_pro", "active", true)));
  assert.deepEqual(await subRow(), { plan_code: "artist_pro", status: "active", cancel_at_period_end: true, pe: periodEnd }); ok("subscription.updated → plan change + cancel at period end");
  r = await send(event(`evt_${randomUUID()}`, "customer.subscription.updated", subObj("artist_pro", "unpaid")));
  assert.equal((await subRow()).status, "past_due"); ok("unpaid maps to past_due");
  r = await send(event(`evt_${randomUUID()}`, "customer.subscription.deleted", subObj("artist_pro", "canceled")));
  assert.equal((await subRow()).status, "cancelled"); ok("subscription.deleted → cancelled");
  await c.query(`delete from subscriptions where user_id=$1`, [ctx.u]);

  await c.query(`delete from payments where booking_id=$1`, [booking]);
  await c.query(`delete from bookings where id=$1`, [booking]);
  await c.query(`delete from webhook_events where id like 'evt_%' and type like 'checkout.%' and received_at > now() - interval '5 min'`).catch(() => {});
  console.log(`\nStripe webhook: ${passed} checks passed`);
  await c.end();
  process.exit(0);
})().catch((e) => { console.error("WEBHOOK TEST FAILED:", e); process.exit(1); });
