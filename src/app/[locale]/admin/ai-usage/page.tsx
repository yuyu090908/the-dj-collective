import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { services } from "@/lib/env";
import { adminAiT } from "@/lib/i18n/p2/admin";
import { intlLocale } from "@/lib/i18n/config";
import { PageTitle } from "@/components/app/shell";
import { Tag } from "@/components/ui";

// ai_usage.period_month defaults to date_trunc('month', now()) — compare with the same expression.
const MONTH = "date_trunc('month', now())::date";

export default async function AiUsage({ params }: PageProps<"/[locale]/admin/ai-usage">) {
  const { locale, t } = await adminPage(params);
  const s = adminAiT(locale);
  const [byFeature, top, months] = await Promise.all([
    q<{ feature: string; units: number; input: string; output: string; cost: string }>(
      `select feature, sum(units)::int units, coalesce(sum(input_tokens),0)::bigint input, coalesce(sum(output_tokens),0)::bigint output, sum(cost_usd) cost
         from ai_usage where period_month = ${MONTH} group by feature order by feature`),
    q<{ email: string; units: number; cost: string; plan: string | null }>(
      `select coalesce(u.email, '—') email, sum(a.units)::int units, sum(a.cost_usd) cost,
              (select s.plan_code from subscriptions s where s.user_id=a.user_id and s.status in ('trialing','active','past_due') order by s.created_at desc limit 1) plan
         from ai_usage a left join users u on u.id=a.user_id where a.period_month = ${MONTH}
        group by a.user_id, u.email order by sum(a.cost_usd) desc, sum(a.units) desc limit 20`),
    q<{ period_month: string; coach: number | null; mix: number | null; cost: string }>(
      `select period_month, sum(units) filter (where feature='coach')::int coach, sum(units) filter (where feature='mix_analysis')::int mix, sum(cost_usd) cost
         from ai_usage where period_month >= (${MONTH} - interval '5 months') group by period_month order by period_month desc`),
  ]);
  const nf = new Intl.NumberFormat(intlLocale[locale]);
  const usd = (v: string | number) => `$${Number(v).toFixed(4)}`;
  const mfmt = new Intl.DateTimeFormat(intlLocale[locale], { year: "numeric", month: "short", timeZone: "UTC" });
  const th = "px-4 py-2.5 font-normal";
  const td = "px-4 py-2.5";

  return (
    <>
      <PageTitle kicker="ADMIN" title={s.title} />
      <p className="-mt-4 mb-4 max-w-3xl text-sm text-stone">{s.lead}</p>
      <p className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <span>{s.llm}</span>{services.llm ? <Tag kind="live">{t.status.live}</Tag> : <Tag kind="notConnected">{t.status.notConnected}</Tag>}
        <span className="text-xs text-stone">{s.price}</span>
      </p>

      <div className="overflow-x-auto rounded-[8px] border border-line">
        <table className="w-full min-w-[560px] text-sm" data-testid="ai-usage-features">
          <thead className="text-left text-xs text-stone"><tr className="border-b border-line">{["", s.units, s.input, s.output, s.cost].map((h, i) => <th key={i} className={th}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line tnum">
            {byFeature.length ? byFeature.map((r) => (
              <tr key={r.feature}><td className={td}>{s.feature[r.feature] ?? r.feature}</td><td className={td}>{nf.format(r.units)}</td>
                <td className={td}>{nf.format(Number(r.input))}</td><td className={td}>{nf.format(Number(r.output))}</td><td className={td}>{usd(r.cost)}</td></tr>
            )) : <tr><td colSpan={5} className="px-4 py-6 text-stone">{s.empty}</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="kicker mb-3">{s.topUsers}</h2>
          <div className="overflow-x-auto rounded-[8px] border border-line">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="text-left text-xs text-stone"><tr className="border-b border-line">{[s.user, s.plan, s.units, s.cost].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line tnum">
                {top.length ? top.map((r, i) => (
                  <tr key={i}><td className={`${td} max-w-56 truncate`}>{r.email}</td><td className={td}>{r.plan ?? "free"}</td><td className={td}>{nf.format(r.units)}</td><td className={td}>{usd(r.cost)}</td></tr>
                )) : <tr><td colSpan={4} className="px-4 py-6 text-stone">{s.empty}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="kicker mb-3">{s.months}</h2>
          <div className="overflow-x-auto rounded-[8px] border border-line">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="text-left text-xs text-stone"><tr className="border-b border-line">{[s.month, s.feature.coach, s.feature.mix_analysis, s.cost].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line tnum">
                {months.length ? months.map((r) => (
                  <tr key={String(r.period_month)}><td className={td}>{mfmt.format(new Date(r.period_month))}</td><td className={td}>{nf.format(r.coach ?? 0)}</td><td className={td}>{nf.format(r.mix ?? 0)}</td><td className={td}>{usd(r.cost)}</td></tr>
                )) : <tr><td colSpan={4} className="px-4 py-6 text-stone">{s.empty}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
