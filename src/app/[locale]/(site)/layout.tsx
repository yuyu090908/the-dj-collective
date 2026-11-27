import { SiteFooter, SiteHeader } from "@/components/site/chrome";
import { pageCtx } from "@/lib/i18n/server";
import { getSessionUser } from "@/lib/auth/session";

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale, t } = await pageCtx(params);
  const user = await getSessionUser().catch(() => null);
  return (
    <>
      <SiteHeader locale={locale} t={t} user={user} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
