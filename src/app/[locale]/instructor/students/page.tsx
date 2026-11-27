import { instructorPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { NotLinked } from "@/components/app/not-linked";
import { Empty, Tag } from "@/components/ui";
import { dateTime } from "@/lib/i18n/format";

type S = { user_id: string; name: string; experience_level: string; genres: string[]; equipment: string[]; lessons: number; last: string | null; next: string | null };

export default async function Students({ params }: PageProps<"/[locale]/instructor/students">) {
  const { locale, t, inst } = await instructorPage(params);
  if (!inst) return <><PageTitle title={t.instructor.nav.students} /><NotLinked t={t} /></>;
  // Only students who booked THIS instructor are visible.
  const rows = await q<S>(
    `select p.user_id, coalesce(nullif(p.dj_name,''), p.display_name) name, p.experience_level, p.genres, p.equipment,
            count(*) filter (where b.status in ('confirmed','completed')) lessons,
            max(b.starts_at) filter (where b.starts_at < now() and b.status in ('confirmed','completed')) last,
            min(b.starts_at) filter (where b.starts_at > now() and b.status='confirmed') next
       from bookings b join profiles p on p.user_id=b.user_id
      where b.instructor_id=$1 and b.status in ('confirmed','completed')
      group by p.user_id, p.dj_name, p.display_name, p.experience_level, p.genres, p.equipment order by next nulls last, last desc nulls last`,
    [inst.id],
  );
  const n = t.instructor;
  return (
    <>
      <PageTitle kicker="Instructor" title={n.nav.students} />
      {rows.length ? (
        <div className="overflow-x-auto rounded-[8px] border border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="kicker text-left"><tr className="border-b border-line">{[n.student, t.booking.level, t.booking.genre, t.booking.equipment, n.lessonsCount, n.lastLesson, t.app.nextLesson].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3"><Tag>{t.booking.levels[r.experience_level as "beginner"]}</Tag></td>
                  <td className="px-4 py-3 text-stone">{r.genres.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-stone">{r.equipment.join(", ") || "—"}</td>
                  <td className="px-4 py-3 tnum">{r.lessons}</td>
                  <td className="px-4 py-3 tnum text-stone">{r.last ? dateTime(r.last, locale, inst.timezone) : "—"}</td>
                  <td className="px-4 py-3 tnum">{r.next ? dateTime(r.next, locale, inst.timezone) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title={t.common.none} />}
      <p className="mt-4 text-xs text-stone">AI Mix Lab history: <Tag kind="phase">Phase 02</Tag></p>
    </>
  );
}
