import { memberPage } from "@/lib/page-guards";
import { q1 } from "@/lib/db";
import { getPlans } from "@/lib/data";
import { PageTitle } from "@/components/app/shell";
import { PhasePanel } from "@/components/phase";
import { Tag } from "@/components/ui";
import { money } from "@/lib/i18n/format";

export default async function Subscription({ params }: PageProps<"/[locale]/app/subscription">) {
  const { locale, t, user } = await memberPage(params);
  const [sub, plans] = await Promise.all([
    q1<{ plan_code: string; status: string }>(`select plan_code, status from subscriptions where user_id=$1 and status in ('active','trialing','past_due') order by created_at desc limit 1`, [user.id]),
    getPlans(),
  ]);
  const current = plans.find((p) => p.code === (sub?.plan_code ?? "free"));
  return (
    <>
      <PageTitle kicker={t.app.items.subscription} title={t.app.items.subscription} />
      <section className="mb-6 rounded-[8px] border border-lime/40 p-5">
        <p className="kicker">{t.app.currentPlan}</p>
        <p className="mt-2 font-display text-3xl font-semibold">{current?.name ?? "FREE"}</p>
        <p className="text-sm text-stone">{current && current.price_satang > 0 ? money(current.price_satang, locale) + " " + t.common.perMonth : t.common.free}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {plans.map((p) => <li key={p.code}><Tag kind={p.code === current?.code ? "lime" : "neutral"}>{p.name} · {p.price_satang ? money(p.price_satang, locale) : t.common.free}</Tag></li>)}
        </ul>
      </section>
      <PhasePanel feature="subscription" locale={locale} t={t} available={[{ href: "/pricing", label: t.nav.pricing }]} />
    </>
  );
}
