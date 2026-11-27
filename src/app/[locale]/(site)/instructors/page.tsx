import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, Empty, PageHero } from "@/components/ui";
import { getPublishedInstructors } from "@/lib/data";
import { InstructorFeature } from "@/components/site/instructor";

export async function generateMetadata({ params }: PageProps<"/[locale]/instructors">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/instructors", t.pages.instructors.title, t.pages.instructors.lead);
}

export default async function Instructors({ params }: PageProps<"/[locale]/instructors">) {
  const { locale, t } = await pageCtx(params);
  const list = await getPublishedInstructors().catch(() => []);
  return (
    <>
      <PageHero kicker="Instructors" title={t.pages.instructors.title} lead={t.pages.instructors.lead} />
      <Container className="space-y-6 pt-12">
        {list.length ? list.map((ins) => <InstructorFeature key={ins.id} locale={locale} t={t} ins={ins} />) : <Empty title={t.home.instructor.empty} />}
      </Container>
    </>
  );
}
