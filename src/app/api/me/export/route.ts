import { getSessionUser } from "@/lib/auth/session";
import { q, q1 } from "@/lib/db";

/** PDPA data portability: everything we hold about the signed-in user. */
export async function GET() {
  const u = await getSessionUser();
  if (!u) return new Response("unauthorized", { status: 401 });
  const [user, profile, bookings, payments, consents, notifications, uploads, messages] = await Promise.all([
    q1(`select id, email, role, locale, timezone, created_at from users where id=$1`, [u.id]),
    q1(`select * from profiles where user_id=$1`, [u.id]),
    q(`select id, mode, starts_at, ends_at, status, genre, level, language, price_satang, currency, created_at from bookings where user_id=$1`, [u.id]),
    q(`select id, provider, amount_satang, currency, status, method, created_at from payments where user_id=$1`, [u.id]),
    q(`select kind, granted, version, created_at from consent_records where user_id=$1`, [u.id]),
    q(`select kind, payload, created_at from notifications where user_id=$1`, [u.id]),
    q(`select id, filename, size_bytes, visibility, created_at from audio_uploads where user_id=$1`, [u.id]),
    q(`select id, sender_id, recipient_id, body, created_at from messages where sender_id=$1 or recipient_id=$1`, [u.id]),
  ]);
  return new Response(JSON.stringify({ exported_at: new Date().toISOString(), user, profile, bookings, payments, consents, notifications, uploads, messages }, null, 2), {
    headers: { "content-type": "application/json", "content-disposition": `attachment; filename="djc-data-${u.id.slice(0, 8)}.json"` },
  });
}
