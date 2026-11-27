import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/battles">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="battles"
      locale={locale}
      t={t}
      available={[{ href: "/app/profile", label: t.app.items.profile }]}
    />
  );
}
