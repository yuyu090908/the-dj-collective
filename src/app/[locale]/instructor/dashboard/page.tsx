import { instructorPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { NotLinked } from "@/components/app/not-linked";
import { Empty, L, Stat, Tag } from "@/components/ui";
import { tr } from "@/lib/i18n/config";
import { dateTime, money } from "@/lib/i18n/format";

type R = { id: string; starts_at: string; mode: string; title: Record<string, string>; student: string; level: string | null; genre: string | null };

export default async function InstructorDashboard({ params }: PageProps<"/[locale]/instructor/dashboard">) {
  const { locale, t, inst } = await instructorPage(params);
  if (!inst) return <><PageTitle title={t.instructor.nav.dashboard} /><NotLinked t={t} /></>;
  const [up, stats] = await Promise.all([
    q<R>(
      `select b.id, b.starts_at, b.mode, l.title, coalesce(p.display_name, u.email) student, b.level, b.genre
         from bookings b join lessons l on l.id=b.lesson_id join users u on u.id=b.user_id left join profiles p on p.user_id=b.user_id
        where b.instructor_id=$1 and b.status='confirmed' and b.ends_at > now() order by b.starts_at limit 8`,
      [inst.id],
    ),
    q<{ today: number; week: number; students: number; month_rev: number }>(
      `select
         count(*) filter (where b.status='confirmed' and b.starts_at::date = (now() at time zone $2)::date) today,
         count(*) filter (where b.status='confirmed' and b.starts_at between now() and now() + interval '7 days') week,
         count(distinct b.user_id) filter (where b.status in ('confirmed','completed')) students,
         coalesce((select sum(p.amount_satang - p.refunded_satang) from payments p join bookings bb on bb.id=p.booking_id
                    where bb.instructor_id=$1 and p.status in ('succeeded') and p.created_at > date_trunc('month', now())),0) month_rev
       from bookings b where b.instructor_id=$1`,
      [inst.id, inst.timezone],
    ),
  ]);
  const s = stats[0];
  const n = t.instructor;
  return (
    <>
      <PageTitle kicker="Instructor" title={inst.dj_name} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={n.today} value={s.today} accent />
        <Stat label="7d" value={s.week} />
        <Stat label={n.nav.students} value={s.students} />
        <Stat label={`${n.revenue} · ${n.thisMonth}`} value={money(s.month_rev, locale)} />
      </div>
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="kicker">{n.upcoming}</h2><L locale={locale} href="/instructor/lessons" className="text-sm text-stone hover:text-ivory">{t.common.viewAll}</L></div>
        {up.length ? (
          <ul className="divide-y divide-line rounded-[8px] border border-line">
            {up.map((r) => (
              <li key={r.id} className="grid gap-1 p-4 md:grid-cols-[220px_1fr_auto] md:items-center">
                <span className="tnum font-display font-semibold">{dateTime(r.starts_at, locale, inst.timezone)}</span>
                <span className="text-sm">{r.student} · {tr(r.title, locale)} {r.genre ? `· ${r.genre}` : ""}</span>
                <span className="flex gap-2">{r.level && <Tag>{t.booking.levels[r.level as "beginner"]}</Tag>}<Tag kind={r.mode === "online" ? "lime" : "neutral"}>{r.mode === "online" ? t.booking.online : t.booking.inPerson}</Tag></span>
              </li>
            ))}
          </ul>
        ) : <Empty title={t.app.noLessons} />}
      </section>
      <p className="mt-8 text-xs text-stone">{n.humanVsAi}</p>
    </>
  );
}
