import { memberPage } from "@/lib/page-guards";
import { getUsage, getUserPlan } from "@/lib/plan";
import { BROWSER_MAX_MINUTES, listMixes } from "@/lib/mixlab";
import { dateTime } from "@/lib/i18n/format";
import { mixT } from "@/lib/i18n/p2/mix";
import { PageTitle } from "@/components/app/shell";
import { MixAnalyzer } from "@/components/mixlab/analyzer";
import { L, LinkButton, Tag } from "@/components/ui";
import { mmss } from "@/components/mixlab/fmt";

export default async function MixLab({ params }: PageProps<"/[locale]/app/mix-lab">) {
  const { locale, t, user } = await memberPage(params);
  const s = mixT(locale);
  const [plan, usage, rows] = await Promise.all([getUserPlan(user.id), getUsage(user.id), listMixes(user.id)]);
  const left = plan.quotas.mix_analyses - usage.mix;

  return (
    <>
      <PageTitle kicker={t.app.groups.ai} title={s.title} />
      <p className="-mt-4 mb-6 max-w-2xl text-stone">{s.lead}</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-4">{s.newHdr}</h2>
          <MixAnalyzer locale={locale} s={s}
            limits={{ maxMb: plan.quotas.max_upload_mb, maxMin: plan.quotas.max_minutes, left, total: plan.quotas.mix_analyses, browserMaxMin: BROWSER_MAX_MINUTES }} />
          {left <= 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone">
              {s.quotaFree}<LinkButton locale={locale} href="/app/subscription" variant="secondary">{s.seePlans}</LinkButton>
            </div>
          )}
        </section>
        <aside className="space-y-4 text-sm">
          <div className="rounded-[8px] border border-line p-5"><p className="kicker mb-2">{s.measured} / {s.estimated}</p><p className="text-stone">{s.privacy}</p></div>
          <div className="rounded-[8px] border border-line p-5">
            <p className="mb-2">{s.serverWorker}</p>
            <Tag kind="notConnected">{t.status.notConnected}</Tag>
            <p className="mt-2 text-xs text-stone">{s.errors.browserLimit}</p>
          </div>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="kicker mb-3">{s.history}</h2>
        {rows.length ? (
          <div className="overflow-x-auto rounded-[8px] border border-line">
            <table className="w-full min-w-[560px] text-sm" data-testid="mix-history">
              <thead className="text-left text-xs text-stone">
                <tr className="border-b border-line">
                  {[s.cols.date, s.cols.title, s.cols.length, s.cols.bpm, s.cols.key, s.cols.lufs, s.cols.score].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line tnum">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-2">
                    <td className="px-4 py-3 text-stone">{dateTime(r.created_at, locale, user.timezone)}</td>
                    <td className="px-4 py-3"><L locale={locale} href={`/app/mix-lab/${r.id}`} className="underline-offset-4 hover:underline">{r.title}</L></td>
                    <td className="px-4 py-3">{mmss(r.duration_sec)}</td>
                    <td className="px-4 py-3">{r.bpm ?? "—"}</td>
                    <td className="px-4 py-3">{r.camelot ?? "—"}</td>
                    <td className="px-4 py-3">{r.lufs ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-lime">{r.overall ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-[8px] border border-line px-5 py-6 text-sm text-stone">{s.empty}</p>
        )}
      </section>
    </>
  );
}
