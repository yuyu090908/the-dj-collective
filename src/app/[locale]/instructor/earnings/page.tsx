import { instructorPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { NotLinked } from "@/components/app/not-linked";
import { Empty, Stat } from "@/components/ui";
import { money } from "@/lib/i18n/format";

export default async function Earnings({ params }: PageProps<"/[locale]/instructor/earnings">) {
  const { locale, t, inst } = await instructorPage(params);
  if (!inst) return <><PageTitle title={t.instructor.nav.earnings} /><NotLinked t={t} /></>;
  const months = await q<{ month: string; revenue: number; lessons: number }>(
    `select to_char(date_trunc('month', p.created_at at time zone $2),'YYYY-MM') as month,
            sum(p.amount_satang - p.refunded_satang)::int as revenue, count(*)::int as lessons
       from payments p join bookings b on b.id=p.booking_id
      where b.instructor_id=$1 and p.status in ('succeeded','refunded') group by 1 order by 1 desc limit 12`,
    [inst.id, inst.timezone],
  );
  const total = months.reduce((s, m) => s + m.revenue, 0);
  const max = Math.max(1, ...months.map((m) => m.revenue));
  const n = t.instructor;
  return (
    <>
      <PageTitle kicker="Instructor" title={n.nav.earnings} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label={`${n.revenue} · ${n.thisMonth}`} value={money(months[0]?.revenue ?? 0, locale)} accent />
        <Stat label={`${n.revenue} · ${n.allTime}`} value={money(total, locale)} />
        <Stat label={n.paidLessons} value={months.reduce((s, m) => s + m.lessons, 0)} />
      </div>
      <section className="mt-8 rounded-[8px] border border-line p-5">
        {months.length ? (
          <ul className="space-y-2">
            {months.map((m) => (
              <li key={m.month} className="grid grid-cols-[80px_1fr_120px] items-center gap-3 text-sm">
                <span className="tnum text-stone">{m.month}</span>
                <span className="h-2 rounded-full bg-ink"><span className="block h-full rounded-full bg-lime" style={{ width: `${(m.revenue / max) * 100}%` }} /></span>
                <span className="tnum text-right">{money(m.revenue, locale)}</span>
              </li>
            ))}
          </ul>
        ) : <Empty title={t.common.none} />}
        <p className="mt-4 text-xs text-stone">Gross amounts before payment-provider fees and any revenue share. Payouts are handled outside the platform.</p>
      </section>
    </>
  );
}
