import "server-only";
import { randomUUID } from "node:crypto";
import { q, q1, tx, isPgError, type Tx } from "../db";
import { env, services } from "../env";
import { createVideoRoom, notify, sendEmail, stripe } from "../integrations";
import { availableSlots, CHECKOUT_HOLD_MINUTES, FREE_CANCEL_HOURS, HOLD_MINUTES } from "./slots";
import { lp, tr, type Locale } from "../i18n/config";
import { dateTime } from "../i18n/format";

export class BookingError extends Error {
  constructor(public code: "slot_taken" | "not_found" | "invalid" | "expired" | "forbidden" | "too_late" | "not_connected" | "too_many_holds") {
    super(code);
  }
}

export type BookingRow = {
  id: string; user_id: string; instructor_id: string; lesson_id: string; studio_id: string | null;
  mode: "in_person" | "online"; starts_at: string; ends_at: string; status: string; hold_expires_at: string | null;
  price_satang: number; discount_satang: number; currency: string; coupon_id: string | null; meeting_url: string | null;
  language: string | null; genre: string | null; level: string | null; equipment: string | null; notes: string | null;
  user_timezone: string | null;
};

/** Mark stale holds as expired so they no longer block the exclusion constraint. */
export async function expireStaleHolds(c?: Pick<Tx, "query">) {
  const sql = `update bookings set status='expired' where status in ('held','pending_payment') and hold_expires_at < now()`;
  if (c) await c.query(sql);
  else await q(sql);
}

export async function createHold(input: {
  userId: string;
  lessonId: string;
  instructorId: string;
  startsAt: string;
  genre?: string; level?: string; equipment?: string; language?: string; notes?: string; userTimezone?: string;
}): Promise<string> {
  try {
    return await tx(async (c) => {
      await expireStaleHolds(c);
      const lesson = (await c.query(`select * from lessons where id=$1 and is_active`, [input.lessonId])).rows[0];
      if (!lesson) throw new BookingError("invalid");
      // release this user's previous unpaid holds (going back in the flow should not hoard slots)
      await c.query(`update bookings set status='expired' where user_id=$1 and status='held'`, [input.userId]);
      const active = await c.query(
        `select count(*)::int n from bookings where user_id=$1 and status='pending_payment' and hold_expires_at > now()`,
        [input.userId],
      );
      if (active.rows[0].n >= 3) throw new BookingError("too_many_holds");

      const slots = await availableSlots({
        instructorId: input.instructorId, mode: lesson.mode, durationMin: lesson.duration_min,
        fromDate: new Date(new Date(input.startsAt).getTime() - 60_000), days: 1, db: c,
      });
      const slot = slots.find((s) => s.start === new Date(input.startsAt).toISOString());
      if (!slot) throw new BookingError("slot_taken");

      let studioId: string | null = null;
      if (lesson.mode === "in_person") {
        const st = await c.query(`select id from studios where is_active order by created_at limit 1`);
        studioId = st.rows[0]?.id ?? null;
      }
      const r = await c.query(
        `insert into bookings (user_id, instructor_id, lesson_id, studio_id, mode, starts_at, ends_at, status, hold_expires_at,
                               genre, level, equipment, language, notes, user_timezone, price_satang, currency)
         values ($1,$2,$3,$4,$5,$6,$7,'held', now() + ($8 || ' minutes')::interval, $9,$10,$11,$12,$13,$14,$15,$16) returning id`,
        [input.userId, input.instructorId, lesson.id, studioId, lesson.mode, slot.start, slot.end, String(HOLD_MINUTES),
          input.genre ?? null, input.level ?? null, input.equipment ?? null, input.language ?? null,
          input.notes?.slice(0, 1000) ?? null, input.userTimezone ?? null, lesson.price_satang, lesson.currency],
      );
      return r.rows[0].id as string;
    });
  } catch (e) {
    // 23P01 = exclusion_violation: someone else got the slot in the same instant
    if (isPgError(e, "23P01")) throw new BookingError("slot_taken");
    throw e;
  }
}

export async function getBookingForUser(bookingId: string, userId: string) {
  return q1<BookingRow & { lesson_title: Record<string, string>; duration_min: number; is_provisional: boolean; dj_name: string; instructor_tz: string; studio_name: string | null }>(
    `select b.*, l.title lesson_title, l.duration_min, l.is_provisional, i.dj_name, i.timezone instructor_tz, s.name studio_name
       from bookings b join lessons l on l.id=b.lesson_id join instructors i on i.id=b.instructor_id
       left join studios s on s.id=b.studio_id
      where b.id=$1 and b.user_id=$2`,
    [bookingId, userId],
  );
}

export async function applyCoupon(bookingId: string, userId: string, code: string): Promise<boolean> {
  const b = await q1<BookingRow>(`select * from bookings where id=$1 and user_id=$2 and status='held'`, [bookingId, userId]);
  if (!b) throw new BookingError("not_found");
  const c = await q1<{ id: string; percent_off: number | null; amount_off_satang: number | null }>(
    `select id, percent_off, amount_off_satang from coupons
      where upper(code)=upper($1) and is_active and (valid_until is null or valid_until > now())
        and (max_redemptions is null or redemptions < max_redemptions)`,
    [code.trim()],
  );
  if (!c) return false;
  const discount = c.percent_off ? Math.round((b.price_satang * c.percent_off) / 100) : Math.min(c.amount_off_satang ?? 0, b.price_satang);
  await q(`update bookings set coupon_id=$2, discount_satang=$3 where id=$1`, [bookingId, c.id, discount]);
  return true;
}

/** Step 4. Returns a URL to send the user to (Stripe Checkout, demo page, or completion page for free lessons). */
export async function startCheckout(bookingId: string, userId: string, locale: Locale): Promise<string> {
  const b = await getBookingForUser(bookingId, userId);
  if (!b) throw new BookingError("not_found");
  if (b.status !== "held" || !b.hold_expires_at || new Date(b.hold_expires_at) < new Date()) throw new BookingError("expired");
  const amount = Math.max(0, b.price_satang - b.discount_satang);
  const done = `${env.siteUrl}${lp(locale, `/booking/complete?b=${b.id}`)}`;

  if (amount === 0) {
    const ref = `free_${randomUUID()}`;
    await q(
      `insert into payments (user_id, booking_id, provider, provider_ref, amount_satang, currency, status, method)
       values ($1,$2,'demo',$3,0,$4,'pending','free')`,
      [userId, b.id, ref, b.currency],
    );
    await q(`update bookings set status='pending_payment' where id=$1`, [b.id]);
    await markPaymentSucceeded(ref, { method: "free" });
    return done;
  }

  if (services.stripe) {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      // card (incl. debit) + PromptPay; enable both in the Stripe dashboard (Thai account)
      allowed_payment_method_types: ["card", "promptpay"],
      customer_email: (await q1<{ email: string }>(`select email from users where id=$1`, [userId]))?.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: b.currency.toLowerCase(),
          unit_amount: amount,
          product_data: { name: `${tr(b.lesson_title, locale)} — ${dateTime(b.starts_at, locale, b.instructor_tz)}` },
        },
      }],
      metadata: { booking_id: b.id, user_id: userId },
      payment_intent_data: { metadata: { booking_id: b.id } },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: done,
      cancel_url: `${env.siteUrl}${lp(locale, `/booking/complete?b=${b.id}&cancelled=1`)}`,
      locale: locale === "ja" ? "ja" : locale === "th" ? "th" : "en",
    });
    await tx(async (c) => {
      await c.query(
        `insert into payments (user_id, booking_id, provider, provider_ref, amount_satang, currency, status)
         values ($1,$2,'stripe',$3,$4,$5,'pending')`,
        [userId, b.id, session.id, amount, b.currency],
      );
      await c.query(
        `update bookings set status='pending_payment', hold_expires_at = now() + ($2 || ' minutes')::interval where id=$1`,
        [b.id, String(CHECKOUT_HOLD_MINUTES)],
      );
    });
    return session.url!;
  }

  if (services.demoPayments) {
    const ref = `demo_${randomUUID()}`;
    await tx(async (c) => {
      await c.query(
        `insert into payments (user_id, booking_id, provider, provider_ref, amount_satang, currency, status)
         values ($1,$2,'demo',$3,$4,$5,'pending')`,
        [userId, b.id, ref, amount, b.currency],
      );
      await c.query(`update bookings set status='pending_payment' where id=$1`, [b.id]);
    });
    return `${done}&demo=1`;
  }

  throw new BookingError("not_connected");
}

/**
 * Called ONLY from server-verified sources: the signature-checked Stripe webhook,
 * the demo-payment action (dev only, Stripe not configured), or free bookings.
 */
export async function markPaymentSucceeded(providerRef: string, info: { method?: string; raw?: unknown; paymentIntent?: string }) {
  let refundNeeded = false;
  const result = await tx(async (c) => {
    const p = (await c.query(`select * from payments where provider_ref=$1 for update`, [providerRef])).rows[0];
    if (!p) throw new BookingError("not_found");
    if (p.status === "succeeded") return { bookingId: p.booking_id as string, already: true };
    await c.query(
      `update payments set status='succeeded', method=coalesce($2, method), raw=$3 where id=$1`,
      [p.id, info.method ?? null, info.raw ? JSON.stringify({ ...(info.raw as object), payment_intent: info.paymentIntent }) : p.raw],
    );
    await c.query(
      `update coupons set redemptions = redemptions + 1 where id = (select coupon_id from bookings where id=$1)`,
      [p.booking_id],
    );
    await c.query("savepoint confirm");
    try {
      await c.query(
        `update bookings set status='confirmed', hold_expires_at=null
          where id=$1 and status in ('held','pending_payment','expired','payment_failed')`,
        [p.booking_id],
      );
      await c.query("release savepoint confirm");
    } catch (e) {
      if (!isPgError(e, "23P01")) throw e;
      // Paid after the hold expired and someone else took the slot -> cancel + refund.
      await c.query("rollback to savepoint confirm");
      await c.query(
        `update bookings set status='cancelled', cancelled_at=now(), cancel_reason='slot_conflict_after_payment' where id=$1`,
        [p.booking_id],
      );
      refundNeeded = true;
    }
    return { bookingId: p.booking_id as string, already: false };
  });
  if (refundNeeded) {
    await refundBooking(result.bookingId, null, "slot_conflict_after_payment");
    return result;
  }
  if (!result.already) await afterConfirmed(result.bookingId);
  return result;
}

export async function markPaymentFailed(providerRef: string, status: "failed" | "expired") {
  await tx(async (c) => {
    const p = (await c.query(`select * from payments where provider_ref=$1 for update`, [providerRef])).rows[0];
    if (!p || p.status !== "pending") return;
    await c.query(`update payments set status=$2 where id=$1`, [p.id, status]);
    await c.query(
      `update bookings set status=$2 where id=$1 and status in ('held','pending_payment')`,
      [p.booking_id, status === "expired" ? "expired" : "payment_failed"],
    );
  });
}

async function afterConfirmed(bookingId: string) {
  const b = await q1<BookingRow & { email: string; locale: Locale; title: Record<string, string>; timezone: string }>(
    `select b.*, u.email, u.locale, l.title, coalesce(b.user_timezone, u.timezone) timezone
       from bookings b join users u on u.id=b.user_id join lessons l on l.id=b.lesson_id where b.id=$1`,
    [bookingId],
  );
  if (!b) return;
  if (b.mode === "online" && !b.meeting_url) {
    const url = await createVideoRoom(b.id, b.starts_at, b.ends_at).catch(() => null);
    if (url) await q(`update bookings set meeting_provider='daily', meeting_url=$2 where id=$1`, [b.id, url]);
  }
  await notify(b.user_id, "booking_confirmed", { booking_id: b.id, starts_at: b.starts_at });
  const when = dateTime(b.starts_at, b.locale, b.timezone);
  const subject = { en: "Booking confirmed", ja: "予約が確定しました", th: "ยืนยันการจองแล้ว" }[b.locale] ?? "Booking confirmed";
  await sendEmail(b.email, `THE DJ COLLECTIVE — ${subject}`, `${tr(b.title, b.locale)}\n${when}\n${env.siteUrl}${lp(b.locale, "/app/my-lessons")}`).catch(() => false);
}

/** Refund the succeeded payment of a booking (full amount). */
export async function refundBooking(bookingId: string, actorId: string | null, reason: string) {
  const p = await q1<{ id: string; provider: string; provider_ref: string; amount_satang: number; raw: { payment_intent?: string } | null }>(
    `select * from payments where booking_id=$1 and status='succeeded' order by created_at desc limit 1`,
    [bookingId],
  );
  if (!p) return false;
  if (p.provider === "stripe") {
    const pi = p.raw?.payment_intent;
    if (!pi) throw new Error("missing payment_intent for refund");
    await stripe().refunds.create({ payment_intent: pi, metadata: { booking_id: bookingId, reason } });
    // final state is written by the charge.refunded webhook as well (idempotent)
  }
  await q(`update payments set status='refunded', refunded_satang=amount_satang where id=$1`, [p.id]);
  await q(
    `update bookings set status='refunded', cancelled_at=coalesce(cancelled_at, now()), cancel_reason=coalesce(cancel_reason,$2) where id=$1`,
    [bookingId, reason],
  );
  if (actorId) await q(`insert into audit_logs (actor_id, action, target_type, target_id) values ($1,'booking.refund','booking',$2)`, [actorId, bookingId]);
  return true;
}

export async function cancelBooking(bookingId: string, actor: { id: string; role: string }, reason = "user_cancelled") {
  const b = await q1<BookingRow & { instructor_user: string | null }>(
    `select b.*, i.user_id instructor_user from bookings b join instructors i on i.id=b.instructor_id where b.id=$1`,
    [bookingId],
  );
  if (!b) throw new BookingError("not_found");
  const isOwner = b.user_id === actor.id;
  const isStaff = actor.role === "admin" || b.instructor_user === actor.id;
  if (!isOwner && !isStaff) throw new BookingError("forbidden");
  if (["cancelled", "refunded", "expired", "completed", "payment_failed"].includes(b.status)) return b.status;

  if (b.status === "held" || b.status === "pending_payment") {
    await q(`update bookings set status='cancelled', cancelled_at=now(), cancel_reason=$2 where id=$1`, [b.id, reason]);
    return "cancelled";
  }
  const hoursLeft = (new Date(b.starts_at).getTime() - Date.now()) / 3600_000;
  const refundable = isStaff || hoursLeft >= FREE_CANCEL_HOURS;
  if (isOwner && !isStaff && hoursLeft < FREE_CANCEL_HOURS) {
    // inside the window: cancel without refund (policy is provisional — see /refund)
    await q(`update bookings set status='cancelled', cancelled_at=now(), cancel_reason='late_cancel_no_refund' where id=$1`, [b.id]);
    return "cancelled";
  }
  if (refundable) {
    await q(`update bookings set status='cancelled', cancelled_at=now(), cancel_reason=$2 where id=$1`, [b.id, reason]);
    const refunded = await refundBooking(b.id, isStaff ? actor.id : null, reason);
    await notify(b.user_id, "booking_cancelled", { booking_id: b.id, refunded });
    return refunded ? "refunded" : "cancelled";
  }
  return b.status;
}

export async function rescheduleBooking(bookingId: string, userId: string, newStart: string): Promise<string> {
  try {
    return await tx(async (c) => {
      const b = (await c.query(`select * from bookings where id=$1 and user_id=$2 for update`, [bookingId, userId])).rows[0] as BookingRow | undefined;
      if (!b || b.status !== "confirmed") throw new BookingError("not_found");
      if ((new Date(b.starts_at).getTime() - Date.now()) / 3600_000 < FREE_CANCEL_HOURS) throw new BookingError("too_late");
      await c.query(`update bookings set status='cancelled', cancelled_at=now(), cancel_reason='rescheduled' where id=$1`, [b.id]);
      const duration = (new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime()) / 60_000;
      const slots = await availableSlots({
        instructorId: b.instructor_id, mode: b.mode, durationMin: duration,
        fromDate: new Date(new Date(newStart).getTime() - 60_000), days: 1, db: c,
      });
      const slot = slots.find((s) => s.start === new Date(newStart).toISOString());
      if (!slot) throw new BookingError("slot_taken");
      const r = await c.query(
        `insert into bookings (user_id, instructor_id, lesson_id, studio_id, mode, starts_at, ends_at, status, genre, level, equipment,
                               language, notes, user_timezone, price_satang, discount_satang, currency, coupon_id, rescheduled_from)
         select user_id, instructor_id, lesson_id, studio_id, mode, $2, $3, 'confirmed', genre, level, equipment, language, notes,
                user_timezone, price_satang, discount_satang, currency, coupon_id, id from bookings where id=$1 returning id`,
        [b.id, slot.start, slot.end],
      );
      const newId = r.rows[0].id as string;
      await c.query(`update payments set booking_id=$2 where booking_id=$1`, [b.id, newId]);
      return newId;
    }).then(async (id) => {
      await afterConfirmed(id);
      return id;
    });
  } catch (e) {
    if (isPgError(e, "23P01")) throw new BookingError("slot_taken");
    throw e;
  }
}
