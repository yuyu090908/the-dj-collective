import { env } from "@/lib/env";
import { q } from "@/lib/db";
import { notify, sendEmail } from "@/lib/integrations";
import { expireStaleHolds } from "@/lib/booking/service";
import { dateTime } from "@/lib/i18n/format";
import { lp, type Locale } from "@/lib/i18n/config";

/**
 * Run every 15 minutes (e.g. Vercel Cron) with `Authorization: Bearer $CRON_SECRET`.
 * - expires stale holds
 * - sends 24h reminders once per booking
 */
export async function GET(req: Request) {
  if (!env.cronSecret || req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  await expireStaleHolds();
  const due = await q<{ id: string; user_id: string; email: string; locale: Locale; starts_at: string; tz: string }>(
    `update bookings b set reminder_sent_at = now()
       from users u
      where u.id = b.user_id and b.status='confirmed' and b.reminder_sent_at is null
        and b.starts_at between now() and now() + interval '24 hours'
      returning b.id, b.user_id, u.email, u.locale, b.starts_at, coalesce(b.user_timezone, u.timezone) tz`,
  );
  for (const b of due) {
    await notify(b.user_id, "booking_reminder", { booking_id: b.id, starts_at: b.starts_at });
    const subject = { en: "Lesson reminder", ja: "レッスンのリマインダー", th: "แจ้งเตือนบทเรียน" }[b.locale];
    await sendEmail(b.email, `THE DJ COLLECTIVE — ${subject}`, `${dateTime(b.starts_at, b.locale, b.tz)}\n${env.siteUrl}${lp(b.locale, "/app/my-lessons")}`).catch(() => false);
  }
  return Response.json({ reminders: due.length });
}
