import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, LinkButton, PageHero, SectionHead } from "@/components/ui";
import { getCourses } from "@/lib/data";
import { tr } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[locale]/academy">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/academy", `${t.pages.academy.title} — DJ School Bangkok`, t.pages.academy.lead);
}

export default async function Academy({ params }: PageProps<"/[locale]/academy">) {
  const { locale, t } = await pageCtx(params);
  const a = t.pages.academy;
  const courses = await getCourses().catch(() => []);
  return (
    <>
      <PageHero kicker={a.kicker} title={a.title} lead={a.lead}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton locale={locale} href="/booking">{t.nav.book}</LinkButton>
          <LinkButton locale={locale} href="/lessons" variant="secondary">{t.nav.lessons}</LinkButton>
        </div>
      </PageHero>
      <Container className="pt-14">
        <ul className="grid gap-px overflow-hidden rounded-[8px] border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {a.pillars.map((p, i) => (
            <li key={p.t} className="bg-ink p-6">
              <p className="kicker tnum">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-8 font-display text-xl font-semibold uppercase tracking-tight">{p.t}</h2>
              <p className="mt-2 text-sm text-stone">{p.d}</p>
            </li>
          ))}
        </ul>
      </Container>
      <Container className="pt-20">
        <SectionHead title={a.how} />
        <ol className="grid gap-3 md:grid-cols-4">
          {a.steps.map((s, i) => (
            <li key={s} className="flex items-start gap-4 border-t-2 border-lime/70 pt-4">
              <span className="font-display text-3xl font-semibold text-lime tnum">{i + 1}</span>
              <span className="pt-1 font-display text-lg leading-tight">{s}</span>
            </li>
          ))}
        </ol>
      </Container>
      <Container className="pt-20">
        <SectionHead title={t.pages.courses.title} sub={t.pages.courses.lead} action={<LinkButton locale={locale} href="/courses" variant="secondary">{t.common.viewAll}</LinkButton>} />
        <ol className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {courses.map((c) => (
            <li key={c.id} className="rounded-[6px] border border-line p-4">
              <p className="kicker tnum">Level {String(c.level).padStart(2, "0")}</p>
              <p className="mt-6 font-display text-sm font-semibold uppercase leading-tight">{tr(c.title, locale)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
