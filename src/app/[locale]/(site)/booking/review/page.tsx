import { redirect, notFound } from "next/navigation";
import { pageCtx } from "@/lib/i18n/server";
import { requireUser } from "@/lib/guards";
import { getBookingForUser } from "@/lib/booking/service";
import { checkoutAction, couponAction } from "@/lib/booking/actions";
import { Alert, Container, inputCls, Kicker, Tag } from "@/components/ui";
import { Steps } from "@/components/booking/wizard";
import { HoldCountdown } from "@/components/booking/live";
import { ActionForm } from "@/components/forms";
import { lp, tr } from "@/lib/i18n/config";
import { dateTime, fmt, money } from "@/lib/i18n/format";
import { HOLD_MINUTES } from "@/lib/booking/slots";
import { services } from "@/lib/env";

export const metadata = { robots: { index: false } };

export default async function Review({ params, searchParams }: PageProps<"/[locale]/booking/review">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const id = typeof sp.b === "string" ? sp.b : "";
  const user = await requireUser(locale, `/booking/review?b=${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const b = await getBookingForUser(id, user.id);
  if (!b) notFound();
  if (b.status !== "held") redirect(lp(locale, `/booking/complete?b=${b.id}`));
  const bk = t.booking;
  const userTz = b.user_timezone || user.timezone;
  const total = Math.max(0, b.price_satang - b.discount_satang);
  const row = (k: string, v: React.ReactNode) => (
    <div className="flex justify-between gap-4 border-b border-line py-3 text-sm">
      <dt className="text-stone">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
  return (
    <Container className="max-w-5xl pt-10 md:pt-14">
      <Kicker>Booking</Kicker>
      <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight">{bk.review}</h1>
      <div className="mt-8"><Steps steps={bk.steps} current={2} /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <HoldCountdown until={b.hold_expires_at!} label={fmt(bk.hold, { m: HOLD_MINUTES })} />
          <dl className="mt-6">
            {row(bk.chooseLesson, tr(b.lesson_title, locale))}
            {row(bk.instructor, b.dj_name)}
            {row(t.common.yourTime, <span className="tnum">{dateTime(b.starts_at, locale, userTz)} <span className="text-stone">({userTz})</span></span>)}
            {userTz !== "Asia/Bangkok" && row(t.common.bangkokTime, <span className="tnum">{dateTime(b.starts_at, locale, "Asia/Bangkok")}</span>)}
            {row(b.mode === "online" ? bk.online : bk.studio, b.mode === "online" ? bk.online : b.studio_name ?? "—")}
            {b.level && row(bk.level, bk.levels[b.level as "beginner"])}
            {b.genre && row(bk.genre, b.genre)}
            {b.equipment && row(bk.equipment, bk.equipmentOptions[b.equipment as "controller"] ?? b.equipment)}
            {b.language && row(bk.language, { en: "English", ja: "日本語", th: "ไทย" }[b.language] ?? b.language)}
          </dl>
          <p className="mt-4 text-xs text-stone">{bk.cancelPolicy} {bk.reminder}</p>
        </section>
        <aside className="h-fit rounded-[8px] border border-line bg-ink-2 p-5 md:p-6">
          <dl>
            {row(bk.price, <span className="tnum">{money(b.price_satang, locale, b.currency)}</span>)}
            {b.discount_satang > 0 && row(bk.discount, <span className="tnum text-ok">−{money(b.discount_satang, locale, b.currency)}</span>)}
            <div className="flex items-end justify-between pt-4">
              <dt className="kicker">{bk.total}</dt>
              <dd className="tnum font-display text-3xl font-semibold text-lime" data-testid="total">{money(total, locale, b.currency)}</dd>
            </div>
          </dl>
          {b.is_provisional && <Tag kind="provisional" className="mt-3">{bk.priceProvisional}</Tag>}
          <ActionForm action={couponAction} submit={t.common.submit} variant="secondary" className="mt-6" msgs={{ ok: t.common.saved, invalidCoupon: "—", rateLimited: t.errors.rateLimited, generic: t.errors.generic }}>
            <input type="hidden" name="bookingId" value={b.id} />
            <label className="flex flex-col gap-1.5">
              <span className="kicker">{bk.coupon}</span>
              <input name="code" maxLength={40} className={inputCls} autoComplete="off" />
            </label>
          </ActionForm>
          <div className="mt-6 border-t border-line pt-6">
            {services.stripe ? null : services.demoPayments ? (
              <div className="mb-4"><Alert kind="warn">{bk.demoNote}</Alert></div>
            ) : (
              <div className="mb-4"><Alert kind="warn"><Tag kind="notConnected" className="mb-2">Stripe — {t.status.notConnected}</Tag><p>{bk.paymentNotConnected}</p></Alert></div>
            )}
            <ActionForm
              action={checkoutAction}
              submit={services.stripe ? bk.payStripe : bk.pay}
              msgs={{ expired: bk.failedLead, not_connected: bk.paymentNotConnected, not_found: t.errors.generic, generic: t.errors.generic }}
            >
              <input type="hidden" name="bookingId" value={b.id} />
              <input type="hidden" name="locale" value={locale} />
            </ActionForm>
          </div>
        </aside>
      </div>
    </Container>
  );
}
