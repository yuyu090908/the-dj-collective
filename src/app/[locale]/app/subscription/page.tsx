import { memberPage } from "@/lib/page-guards";
import { getPlans } from "@/lib/data";
import { getUsage, getUserPlan, PLAN_ORDER } from "@/lib/plan";
import { services } from "@/lib/env";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Alert, Tag, cx } from "@/components/ui";
import { money, dateOnly, fmt } from "@/lib/i18n/format";
import { subT } from "@/lib/i18n/p2/sub";
import { cancelDemoAction, manageBillingAction, subscribeAction } from "@/lib/subscription-actions";

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 100;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm"><span className="text-stone">{label}</span><span className="tnum font-display font-semibold">{used} / {max}</span></div>
      <div className="mt-2 h-1.5 rounded-full bg-line"><div className={cx("h-full rounded-full", pct >= 100 ? "bg-err" : "bg-lime")} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default async function Subscription({ params, searchParams }: PageProps<"/[locale]/app/subscription">) {
  const { locale, t, user } = await memberPage(params);
  const sp = await searchParams;
  const s = subT(locale);
  const [plans, plan, usage] = await Promise.all([getPlans(), getUserPlan(user.id), getUsage(user.id)]);
  const errMsgs = { not_connected: s.notConnected, invalid_plan: t.errors.invalidInput, generic: t.errors.generic };
  const canPay = services.stripe || services.demoPayments;
  const sub = plan.sub;

  return (
    <>
      <PageTitle kicker={t.app.items.subscription} title={s.title} />
      {sp.checkout === "success" && <div className="mb-4"><Alert kind="ok">{s.success}</Alert></div>}
      {sp.checkout === "demo" && <div className="mb-4"><Alert kind="ok">{s.demoActivated}</Alert></div>}
      {sp.checkout === "cancelled" && <div className="mb-4"><Alert>{s.cancelledCheckout}</Alert></div>}
      {!services.stripe && (
        <div className="mb-6">
          {services.demoPayments ? <Alert kind="warn"><Tag kind="demo" className="mb-2">DEMO</Tag><p>{s.demoNote}</p></Alert>
            : <Alert kind="warn"><Tag kind="notConnected" className="mb-2">Stripe — {t.status.notConnected}</Tag><p>{s.notConnected}</p></Alert>}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]" data-testid="current-plan" data-plan={plan.code}>
        <div className="rounded-[8px] border border-lime/40 bg-ink-2 p-5">
          <p className="kicker">{s.current}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{plan.name}</p>
          {sub?.provider === "demo" && <Tag kind="demo" className="mt-2">DEMO</Tag>}
          {sub?.current_period_end && (
            <p className="mt-2 text-sm text-stone tnum">
              {fmt(sub.cancel_at_period_end ? s.ends : s.renews, { d: dateOnly(sub.current_period_end, locale, user.timezone) })}
            </p>
          )}
          {sub?.status === "past_due" && <div className="mt-3"><Alert kind="error">{s.pastDue}</Alert></div>}
          <div className="mt-5 flex flex-wrap gap-3">
            {sub?.provider === "stripe" && (
              <ActionForm action={manageBillingAction} submit={s.manage} variant="secondary" msgs={errMsgs}>
                <input type="hidden" name="locale" value={locale} />
              </ActionForm>
            )}
            {sub?.provider === "demo" && !sub.cancel_at_period_end && (
              <ActionForm action={cancelDemoAction} submit={s.cancelDemo} variant="secondary" msgs={{ ok: t.common.saved, generic: t.errors.generic }} />
            )}
          </div>
        </div>
        <div className="rounded-[8px] border border-line p-5">
          <p className="kicker mb-4">{s.usage}</p>
          <div className="space-y-5">
            <Meter label={s.coach} used={usage.coach} max={plan.quotas.ai_coach_messages} />
            <Meter label={s.mix} used={usage.mix} max={plan.quotas.mix_analyses} />
            <p className="flex justify-between text-sm"><span className="text-stone">{s.maxMinutes}</span><span className="tnum font-display font-semibold">{plan.quotas.max_minutes} {s.minutes}</span></p>
          </div>
        </div>
      </section>

      <ul className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[...plans].sort((a, b) => PLAN_ORDER.indexOf(a.code as never) - PLAN_ORDER.indexOf(b.code as never)).map((p) => {
          const isCurrent = p.code === plan.code;
          return (
            <li key={p.code} className={cx("flex flex-col rounded-[8px] border p-5", isCurrent ? "border-lime" : "border-line")} data-testid={`plan-${p.code}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold tracking-[0.1em]">{p.name}</p>
                {isCurrent && <Tag kind="lime">{s.currentBadge}</Tag>}
              </div>
              <p className="mt-3 tnum font-display text-2xl font-semibold">{p.price_satang ? money(p.price_satang, locale) : t.common.free}<span className="text-sm font-normal text-stone"> {p.price_satang ? s.perMonth : ""}</span></p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-ivory/80">
                {(p.features[locale] ?? p.features.en ?? []).map((f) => <li key={f}>· {f}</li>)}
                <li className="pt-2 text-xs text-stone tnum">{s.coach}: {p.quotas.ai_coach_messages} · {s.mix}: {p.quotas.mix_analyses} · {p.quotas.max_minutes} {s.minutes}</li>
              </ul>
              {!isCurrent && p.price_satang > 0 && canPay && (
                <div className="mt-5">
                  <ActionForm action={subscribeAction} submit={plan.code === "free" ? s.choose : s.switchTo} variant={p.code === "member" ? "primary" : "secondary"} msgs={errMsgs}>
                    <input type="hidden" name="plan" value={p.code} />
                    <input type="hidden" name="locale" value={locale} />
                  </ActionForm>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-stone">{s.cardOnly} {s.cancelAnytime}</p>
    </>
  );
}
