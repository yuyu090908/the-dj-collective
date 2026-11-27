import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/mix-lab">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="mix-lab"
      locale={locale}
      t={t}
      available={[{ href: "/lessons/online", label: t.nav.lessons }]}
    />
  );
}
