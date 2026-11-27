import { nowMs } from "@/lib/time";
import { Trash2 } from "lucide-react";
import { instructorPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { NotLinked } from "@/components/app/not-linked";
import { ActionForm } from "@/components/forms";
import { Field, inputCls } from "@/components/ui";
import { addAvailabilityAction, addTimeOffAction, deleteAvailabilityAction, deleteTimeOffAction } from "@/lib/instructor-actions";
import { dateTime, timeOnly } from "@/lib/i18n/format";
import { zonedParts } from "@/lib/booking/tz";
import { intlLocale } from "@/lib/i18n/config";

export default async function Calendar({ params }: PageProps<"/[locale]/instructor/calendar">) {
  const { locale, t, inst } = await instructorPage(params);
  if (!inst) return <><PageTitle title={t.instructor.nav.calendar} /><NotLinked t={t} /></>;
  const n = t.instructor;
  const [rules, off, bookings] = await Promise.all([
    q<{ id: string; weekday: number; s: string; e: string; mode: "both" }>(`select id, weekday, to_char(start_time,'HH24:MI') s, to_char(end_time,'HH24:MI') e, mode from instructor_availability where instructor_id=$1 order by weekday, start_time`, [inst.id]),
    q<{ id: string; starts_at: string; ends_at: string; reason: string | null }>(`select id, starts_at, ends_at, reason from instructor_time_off where instructor_id=$1 and ends_at > now() order by starts_at`, [inst.id]),
    q<{ id: string; starts_at: string; ends_at: string; student: string; mode: string; status: string }>(
      `select b.id, b.starts_at, b.ends_at, coalesce(p.display_name,'—') student, b.mode, b.status from bookings b left join profiles p on p.user_id=b.user_id
        where b.instructor_id=$1 and b.status in ('confirmed','pending_payment','held') and b.ends_at > now() and b.starts_at < now() + interval '7 days' order by b.starts_at`,
      [inst.id],
    ),
  ]);
  const days = Array.from({ length: 7 }, (_, i) => new Date(nowMs() + i * 86400_000));
  const key = (d: Date) => { const p = zonedParts(d, inst.timezone); return `${p.y}-${p.m}-${p.d}`; };
  const dayFmt = new Intl.DateTimeFormat(intlLocale[locale], { timeZone: inst.timezone, weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      <PageTitle kicker={inst.timezone} title={n.nav.calendar} />
      <section aria-label="7 days" className="mb-10 overflow-hidden rounded-[8px] border border-line">
        <div className="grid md:grid-cols-7">
          {days.map((d) => {
            const items = bookings.filter((b) => key(new Date(b.starts_at)) === key(d));
            const wd = zonedParts(d, inst.timezone).weekday;
            const avail = rules.filter((r) => r.weekday === wd);
            return (
              <div key={d.toISOString()} className="min-h-28 border-b border-line p-3 md:border-b-0 md:border-r md:last:border-r-0">
                <p className="kicker">{dayFmt.format(d)}</p>
                <p className="mt-1 text-[0.6875rem] text-stone tnum">{avail.map((a) => `${a.s}–${a.e}`).join(", ") || "—"}</p>
                <ul className="mt-2 space-y-1.5">
                  {items.map((b) => (
                    <li key={b.id} className={`rounded-[4px] border-l-2 px-2 py-1 text-xs ${b.status === "confirmed" ? "border-lime bg-lime/[0.06]" : "border-warn bg-warn/[0.06]"}`}>
                      <span className="tnum font-semibold">{timeOnly(b.starts_at, locale, inst.timezone)}</span> {b.student}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-4">{n.weekly}</h2>
          <ul className="mb-6 divide-y divide-line">
            {rules.map((r) => (
              <li key={r.id} className="flex min-h-12 items-center gap-3 text-sm">
                <span className="w-10 font-display font-semibold">{n.weekdays[r.weekday]}</span>
                <span className="tnum">{r.s}–{r.e}</span>
                <span className="text-stone">{n.modes[r.mode]}</span>
                <form action={deleteAvailabilityAction} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" aria-label={t.common.delete} className="grid h-11 w-11 place-items-center text-stone hover:text-err"><Trash2 size={16} /></button>
                </form>
              </li>
            ))}
          </ul>
          <ActionForm action={addAvailabilityAction} submit={n.addRule} variant="secondary" msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="Day"><select name="weekday" className={inputCls}>{n.weekdays.map((w, i) => <option key={i} value={i}>{w}</option>)}</select></Field>
              <Field label={n.from}><input type="time" name="start" defaultValue="13:00" step={1800} className={inputCls} /></Field>
              <Field label={n.to}><input type="time" name="end" defaultValue="21:00" step={1800} className={inputCls} /></Field>
              <Field label={n.mode}><select name="mode" className={inputCls}>{Object.entries(n.modes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            </div>
          </ActionForm>
        </section>
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-4">{n.timeOff}</h2>
          <ul className="mb-6 divide-y divide-line">
            {off.map((o) => (
              <li key={o.id} className="flex min-h-12 items-center gap-3 text-sm">
                <span className="tnum">{dateTime(o.starts_at, locale, inst.timezone, { hour: undefined, minute: undefined })} → {dateTime(new Date(new Date(o.ends_at).getTime() - 1), locale, inst.timezone, { hour: undefined, minute: undefined })}</span>
                <span className="text-stone">{o.reason}</span>
                <form action={deleteTimeOffAction} className="ml-auto">
                  <input type="hidden" name="id" value={o.id} />
                  <button type="submit" aria-label={t.common.delete} className="grid h-11 w-11 place-items-center text-stone hover:text-err"><Trash2 size={16} /></button>
                </form>
              </li>
            ))}
          </ul>
          <ActionForm action={addTimeOffAction} submit={n.addTimeOff} variant="secondary" msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }}>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label={n.from}><input type="date" name="from" required className={inputCls} /></Field>
              <Field label={n.to}><input type="date" name="to" required className={inputCls} /></Field>
              <Field label="Note"><input name="reason" maxLength={200} className={inputCls} /></Field>
            </div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
