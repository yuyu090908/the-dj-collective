import { headers } from "next/headers";
import { pageCtx } from "@/lib/i18n/server";
import { requireRole } from "@/lib/guards";
import { AppShell } from "@/components/app/shell";

export const metadata = { robots: { index: false } };

export default async function InstructorLayout({ children, params }: LayoutProps<"/[locale]/instructor">) {
  const { locale, t } = await pageCtx(params);
  const path = (await headers()).get("x-pathname") ?? "/instructor/dashboard";
  const user = await requireRole(locale, ["instructor"], path);
  return <AppShell area="instructor" locale={locale} t={t} user={user}>{children}</AppShell>;
}
