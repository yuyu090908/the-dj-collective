import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { Empty, Stat, Tag } from "@/components/ui";
import { dateTime, money } from "@/lib/i18n/format";
import { services } from "@/lib/env";

export default async function AdminPayments({ params }: PageProps<"/[locale]/admin/payments">) {
  const { locale, t, user } = await adminPage(params);
  const [rows, [sum]] = await Promise.all([
    q<{ id: string; provider: string; provider_ref: string; amount_satang: number; refunded_satang: number; currency: string; status: string; method: string | null; created_at: string; email: string | null }>(
      `select p.*, u.email from payments p left join users u on u.id=p.user_id order by p.created_at desc limit 300`,
    ),
    q<{ gross: number; refunded: number; n: number }>(`select coalesce(sum(amount_satang) filter (where status in ('succeeded','refunded')),0) gross, coalesce(sum(refunded_satang),0) refunded, count(*) filter (where status='succeeded') n from payments`),
  ]);
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.payments}>
        <div className="mt-3 flex gap-2">{services.stripe ? <Tag kind="live">Stripe {t.status.live}</Tag> : <Tag kind="notConnected">Stripe {t.status.notConnected}</Tag>}{services.demoPayments && <Tag kind="demo">{t.status.demo}</Tag>}</div>
      </PageTitle>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat label="Gross" value={money(sum.gross, locale)} />
        <Stat label="Refunded" value={money(sum.refunded, locale)} />
        <Stat label="Net" value={money(sum.gross - sum.refunded, locale)} accent />
      </div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-[8px] border border-line">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="kicker text-left"><tr className="border-b border-line">{[t.common.date, "Provider", "Ref", t.common.email, t.common.total, "Method", t.common.status].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 tnum">{dateTime(r.created_at, locale, user.timezone)}</td>
                  <td className="px-4 py-3">{r.provider === "demo" ? <Tag kind="demo">demo</Tag> : r.provider}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone">{r.provider_ref.slice(0, 18)}…</td>
                  <td className="px-4 py-3 text-stone">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 tnum">{money(r.amount_satang, locale, r.currency)}</td>
                  <td className="px-4 py-3">{r.method ?? "—"}</td>
                  <td className="px-4 py-3"><Tag kind={r.status === "succeeded" ? "live" : r.status === "pending" ? "provisional" : "neutral"}>{r.status}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty title={t.common.none} />}
    </>
  );
}
