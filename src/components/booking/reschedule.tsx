"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescheduleAction } from "@/lib/booking/actions";
import type { Slot } from "@/lib/booking/slots";
import { SlotPicker, TzSelect, useUserTz, type SlotLabels } from "./slot-picker";
import { Alert, btn } from "../ui";

export function Reschedule({
  bookingId, instructorId, lessonId, locale, intl, labels,
}: {
  bookingId: string; instructorId: string; lessonId: string; locale: string; intl: string;
  labels: SlotLabels & { reschedule: string; confirm: string; cancel: string; slotTaken: string; generic: string };
}) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [tz, setTz] = useUserTz();
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!open) return <button type="button" className={btn("secondary", "self-start")} onClick={() => setOpen(true)}>{labels.reschedule}</button>;
  return (
    <div className="space-y-3 md:col-span-2">
      <TzSelect tz={tz} setTz={setTz} labels={labels} />
      <SlotPicker instructorId={instructorId} lessonId={lessonId} intl={intl} tz={tz} labels={labels} value={slot?.start ?? null} onChange={setSlot} />
      {err && <Alert kind="error">{err}</Alert>}
      <div className="flex gap-3">
        <button type="button" className={btn("ghost")} onClick={() => setOpen(false)}>{labels.cancel}</button>
        <button
          type="button"
          disabled={!slot || pending}
          className={btn("primary")}
          onClick={() =>
            start(async () => {
              const r = await rescheduleAction(bookingId, slot!.start, locale);
              if (r.ok) {
                setOpen(false);
                router.refresh();
              } else setErr(r.error === "slot_taken" ? labels.slotTaken : labels.generic);
            })
          }
        >
          {pending ? "…" : labels.confirm}
        </button>
      </div>
    </div>
  );
}
