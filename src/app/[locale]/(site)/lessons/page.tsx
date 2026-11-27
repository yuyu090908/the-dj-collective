import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, LinkButton, PageHero, SectionHead } from "@/components/ui";
import { getLessons } from "@/lib/data";
import { LessonCards } from "@/components/site/lessons";

export async function generateMetadata({ params }: PageProps<"/[locale]/lessons">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/lessons", `${t.pages.lessons.title} — DJ Lessons Bangkok & Online`, t.pages.lessons.lead);
}

export default async function Lessons({ params }: PageProps<"/[locale]/lessons">) {
  const { locale, t } = await pageCtx(params);
  const p = t.pages.lessons;
  const all = await getLessons().catch(() => []);
  return (
    <>
      <PageHero kicker="Lessons" title={p.title} lead={p.lead} />
      <Container className="pt-14">
        <SectionHead kicker="01" title={p.inPerson} sub={p.inPersonLead} action={<LinkButton locale={locale} href="/lessons/bangkok" variant="secondary">{t.common.learnMore}</LinkButton>} />
        <LessonCards lessons={all.filter((l) => l.mode === "in_person")} locale={locale} t={t} />
      </Container>
      <Container className="pt-20">
        <SectionHead kicker="02" title={p.online} sub={p.onlineLead} action={<LinkButton locale={locale} href="/lessons/online" variant="secondary">{t.common.learnMore}</LinkButton>} />
        <LessonCards lessons={all.filter((l) => l.mode === "online")} locale={locale} t={t} />
      </Container>
    </>
  );
}
