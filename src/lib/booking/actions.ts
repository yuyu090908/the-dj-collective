"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { availableSlots, type Slot } from "./slots";
import { applyCoupon, BookingError, cancelBooking, createHold, markPaymentSucceeded, rescheduleBooking, startCheckout } from "./service";
import { getSessionUser } from "../auth/session";
import { q1 } from "../db";
import { services } from "../env";
import { rateLimit } from "../rate-limit";
import { isLocale, lp, type Locale } from "../i18n/config";
import { isValidTimeZone } from "./tz";
import type { FormState } from "../auth/actions";

const loc = (v: unknown): Locale => (typeof v === "string" && isLocale(v) ? v : "en");

export async function getSlotsAction(instructorId: string, lessonId: string, fromIso?: string, days = 14): Promise<Slot[]> {
  const lesson = await q1<{ mode: "in_person" | "online"; duration_min: number }>(
    `select mode, duration_min from lessons where id=$1 and is_active`,
    [lessonId],
  );
  if (!lesson || !/^[0-9a-f-]{36}$/.test(instructorId)) return [];
  const from = fromIso ? new Date(fromIso) : undefined;
  return availableSlots({ instructorId, mode: lesson.mode, durationMin: lesson.duration_min, fromDate: from && !isNaN(+from) ? from : undefined, days: Math.min(days, 31) });
}

const holdSchema = z.object({
  lessonId: z.string().uuid(),
  instructorId: z.string().uuid(),
  startsAt: z.string().datetime(),
  genre: z.string().max(40).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  equipment: z.string().max(40).optional(),
  language: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
  userTimezone: z.string().max(64).optional(),
  locale: z.string(),
});

export async function holdAction(input: z.infer<typeof holdSchema>): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "login" };
  if (!rateLimit(`hold:${user.id}`, 20, 60_000)) return { ok: false, error: "rateLimited" };
  const p = holdSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalidInput" };
  const d = p.data;
  try {
    const bookingId = await createHold({
      userId: user.id,
      lessonId: d.lessonId,
      instructorId: d.instructorId,
      startsAt: d.startsAt,
      genre: d.genre, level: d.level, equipment: d.equipment, language: d.language, notes: d.notes,
      userTimezone: d.userTimezone && isValidTimeZone(d.userTimezone) ? d.userTimezone : undefined,
    });
    return { ok: true, bookingId };
  } catch (e) {
    if (e instanceof BookingError) return { ok: false, error: e.code };
    console.error(e);
    return { ok: false, error: "generic" };
  }
}

export async function couponAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "generic" };
  if (!rateLimit(`coupon:${user.id}`, 10, 60_000)) return { error: "rateLimited" };
  const ok = await applyCoupon(String(fd.get("bookingId")), user.id, String(fd.get("code") ?? "")).catch(() => false);
  revalidatePath("/[locale]/booking/review", "page");
  return ok ? { ok: true } : { error: "invalidCoupon" };
}

export async function checkoutAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getSessionUser();
  const locale = loc(fd.get("locale"));
  if (!user) return { error: "generic" };
  let url: string;
  try {
    url = await startCheckout(String(fd.get("bookingId")), user.id, locale);
  } catch (e) {
    if (e instanceof BookingError) return { error: e.code };
    console.error(e);
    return { error: "generic" };
  }
  redirect(url);
}

/** Demo-only: simulates the provider callback. Disabled whenever Stripe is configured or DEMO_PAYMENTS!=1. */
export async function demoPayAction(fd: FormData) {
  const locale = loc(fd.get("locale"));
  const bookingId = String(fd.get("bookingId"));
  const user = await getSessionUser();
  if (!user || !services.demoPayments) redirect(lp(locale, "/booking"));
  const p = await q1<{ provider_ref: string }>(
    `select provider_ref from payments where booking_id=$1 and user_id=$2 and provider='demo' and status='pending' order by created_at desc limit 1`,
    [bookingId, user.id],
  );
  if (p) await markPaymentSucceeded(p.provider_ref, { method: "demo" });
  redirect(lp(locale, `/booking/complete?b=${bookingId}`));
}

export async function cancelBookingAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "generic" };
  try {
    await cancelBooking(String(fd.get("bookingId")), { id: user.id, role: user.role }, "user_cancelled");
  } catch (e) {
    return { error: e instanceof BookingError ? e.code : "generic" };
  }
  revalidatePath("/[locale]/app/my-lessons", "page");
  return { ok: true };
}

export async function rescheduleAction(bookingId: string, newStart: string, locale: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "generic" };
  try {
    await rescheduleBooking(bookingId, user.id, newStart);
  } catch (e) {
    return { ok: false, error: e instanceof BookingError ? e.code : "generic" };
  }
  revalidatePath(lp(loc(locale), "/app/my-lessons"));
  return { ok: true };
}
