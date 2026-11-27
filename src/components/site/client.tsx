"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, Menu, X } from "lucide-react";
import { localeShort, locales, lp, stripLocale, type Locale } from "@/lib/i18n/config";

export function LangSwitch({ locale, label, className = "" }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const base = stripLocale(pathname);
  const qs = sp.toString() ? `?${sp.toString()}` : "";
  return (
    <nav aria-label={label} className={`flex items-center gap-1 ${className}`}>
      <Globe size={15} className="mr-1 text-stone" aria-hidden="true" />
      {locales.map((l) => (
        <Link
          key={l}
          href={lp(l, base) + qs}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => {
            document.cookie = `djc_locale=${l};path=/;max-age=31536000;samesite=lax`;
          }}
          className={`grid min-h-11 min-w-9 place-items-center rounded-[4px] px-1.5 font-display text-xs font-semibold tracking-[0.1em] ${
            l === locale ? "text-lime" : "text-stone hover:text-ivory"
          }`}
        >
          {localeShort[l]}
        </Link>
      ))}
    </nav>
  );
}

export function MobileMenu({
  locale, items, labels, signedIn, dashHref,
}: {
  locale: Locale;
  items: { href: string; label: string }[];
  labels: { menu: string; close: string; login: string; join: string; book: string; language: string; dashboard: string };
  signedIn: boolean;
  dashHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-[6px] border border-line lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
        <span className="sr-only">{open ? labels.close : labels.menu}</span>
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ink lg:hidden">
          <nav className="flex flex-col px-5 py-6">
            {items.map((it, i) => (
              <Link
                key={it.href}
                href={lp(locale, it.href)}
                className="flex min-h-14 items-baseline gap-4 border-b border-line font-display text-2xl font-semibold uppercase tracking-tight"
              >
                <span className="kicker w-6">{String(i + 1).padStart(2, "0")}</span>
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-3 px-5" style={{ paddingBottom: "calc(1.5rem + var(--safe-b))" }}>
            {signedIn ? (
              <Link href={lp(locale, dashHref)} className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-[6px] border border-ivory/80 font-display text-sm font-semibold uppercase tracking-[0.08em]">
                {labels.dashboard}
              </Link>
            ) : (
              <>
                <Link href={lp(locale, "/login")} className="inline-flex min-h-12 items-center justify-center rounded-[6px] border border-ivory/80 font-display text-sm font-semibold uppercase tracking-[0.08em]">
                  {labels.login}
                </Link>
                <Link href={lp(locale, "/register")} className="inline-flex min-h-12 items-center justify-center rounded-[6px] bg-lime font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
                  {labels.join}
                </Link>
              </>
            )}
            <Link href={lp(locale, "/booking")} className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-[6px] bg-ivory font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
              {labels.book}
            </Link>
            <div className="col-span-2 mt-2 flex justify-center">
              <LangSwitch locale={locale} label={labels.language} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
