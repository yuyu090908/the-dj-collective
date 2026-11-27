import { Check } from "lucide-react";
import { pageCtx, seo } from "@/lib/i18n/server";
import { Alert, Container, PageHero, SectionHead, Tag } from "@/components/ui";
import { getLessons, getPlans } from "@/lib/data";
import { LessonCards } from "@/components/site/lessons";
import { money } from "@/lib/i18n/format";
import { getSessionUser } from "@/lib/auth/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/pricing", t.pages.pricing.title, t.pages.pricing.lead);
}

export default async function Pricing({ params }: PageProps<"/[locale]/pricing">) {
  const { locale, t } = await pageCtx(params);
  const p = t.pages.pricing;
  const [plans, lessons, user] = await Promise.all([getPlans().catch(() => []), getLessons().catch(() => []), getSessionUser().catch(() => null)]);
  return (
    <>
      <PageHero kicker="Pricing" title={p.title} lead={p.lead} />
      <Container className="pt-14">
        <SectionHead kicker="01" title={p.membership} action={<Tag kind="provisional">{t.status.provisional}</Tag>} />
        <Alert>{p.subsNote}</Alert>
        <ul className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((pl) => {
            const hi = pl.code === "artist_pro";
            const isCurrent = user && pl.code === "free";
            return (
              <li key={pl.code} className={`flex flex-col rounded-[8px] border p-6 ${hi ? "border-lime/60 bg-lime/[0.03]" : "border-line"}`}>
                <p className="font-display text-sm font-semibold tracking-[0.12em]">{pl.name}</p>
                <p className="mt-6 font-display">
                  <span className={`tnum text-4xl font-semibold tracking-tight ${hi ? "text-lime" : ""}`}>
                    {pl.price_satang === 0 ? t.common.free : money(pl.price_satang, locale, pl.currency)}
                  </span>
                  {pl.price_satang > 0 && <span className="ml-1 text-sm text-stone">{t.common.perMonth}</span>}
                </p>
                <p className="kicker mt-6 mb-3">{p.includes}</p>
                <ul className="space-y-2 text-sm">
                  {(pl.features[locale] ?? pl.features.en ?? []).map((f) => (
                    <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-lime" aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {isCurrent ? <Tag kind="lime">{p.current}</Tag> : pl.price_satang > 0 ? <Tag kind="phase">Phase 02</Tag> : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-stone">{p.payments}</p>
      </Container>
      <Container className="pt-20">
        <SectionHead kicker="02" title={p.lessons} />
        <LessonCards lessons={lessons} locale={locale} t={t} />
      </Container>
    </>
  );
}
