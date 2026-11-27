import Link from "next/link";
import { headers } from "next/headers";
import { getDict } from "@/lib/i18n";
import { isLocale, lp } from "@/lib/i18n/config";
import { btn } from "@/components/ui";
import { Logo } from "@/components/visuals";

export default async function NotFound() {
  const h = await headers();
  const l = h.get("x-locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const t = getDict(locale);
  return (
    <main id="main" className="mx-auto flex min-h-[80dvh] max-w-[1440px] flex-col justify-center px-5 md:px-10">
      <Link href={lp(locale, "/")} className="mb-16"><Logo /></Link>
      <p className="kicker">404</p>
      <h1 className="mt-4 font-display text-6xl font-bold uppercase tracking-tight">{t.errors.notFound}</h1>
      <p className="mt-4 text-stone">{t.errors.notFoundLead}</p>
      <Link href={lp(locale, "/")} className={btn("primary", "mt-8 self-start")}>{t.errors.home}</Link>
    </main>
  );
}
