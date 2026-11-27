import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/set-builder">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="set-builder"
      locale={locale}
      t={t}
      available={[{ href: "/courses#level-3", label: t.nav.courses }]}
    />
  );
}
