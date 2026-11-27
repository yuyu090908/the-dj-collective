import { adminPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/admin/events">) {
  const { locale, t } = await adminPage(params);
  return <PhasePanel includeBooking={false} feature="admin-events" locale={locale} t={t} available={[{ href: "/admin/content", label: t.admin.nav.content }]} />;
}
