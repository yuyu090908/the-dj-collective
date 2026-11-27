"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSlotsAction } from "@/lib/booking/actions";
import type { Slot } from "@/lib/booking/slots";

export type SlotLabels = { noSlots: string; timezone: string; detected: string; bangkokTime: string; yourTime: string; loading: string };

const COMMON_TZ = ["Asia/Bangkok", "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Australia/Sydney", "Europe/London", "Europe/Berlin", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC"];

export function useUserTz() {
  const [tz, setTz] = useState("Asia/Bangkok");
  useEffect(() => {
    try {
      // Browser time zone is only known on the client.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Bangkok");
    } catch {}
  }, []);
  return [tz, setTz] as const;
}

export function TzSelect({ tz, setTz, labels }: { tz: string; setTz: (v: string) => void; labels: SlotLabels }) {
  const opts = COMMON_TZ.includes(tz) ? COMMON_TZ : [tz, ...COMMON_TZ];
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="kicker">{labels.timezone}</span>
      <select value={tz} onChange={(e) => setTz(e.target.value)} className="min-h-11 rounded-[6px] border border-line bg-ink px-3 text-ivory">
        {opts.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}

export function SlotPicker({
  instructorId, lessonId, intl, tz, labels, value, onChange,
}: {
  instructorId: string; lessonId: string; intl: string; tz: string; labels: SlotLabels;
  value: string | null; onChange: (s: Slot) => void;
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [pending, start] = useTransition();
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(null);
    start(async () => setSlots(await getSlotsAction(instructorId, lessonId, undefined, 28)));
  }, [instructorId, lessonId]);

  const dayKey = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }), [tz]);
  const days = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const k = dayKey.format(new Date(s.start));
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return [...m.entries()];
  }, [slots, dayKey]);
  const dayResetKey = `${days.length}|${tz}`;
  const [lastDayKey, setLastDayKey] = useState(dayResetKey);
  if (dayResetKey !== lastDayKey) {
    setLastDayKey(dayResetKey);
    setDayIdx(0);
  }

  const fmtDay = (k: string) => {
    const d = new Date(`${k}T12:00:00Z`);
    return {
      wd: new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }).format(d),
      dm: new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", timeZone: "UTC" }).format(d),
    };
  };
  const t = (iso: string, zone: string) => new Intl.DateTimeFormat(intl, { timeZone: zone, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

  if (pending || slots === null) {
    return (
      <div className="flex items-center gap-3 py-10 text-sm text-stone" role="status">
        <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} className="w-1 origin-bottom animate-bar bg-lime" style={{ height: "100%", animationDelay: `${i * 120}ms` }} />)}
        </span>
        {labels.loading}
      </div>
    );
  }
  if (!days.length) return <p className="rounded-[6px] border border-dashed border-line p-6 text-center text-sm text-stone">{labels.noSlots}</p>;

  const [, daySlots] = days[dayIdx] ?? days[0];
  const showBkk = tz !== "Asia/Bangkok";
  return (
    <div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous" onClick={() => setDayIdx((i) => Math.max(0, i - 1))} className="hidden h-11 w-11 shrink-0 place-items-center rounded-[6px] border border-line sm:grid" disabled={dayIdx === 0}>
          <ChevronLeft size={18} />
        </button>
        <div role="tablist" aria-label="Days" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]">
          {days.map(([k, s], i) => {
            const f = fmtDay(k);
            const active = i === dayIdx;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid="day-chip"
                onClick={() => setDayIdx(i)}
                className={`flex min-h-16 w-16 shrink-0 snap-start flex-col items-center justify-center rounded-[6px] border ${active ? "border-lime bg-lime text-ink" : "border-line hover:border-stone"}`}
              >
                <span className="text-[0.6875rem] uppercase tracking-[0.08em]">{f.wd}</span>
                <span className="font-display text-sm font-semibold">{f.dm}</span>
                <span className={`text-[0.625rem] ${active ? "text-ink/70" : "text-stone"}`}>{s.length}</span>
              </button>
            );
          })}
        </div>
        <button type="button" aria-label="Next" onClick={() => setDayIdx((i) => Math.min(days.length - 1, i + 1))} className="hidden h-11 w-11 shrink-0 place-items-center rounded-[6px] border border-line sm:grid" disabled={dayIdx === days.length - 1}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div role="radiogroup" aria-label={labels.yourTime} className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {daySlots.map((s) => {
          const active = value === s.start;
          return (
            <button
              key={s.start}
              type="button"
              role="radio"
              aria-checked={active}
              data-slot={s.start}
              onClick={() => onChange(s)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-[6px] border tnum ${active ? "border-lime bg-lime/10 text-lime" : "border-line hover:border-stone"}`}
            >
              <span className="font-display text-base font-semibold">{t(s.start, tz)}</span>
              {showBkk && <span className="text-[0.625rem] text-stone">BKK {t(s.start, "Asia/Bangkok")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
