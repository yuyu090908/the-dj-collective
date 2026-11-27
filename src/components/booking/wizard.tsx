"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Video } from "lucide-react";
import { holdAction } from "@/lib/booking/actions";
import type { Slot } from "@/lib/booking/slots";
import { SlotPicker, TzSelect, useUserTz, type SlotLabels } from "./slot-picker";
import { Alert, btn, cx, Field, inputCls } from "../ui";

export type WizardLesson = { id: string; slug: string; mode: "in_person" | "online"; title: string; desc: string; duration: number; price: string; provisional: boolean };
export type WizardInstructor = { id: string; slug: string; name: string; genres: string[]; languages: string[]; placeholder: boolean };

export type WizardLabels = SlotLabels & {
  steps: string[]; chooseLesson: string; inPerson: string; online: string; instructor: string; chooseTime: string;
  genre: string; level: string; levels: Record<string, string>; equipment: string; equipmentOptions: Record<string, string>;
  language: string; notes: string; continue: string; back: string; loginRequired: string; login: string; register: string;
  slotTaken: string; generic: string; minutes: string; provisional: string; placeholder: string; selected: string; tooMany: string;
};

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} aria-current={i === current ? "step" : undefined} className="flex flex-col gap-2">
          <span className={cx("h-1 rounded-full", i <= current ? "bg-lime" : "bg-line")} />
          <span className={cx("hidden font-display text-[0.6875rem] uppercase tracking-[0.1em] sm:block", i === current ? "text-ivory" : "text-stone")}>
            {String(i + 1).padStart(2, "0")} {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function BookingWizard({
  lessons, instructors, labels, locale, intl, signedIn, initialLesson, initialInstructor, defaultLevel, loginHref, registerHref, reviewBase,
}: {
  lessons: WizardLesson[]; instructors: WizardInstructor[]; labels: WizardLabels; locale: string; intl: string; signedIn: boolean;
  initialLesson?: string; initialInstructor?: string; defaultLevel?: string; loginHref: string; registerHref: string; reviewBase: string;
}) {
  const router = useRouter();
  const init = lessons.find((l) => l.slug === initialLesson);
  const [mode, setMode] = useState<"in_person" | "online">(init?.mode ?? "in_person");
  const [lessonId, setLessonId] = useState<string>(init?.id ?? lessons.find((l) => l.mode === (init?.mode ?? "in_person"))?.id ?? "");
  const [instructorId, setInstructorId] = useState(instructors.find((i) => i.slug === initialInstructor)?.id ?? instructors[0]?.id ?? "");
  const [step, setStep] = useState(init ? 1 : 0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [tz, setTz] = useUserTz();
  const [level, setLevel] = useState(defaultLevel ?? "beginner");
  const [genre, setGenre] = useState("");
  const [equipment, setEquipment] = useState("controller");
  const [language, setLanguage] = useState(locale);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = lessons.filter((l) => l.mode === mode);
  const lesson = lessons.find((l) => l.id === lessonId);
  const inst = instructors.find((i) => i.id === instructorId);
  const genres = inst?.genres ?? [];
  const fmtSel = useMemo(
    () => (slot ? new Intl.DateTimeFormat(intl, { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(slot.start)) : ""),
    [slot, tz, intl],
  );

  function hold() {
    if (!slot || !lesson || !inst) return;
    setError(null);
    start(async () => {
      const r = await holdAction({
        lessonId: lesson.id, instructorId: inst.id, startsAt: slot.start, genre: genre || undefined,
        level: level as "beginner", equipment, language, notes: notes || undefined, userTimezone: tz, locale,
      });
      if (r.ok) router.push(`${reviewBase}?b=${r.bookingId}`);
      else setError(r.error === "slot_taken" ? labels.slotTaken : r.error === "too_many_holds" ? labels.tooMany : labels.generic);
    });
  }

  const nextQs = `/booking?lesson=${lesson?.slug ?? ""}`;

  return (
    <div className="space-y-8">
      <Steps steps={labels.steps} current={step} />

      {step === 0 && (
        <section aria-labelledby="s1" className="space-y-6">
          <h2 id="s1" className="font-display text-2xl font-semibold uppercase tracking-tight">{labels.chooseLesson}</h2>
          <div role="tablist" className="grid grid-cols-2 gap-2">
            {(["in_person", "online"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setLessonId(lessons.find((l) => l.mode === m)?.id ?? "");
                }}
                className={cx("flex min-h-14 items-center justify-center gap-2 rounded-[6px] border font-display text-sm font-semibold uppercase tracking-[0.08em]", mode === m ? "border-lime text-lime" : "border-line text-ivory/80")}
              >
                {m === "online" ? <Video size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}
                {m === "online" ? labels.online : labels.inPerson}
              </button>
            ))}
          </div>
          <div role="radiogroup" className="grid gap-2 md:grid-cols-2">
            {filtered.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={l.id === lessonId}
                onClick={() => setLessonId(l.id)}
                className={cx("flex flex-col rounded-[8px] border p-4 text-left", l.id === lessonId ? "border-lime bg-lime/[0.05]" : "border-line hover:border-stone")}
              >
                <span className="font-display text-lg font-semibold leading-tight">{l.title}</span>
                <span className="mt-1 text-sm text-stone">{l.desc}</span>
                <span className="mt-3 flex items-center gap-3 text-sm tnum">
                  <span>{l.duration} {labels.minutes}</span>
                  <span className="font-display font-semibold">{l.price}</span>
                  {l.provisional && <span className="text-xs uppercase tracking-[0.08em] text-warn">{labels.provisional}</span>}
                </span>
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {instructors.length > 1 && (
              <Field label={labels.instructor}>
                <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={inputCls}>
                  {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </Field>
            )}
            <Field label={labels.level}>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                {Object.entries(labels.levels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label={labels.genre}>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label={labels.equipment}>
              <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputCls}>
                {Object.entries(labels.equipmentOptions).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label={labels.language}>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="th">ไทย</option>
              </select>
            </Field>
          </div>
          <Field label={labels.notes}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} rows={3} className={inputCls} />
          </Field>
          <StickyBar>
            <button type="button" disabled={!lessonId || !instructorId} onClick={() => setStep(1)} className={btn("primary", "min-h-12 w-full sm:w-auto")}>
              {labels.continue}
            </button>
          </StickyBar>
        </section>
      )}

      {step === 1 && lesson && inst && (
        <section aria-labelledby="s2" className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="s2" className="font-display text-2xl font-semibold uppercase tracking-tight">{labels.chooseTime}</h2>
              <p className="mt-1 text-sm text-stone">{lesson.title} · {inst.name}</p>
            </div>
            <TzSelect tz={tz} setTz={setTz} labels={labels} />
          </div>
          <SlotPicker instructorId={inst.id} lessonId={lesson.id} intl={intl} tz={tz} labels={labels} value={slot?.start ?? null} onChange={setSlot} />
          {error && <Alert kind="error">{error}</Alert>}
          {!signedIn && slot && (
            <Alert kind="warn">
              <p>{labels.loginRequired}</p>
              <div className="mt-3 flex gap-3">
                <Link className={btn("primary")} href={`${loginHref}?next=${encodeURIComponent(nextQs)}`}>{labels.login}</Link>
                <Link className={btn("secondary")} href={`${registerHref}?next=${encodeURIComponent(nextQs)}`}>{labels.register}</Link>
              </div>
            </Alert>
          )}
          <StickyBar>
            <button type="button" onClick={() => setStep(0)} className={btn("ghost", "min-h-12")}>{labels.back}</button>
            {slot && <span className="hidden text-sm tnum text-lime sm:inline">{labels.selected}: {fmtSel}</span>}
            <button type="button" disabled={!slot || !signedIn || pending} onClick={hold} className={btn("primary", "min-h-12 flex-1 sm:flex-none")} data-testid="hold">
              {pending ? "…" : labels.continue}
            </button>
          </StickyBar>
        </section>
      )}
    </div>
  );
}

function StickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-end gap-3 border-t border-line bg-ink/95 px-5 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0" style={{ paddingBottom: "calc(0.75rem + var(--safe-b))" }}>
      {children}
    </div>
  );
}
