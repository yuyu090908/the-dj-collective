import { headers } from "next/headers";
import { pageCtx } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/guards";
import { AppShell } from "@/components/app/shell";

export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const { locale, t } = await pageCtx(params);
  const path = (await headers()).get("x-pathname") ?? "/admin/dashboard";
  const user = await requireAdmin(locale, path);
  return <AppShell area="admin" locale={locale} t={t} user={user}>{children}</AppShell>;
}
