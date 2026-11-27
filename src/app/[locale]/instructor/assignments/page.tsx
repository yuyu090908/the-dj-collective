import { instructorPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/instructor/assignments">) {
  const { locale, t } = await instructorPage(params);
  return <PhasePanel includeBooking={false} feature="instructor-assignments" locale={locale} t={t} available={[{ href: "/instructor/lessons", label: t.instructor.nav.lessons }]} />;
}
