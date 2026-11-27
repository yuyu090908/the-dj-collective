export const locales = ["en", "ja", "th"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeNames: Record<Locale, string> = { en: "English", ja: "日本語", th: "ไทย" };
export const localeShort: Record<Locale, string> = { en: "EN", ja: "JA", th: "TH" };
export const htmlLang: Record<Locale, string> = { en: "en", ja: "ja", th: "th" };
export const intlLocale: Record<Locale, string> = { en: "en-GB", ja: "ja-JP", th: "th-TH" };
export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** Build a path for a locale. English is unprefixed. */
export function lp(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip a locale prefix from a pathname. */
export function stripLocale(pathname: string): string {
  const m = pathname.match(/^\/(ja|th|en)(?=\/|$)/);
  if (!m) return pathname || "/";
  const rest = pathname.slice(m[0].length);
  return rest || "/";
}

export type Localized = Partial<Record<Locale, string>> | null | undefined;
export function tr(v: Localized, locale: Locale): string {
  if (!v) return "";
  return v[locale] || v.en || v.ja || v.th || "";
}
