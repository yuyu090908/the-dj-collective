import { memberPage } from "@/lib/page-guards";
import { PhasePanel } from "@/components/phase";

export default async function Page({ params }: PageProps<"/[locale]/app/ai-coach">) {
  const { locale, t } = await memberPage(params);
  return (
    <PhasePanel
      feature="ai-coach"
      locale={locale}
      t={t}
      available={[{ href: "/app/my-lessons", label: t.app.items.myLessons }, { href: "/courses", label: t.nav.courses }]}
    />
  );
}
