import { pageCtx } from "@/lib/i18n/server";
import { requireUser } from "@/lib/guards";
import { AppShell } from "@/components/app/shell";
import { headers } from "next/headers";

export const metadata = { robots: { index: false } };

export default async function MemberLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale, t } = await pageCtx(params);
  const path = (await headers()).get("x-pathname") ?? "/app/dashboard";
  const user = await requireUser(locale, path);
  return <AppShell area="member" locale={locale} t={t} user={user}>{children}</AppShell>;
}
