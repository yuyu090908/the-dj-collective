import type Stripe from "stripe";
import { env, services } from "@/lib/env";
import { stripe } from "@/lib/integrations";
import { q, q1 } from "@/lib/db";
import { markPaymentFailed, markPaymentSucceeded } from "@/lib/booking/service";
import { syncStripeSubscription } from "@/lib/subscription";

/**
 * Stripe webhook. The ONLY place a real payment can confirm a booking.
 * - Signature verified with STRIPE_WEBHOOK_SECRET against the raw body.
 * - Idempotent: each event id is processed once (webhook_events).
 */
export async function POST(req: Request) {
  if (!services.stripe) return new Response("stripe not configured", { status: 503 });
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig ?? "", env.stripeWebhookSecret);
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  const fresh = await q(`insert into webhook_events (id, provider, type) values ($1,'stripe',$2) on conflict do nothing returning id`, [event.id, event.type]);
  if (!fresh.length) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription") {
          if (s.subscription) {
            const id = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
            await syncStripeSubscription(await stripe().subscriptions.retrieve(id));
          }
          break;
        }
        if (s.payment_status === "paid") {
          await markPaymentSucceeded(s.id, {
            method: s.payment_method_types?.[0],
            paymentIntent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id,
            raw: { session: s.id, amount_total: s.amount_total, currency: s.currency },
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.async_payment_failed":
        await markPaymentFailed((event.data.object as Stripe.Checkout.Session).id, "failed");
        break;
      case "checkout.session.expired":
        if ((event.data.object as Stripe.Checkout.Session).mode === "subscription") break;
        await markPaymentFailed((event.data.object as Stripe.Checkout.Session).id, "expired");
        break;
      case "charge.refunded": {
        const ch = event.data.object as Stripe.Charge;
        const pi = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
        if (pi) {
          const p = await q1<{ id: string; booking_id: string }>(`select id, booking_id from payments where raw->>'payment_intent'=$1`, [pi]);
          if (p) {
            await q(`update payments set status='refunded', refunded_satang=$2 where id=$1`, [p.id, ch.amount_refunded]);
            await q(`update bookings set status='refunded' where id=$1 and status in ('cancelled','refunded')`, [p.booking_id]);
          }
        }
        break;
      }
    }
  } catch (e) {
    // let Stripe retry: forget the event so the retry is processed
    await q(`delete from webhook_events where id=$1`, [event.id]);
    console.error("stripe webhook failed", event.type, e);
    return new Response("handler error", { status: 500 });
  }
  return Response.json({ received: true });
}
