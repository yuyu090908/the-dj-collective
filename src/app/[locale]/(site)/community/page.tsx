import { pageCtx, seo } from "@/lib/i18n/server";
import { Container } from "@/components/ui";
import { PhasePanel } from "@/components/phase";

export async function generateMetadata({ params }: PageProps<"/[locale]/community">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/community", t.pages.community.title, t.pages.community.lead);
}

export default async function Community({ params }: PageProps<"/[locale]/community">) {
  const { locale, t } = await pageCtx(params);
  return (
    <Container className="pt-10">
      <PhasePanel
        feature="community"
        locale={locale}
        t={t}
        available={[
          { href: "/register", label: t.auth.registerTitle },
          { href: "/courses", label: t.nav.courses },
        ]}
      />
    </Container>
  );
}
