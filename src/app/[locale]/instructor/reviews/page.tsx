import { instructorPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/instructor/reviews">) {
  const { locale, t } = await instructorPage(params);
  return <PhasePanel includeBooking={false} feature="instructor-reviews" locale={locale} t={t} available={[{ href: "/instructor/students", label: t.instructor.nav.students }]} />;
}
