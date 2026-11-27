import { adminPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/admin/battles">) {
  const { locale, t } = await adminPage(params);
  return <PhasePanel includeBooking={false} feature="admin-battles" locale={locale} t={t} available={[{ href: "/admin/users", label: t.admin.nav.users }]} />;
}
