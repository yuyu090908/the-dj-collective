import { pageCtx } from "@/lib/i18n/server";
import { Container, LinkButton } from "@/components/ui";

export const metadata = { robots: { index: false }, title: "403" };

export default async function Forbidden({ params }: PageProps<"/[locale]/forbidden">) {
  const { locale, t } = await pageCtx(params);
  return (
    <Container className="py-24">
      <p className="kicker">403</p>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase tracking-tight">{t.auth.forbidden}</h1>
      <div className="mt-8"><LinkButton locale={locale} href="/">{t.errors.home}</LinkButton></div>
    </Container>
  );
}
