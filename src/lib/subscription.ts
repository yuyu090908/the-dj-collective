import "server-only";
import type Stripe from "stripe";
import { env, services } from "./env";
import { q, q1, tx } from "./db";
import { stripe } from "./integrations";
import { audit } from "./audit";
import { lp, type Locale } from "./i18n/config";

export class SubscriptionError extends Error {}

const STATUS: Record<string, string> = {
  active: "active", trialing: "trialing", past_due: "past_due", unpaid: "past_due",
  incomplete: "incomplete", incomplete_expired: "cancelled", canceled: "cancelled", paused: "cancelled",
};

async function customerFor(userId: string): Promise<string> {
  const u = await q1<{ email: string; stripe_customer_id: string | null }>(`select email, stripe_customer_id from users where id=$1`, [userId]);
  if (!u) throw new SubscriptionError("not_found");
  if (u.stripe_customer_id) return u.stripe_customer_id;
  const c = await stripe().customers.create({ email: u.email, metadata: { user_id: userId } });
  await q(`update users set stripe_customer_id=$2 where id=$1`, [userId, c.id]);
  return c.id;
}

/**
 * Start a monthly subscription. Returns a URL to redirect to.
 * - Stripe configured: Checkout (mode=subscription); access starts only when the webhook confirms it.
 * - DEMO_PAYMENTS: activates a clearly labelled demo subscription (provider='demo').
 * - otherwise: throws not_connected.
 */
export async function startSubscription(userId: string, planCode: string, locale: Locale): Promise<string> {
  const plan = await q1<{ code: string; name: string; price_satang: number; currency: string; stripe_price_id: string | null }>(
    `select code, name, price_satang, currency, stripe_price_id from plans where code=$1 and is_active and price_satang > 0`,
    [planCode],
  );
  if (!plan) throw new SubscriptionError("invalid_plan");
  const back = `${env.siteUrl}${lp(locale, "/app/subscription")}`;

  if (services.stripe) {
    const live = await q1(`select 1 from subscriptions where user_id=$1 and provider='stripe' and status in ('active','trialing','past_due')`, [userId]);
    if (live) return manageUrl(userId, locale); // plan changes go through the billing portal (proration handled by Stripe)
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: await customerFor(userId),
      client_reference_id: userId,
      line_items: [plan.stripe_price_id
        ? { price: plan.stripe_price_id, quantity: 1 }
        : { quantity: 1, price_data: { currency: plan.currency.toLowerCase(), unit_amount: plan.price_satang, recurring: { interval: "month" }, product_data: { name: `THE DJ COLLECTIVE — ${plan.name}` } } }],
      metadata: { user_id: userId, plan: plan.code },
      subscription_data: { metadata: { user_id: userId, plan: plan.code } },
      success_url: `${back}?checkout=success`,
      cancel_url: `${back}?checkout=cancelled`,
      locale: locale === "ja" ? "ja" : locale === "th" ? "th" : "en",
    });
    return session.url!;
  }

  if (services.demoPayments) {
    await tx(async (c) => {
      await c.query(`update subscriptions set status='cancelled', updated_at=now() where user_id=$1 and status in ('trialing','active','past_due','incomplete')`, [userId]);
      await c.query(
        `insert into subscriptions (user_id, plan_code, status, provider, current_period_end) values ($1,$2,'active','demo', now() + interval '1 month')`,
        [userId, plan.code],
      );
    });
    await audit(userId, "subscription.demo_activate", "plan", plan.code);
    return `${back}?checkout=demo`;
  }
  throw new SubscriptionError("not_connected");
}

/** Stripe Billing Portal (change plan, update card, cancel). */
export async function manageUrl(userId: string, locale: Locale): Promise<string> {
  if (!services.stripe) throw new SubscriptionError("not_connected");
  const s = await stripe().billingPortal.sessions.create({
    customer: await customerFor(userId),
    return_url: `${env.siteUrl}${lp(locale, "/app/subscription")}`,
    locale: locale === "ja" ? "ja" : locale === "th" ? "th" : "en",
  });
  return s.url;
}

export async function cancelDemoSubscription(userId: string) {
  await q(`update subscriptions set cancel_at_period_end = true, updated_at=now() where user_id=$1 and provider='demo' and status='active'`, [userId]);
  await audit(userId, "subscription.demo_cancel");
}

/** Webhook: mirror a Stripe subscription into our table. Idempotent. */
export async function syncStripeSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.user_id
    ?? (await q1<{ id: string }>(`select id from users where stripe_customer_id=$1`, [typeof sub.customer === "string" ? sub.customer : sub.customer.id]))?.id;
  if (!userId) throw new Error(`no user for subscription ${sub.id}`);
  const priceId = sub.items?.data?.[0]?.price?.id;
  const byPrice = priceId ? await q1<{ code: string }>(`select code from plans where stripe_price_id=$1`, [priceId]) : null;
  const plan = byPrice?.code ?? sub.metadata?.plan ?? "member";
  const status = STATUS[sub.status] ?? "incomplete";
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  await tx(async (c) => {
    if (["active", "trialing", "past_due", "incomplete"].includes(status)) {
      // one live subscription per user: retire any other (e.g. an old demo one)
      await c.query(
        `update subscriptions set status='cancelled', updated_at=now()
          where user_id=$1 and status in ('trialing','active','past_due','incomplete') and coalesce(provider_subscription_id,'') <> $2`,
        [userId, sub.id],
      );
    }
    await c.query(
      `insert into subscriptions (user_id, plan_code, status, provider, provider_subscription_id, current_period_end, cancel_at_period_end)
       values ($1,$2,$3,'stripe',$4, to_timestamp($5), $6)
       on conflict (provider_subscription_id) do update
         set plan_code=excluded.plan_code, status=excluded.status, current_period_end=excluded.current_period_end,
             cancel_at_period_end=excluded.cancel_at_period_end, updated_at=now()`,
      [userId, plan, status, sub.id, periodEnd ?? null, sub.cancel_at_period_end],
    );
  });
  await audit(null, `subscription.${status}`, "subscription", sub.id, { plan });
}
