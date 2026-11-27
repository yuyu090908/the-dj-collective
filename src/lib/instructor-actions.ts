"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { q, q1 } from "./db";
import { assertInstructor } from "./guards";
import { cancelBooking } from "./booking/service";
import { zonedToUtc } from "./booking/tz";
import type { FormState } from "./auth/actions";

async function myInstructor() {
  const u = await assertInstructor();
  const i = await q1<{ id: string; timezone: string }>(`select id, timezone from instructors where user_id=$1`, [u.id]);
  if (!i) throw new Error("not linked");
  return { u, i };
}

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);

export async function addAvailabilityAction(_: FormState, fd: FormData): Promise<FormState> {
  const { i } = await myInstructor();
  const p = z.object({ weekday: z.coerce.number().int().min(0).max(6), start: hhmm, end: hhmm, mode: z.enum(["in_person", "online", "both"]) }).safeParse(Object.fromEntries(fd));
  if (!p.success || p.data.end <= p.data.start) return { error: "invalidInput" };
  await q(
    `insert into instructor_availability (instructor_id, weekday, start_time, end_time, mode, studio_id)
     values ($1,$2,$3,$4,$5,(select id from studios where is_active order by created_at limit 1))`,
    [i.id, p.data.weekday, p.data.start, p.data.end, p.data.mode],
  );
  revalidatePath("/[locale]/instructor/calendar", "page");
  return { ok: true };
}

export async function deleteAvailabilityAction(fd: FormData) {
  const { i } = await myInstructor();
  await q(`delete from instructor_availability where id=$1 and instructor_id=$2`, [String(fd.get("id")), i.id]);
  revalidatePath("/[locale]/instructor/calendar", "page");
}

export async function addTimeOffAction(_: FormState, fd: FormData): Promise<FormState> {
  const { i } = await myInstructor();
  const p = z.object({ from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().max(200).optional() }).safeParse(Object.fromEntries(fd));
  if (!p.success || p.data.to < p.data.from) return { error: "invalidInput" };
  const [fy, fm, fdd] = p.data.from.split("-").map(Number);
  const [ty, tm, td] = p.data.to.split("-").map(Number);
  const start = zonedToUtc(fy, fm, fdd, 0, 0, i.timezone);
  const end = new Date(zonedToUtc(ty, tm, td, 0, 0, i.timezone).getTime() + 86400_000);
  await q(`insert into instructor_time_off (instructor_id, starts_at, ends_at, reason) values ($1,$2,$3,$4)`, [i.id, start.toISOString(), end.toISOString(), p.data.reason ?? null]);
  revalidatePath("/[locale]/instructor/calendar", "page");
  return { ok: true };
}

export async function deleteTimeOffAction(fd: FormData) {
  const { i } = await myInstructor();
  await q(`delete from instructor_time_off where id=$1 and instructor_id=$2`, [String(fd.get("id")), i.id]);
  revalidatePath("/[locale]/instructor/calendar", "page");
}

export async function saveNotesAction(_: FormState, fd: FormData): Promise<FormState> {
  const { i } = await myInstructor();
  const notes = String(fd.get("notes") ?? "").slice(0, 5000);
  const r = await q(`update bookings set instructor_notes=$3 where id=$1 and instructor_id=$2 returning id`, [String(fd.get("bookingId")), i.id, notes]);
  if (!r.length) return { error: "forbidden" };
  if (fd.get("complete") === "on") {
    await q(`update bookings set status='completed' where id=$1 and instructor_id=$2 and status='confirmed' and starts_at < now()`, [String(fd.get("bookingId")), i.id]);
  }
  revalidatePath("/[locale]/instructor/lessons", "page");
  return { ok: true };
}

export async function instructorCancelAction(_: FormState, fd: FormData): Promise<FormState> {
  const { u } = await myInstructor();
  try {
    await cancelBooking(String(fd.get("bookingId")), { id: u.id, role: u.role }, "cancelled_by_instructor");
  } catch {
    return { error: "generic" };
  }
  revalidatePath("/[locale]/instructor/lessons", "page");
  return { ok: true };
}
