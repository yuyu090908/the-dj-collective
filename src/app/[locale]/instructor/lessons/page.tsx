import { nowMs } from "@/lib/time";
import { instructorPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { NotLinked } from "@/components/app/not-linked";
import { ActionForm } from "@/components/forms";
import { Empty, inputCls, Tag } from "@/components/ui";
import { instructorCancelAction, saveNotesAction } from "@/lib/instructor-actions";
import { tr } from "@/lib/i18n/config";
import { dateTime } from "@/lib/i18n/format";

type R = { id: string; starts_at: string; ends_at: string; mode: string; status: string; title: Record<string, string>; student: string; notes: string | null; instructor_notes: string | null; level: string | null; genre: string | null; equipment: string | null; language: string | null };

export default async function Lessons({ params }: PageProps<"/[locale]/instructor/lessons">) {
  const { locale, t, inst } = await instructorPage(params);
  if (!inst) return <><PageTitle title={t.instructor.nav.lessons} /><NotLinked t={t} /></>;
  const rows = await q<R>(
    `select b.id, b.starts_at, b.ends_at, b.mode, b.status, l.title, coalesce(p.display_name,'—') student, b.notes, b.instructor_notes, b.level, b.genre, b.equipment, b.language
       from bookings b join lessons l on l.id=b.lesson_id left join profiles p on p.user_id=b.user_id
      where b.instructor_id=$1 and b.status in ('confirmed','completed','cancelled','refunded') order by b.starts_at desc limit 100`,
    [inst.id],
  );
  const n = t.instructor;
  const bk = t.booking;
  return (
    <>
      <PageTitle kicker="Instructor" title={n.nav.lessons} />
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((r) => {
            const future = new Date(r.starts_at).getTime() > nowMs();
            return (
              <li key={r.id} className="rounded-[8px] border border-line bg-ink-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag kind={r.status === "confirmed" ? "live" : "neutral"}>{bk.statuses[r.status as "confirmed"]}</Tag>
                  <span className="tnum font-display font-semibold">{dateTime(r.starts_at, locale, inst.timezone)}</span>
                  <span className="text-sm text-stone">{r.student} · {tr(r.title, locale)}</span>
                </div>
                <p className="mt-2 text-xs text-stone">{[r.level && bk.levels[r.level as "beginner"], r.genre, r.equipment && bk.equipmentOptions[r.equipment as "controller"], r.language].filter(Boolean).join(" · ")}</p>
                {r.notes && <p className="mt-2 rounded-[6px] border border-line p-3 text-sm">“{r.notes}”</p>}
                {["confirmed", "completed"].includes(r.status) && (
                  <ActionForm action={saveNotesAction} submit={n.saveNotes} variant="secondary" className="mt-4" msgs={{ ok: t.common.saved, generic: t.errors.generic, forbidden: t.auth.forbidden }}>
                    <input type="hidden" name="bookingId" value={r.id} />
                    <label className="flex flex-col gap-1.5"><span className="kicker">{n.notes}</span><textarea name="notes" rows={3} defaultValue={r.instructor_notes ?? ""} className={inputCls} /></label>
                    {r.status === "confirmed" && !future && <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="complete" className="h-5 w-5 accent-[#C4F34D]" />{n.markCompleted}</label>}
                  </ActionForm>
                )}
                {r.status === "confirmed" && future && (
                  <ActionForm action={instructorCancelAction} submit={bk.cancel} variant="danger" className="mt-3" msgs={{ ok: bk.cancelled, generic: t.errors.generic }}>
                    <input type="hidden" name="bookingId" value={r.id} />
                  </ActionForm>
                )}
              </li>
            );
          })}
        </ul>
      ) : <Empty title={t.app.noLessons} />}
    </>
  );
}
