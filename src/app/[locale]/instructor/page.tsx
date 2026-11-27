import { redirect } from "next/navigation";
import { lp } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/server";

export default async function Index({ params }: PageProps<"/[locale]/instructor">) {
  const locale = await resolveLocale(params);
  redirect(lp(locale, "/instructor/dashboard"));
}
