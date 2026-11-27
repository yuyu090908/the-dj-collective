import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/gigs">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="gigs"
      locale={locale}
      t={t}
      available={[{ href: "/events", label: t.nav.events }]}
    />
  );
}
