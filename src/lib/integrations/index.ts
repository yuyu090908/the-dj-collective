import "server-only";
import Stripe from "stripe";
import { env, services } from "../env";
import { q } from "../db";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (!services.stripe) throw new Error("Stripe is not configured");
  _stripe ??= new Stripe(env.stripeSecret);
  return _stripe;
}

/** Daily.co room for an online lesson. Returns null when Daily is not configured. */
export async function createVideoRoom(bookingId: string, startsAt: string, endsAt: string): Promise<string | null> {
  if (!services.daily) return null;
  const nbf = Math.floor(new Date(startsAt).getTime() / 1000) - 15 * 60;
  const exp = Math.floor(new Date(endsAt).getTime() / 1000) + 30 * 60;
  const res = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.dailyApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `djc-${bookingId.slice(0, 8)}-${Date.now().toString(36)}`,
      privacy: "private",
      properties: { nbf, exp, enable_screenshare: true, enable_chat: true, max_participants: 4 },
    }),
  });
  if (!res.ok) {
    console.error("daily room failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  const j = (await res.json()) as { url?: string };
  return j.url ?? null;
}

/** Transactional email via Resend. No-op (returns false) when not configured. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!services.email) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to, subject, text }),
  });
  return res.ok;
}

export async function notify(userId: string, kind: string, payload: Record<string, unknown>) {
  await q(`insert into notifications (user_id, kind, payload) values ($1,$2,$3)`, [userId, kind, payload]);
}
