import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/messages">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="messages"
      locale={locale}
      t={t}
      available={[{ href: "/contact", label: t.nav.contact }]}
    />
  );
}
