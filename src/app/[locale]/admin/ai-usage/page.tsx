import { adminPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/admin/ai-usage">) {
  const { locale, t } = await adminPage(params);
  return <PhasePanel includeBooking={false} feature="admin-ai-usage" locale={locale} t={t} available={[{ href: "/admin/settings", label: t.admin.nav.settings }]} />;
}
