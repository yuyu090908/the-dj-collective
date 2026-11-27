import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, PageHero, SectionHead } from "@/components/ui";
import { getLessons, getStudio } from "@/lib/data";
import { LessonCards, StudioBlock } from "@/components/site/lessons";

export async function generateMetadata({ params }: PageProps<"/[locale]/lessons/bangkok">) {
  const { locale, t } = await pageCtx(params);
  const title = { en: "DJ Lessons Bangkok — In-person DJ School", ja: "バンコク DJレッスン — 対面DJスクール", th: "เรียนดีเจ กรุงเทพ — สอนดีเจตัวต่อตัว" }[locale];
  return seo(locale, "/lessons/bangkok", title, t.pages.lessons.inPersonLead);
}

export default async function Bangkok({ params }: PageProps<"/[locale]/lessons/bangkok">) {
  const { locale, t } = await pageCtx(params);
  const p = t.pages.lessons;
  const [lessons, studio] = await Promise.all([getLessons("in_person").catch(() => []), getStudio().catch(() => null)]);
  return (
    <>
      <PageHero kicker="Bangkok Studio" title={p.inPerson} lead={p.inPersonLead} />
      <Container className="pt-14">
        <LessonCards lessons={lessons} locale={locale} t={t} />
      </Container>
      <Container className="pt-20">
        <SectionHead title={p.studioInfo} sub={t.booking.cancelPolicy} />
        <StudioBlock studio={studio} locale={locale} t={t} />
      </Container>
    </>
  );
}
