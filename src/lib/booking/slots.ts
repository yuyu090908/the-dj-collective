import "server-only";
import type { Tx } from "../db";
import { pool } from "../db";
import { zonedParts, zonedToUtc } from "./tz";

export const SLOT_STEP_MIN = 30;
export const LEAD_TIME_HOURS = 12;
export const HOLD_MINUTES = 10;
export const CHECKOUT_HOLD_MINUTES = 35;
export const FREE_CANCEL_HOURS = 24;

/** SQL predicate for bookings that occupy the instructor's time right now. */
export const ACTIVE_BOOKING_SQL = `(status in ('confirmed','completed') or (status in ('held','pending_payment') and hold_expires_at > now()))`;

export type Slot = { start: string; end: string };

type Runner = Pick<Tx, "query">;

export async function availableSlots(opts: {
  instructorId: string;
  mode: "in_person" | "online";
  durationMin: number;
  fromDate?: Date;
  days?: number;
  db?: Runner;
}): Promise<Slot[]> {
  const db = opts.db ?? pool();
  const days = Math.min(opts.days ?? 14, 60);
  const now = new Date();
  const from = opts.fromDate && opts.fromDate > now ? opts.fromDate : now;
  const until = new Date(from.getTime() + days * 86400_000);

  const inst = await db.query(`select timezone from instructors where id=$1 and is_published`, [opts.instructorId]);
  if (!inst.rowCount) return [];
  const tz: string = inst.rows[0].timezone;

  const rules = (
    await db.query(
      `select weekday, to_char(start_time,'HH24:MI') s, to_char(end_time,'HH24:MI') e, mode
         from instructor_availability where instructor_id=$1 and (mode='both' or mode=$2)`,
      [opts.instructorId, opts.mode],
    )
  ).rows as { weekday: number; s: string; e: string }[];

  const busy = (
    await db.query(
      `select starts_at, ends_at from bookings where instructor_id=$1 and ends_at > $2 and starts_at < $3 and ${ACTIVE_BOOKING_SQL}
       union all
       select starts_at, ends_at from instructor_time_off where instructor_id=$1 and ends_at > $2 and starts_at < $3`,
      [opts.instructorId, from.toISOString(), until.toISOString()],
    )
  ).rows.map((r) => [new Date(r.starts_at).getTime(), new Date(r.ends_at).getTime()] as const);

  const earliest = now.getTime() + LEAD_TIME_HOURS * 3600_000;
  const out: Slot[] = [];
  for (let i = 0; i <= days; i++) {
    const day = zonedParts(new Date(from.getTime() + i * 86400_000), tz);
    for (const r of rules.filter((x) => x.weekday === day.weekday)) {
      const [sh, sm] = r.s.split(":").map(Number);
      const [eh, em] = r.e.split(":").map(Number);
      for (let t = sh * 60 + sm; t + opts.durationMin <= eh * 60 + em; t += SLOT_STEP_MIN) {
        const start = zonedToUtc(day.y, day.m, day.d, Math.floor(t / 60), t % 60, tz);
        const s = start.getTime();
        const e = s + opts.durationMin * 60_000;
        if (s < earliest || s > until.getTime()) continue;
        if (busy.some(([bs, be]) => s < be && e > bs)) continue;
        out.push({ start: start.toISOString(), end: new Date(e).toISOString() });
      }
    }
  }
  // de-duplicate (overlapping rules) & sort
  return [...new Map(out.map((x) => [x.start, x])).values()].sort((a, b) => a.start.localeCompare(b.start));
}
