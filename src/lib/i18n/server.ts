import "server-only";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { isLocale, locales, lp, type Locale } from "./config";
import { getDict } from ".";
import { env } from "../env";

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function pageCtx(params: Promise<{ locale: string }>) {
  const locale = await resolveLocale(params);
  return { locale, t: getDict(locale) };
}

export async function currentPath(): Promise<string> {
  const h = await headers();
  return (h.get("x-pathname") ?? "/") + (h.get("x-search") ?? "");
}

/** Title/description + canonical + hreflang alternates for a localized path. */
export function seo(locale: Locale, path: string, title: string, description?: string): Metadata {
  const t = getDict(locale);
  const languages = Object.fromEntries(locales.map((l) => [l, `${env.siteUrl}${lp(l, path)}`]));
  return {
    title,
    description: description ?? t.meta.defaultDescription,
    alternates: { canonical: `${env.siteUrl}${lp(locale, path)}`, languages: { ...languages, "x-default": `${env.siteUrl}${path}` } },
    openGraph: {
      title: `${title} — THE DJ COLLECTIVE`,
      description: description ?? t.meta.defaultDescription,
      url: `${env.siteUrl}${lp(locale, path)}`,
      siteName: "THE DJ COLLECTIVE",
      locale: { en: "en_US", ja: "ja_JP", th: "th_TH" }[locale],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
