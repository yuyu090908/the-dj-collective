import { intlLocale, type Locale } from "./config";

export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function money(satang: number, locale: Locale, currency = "THB"): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: satang % 100 === 0 ? 0 : 2,
  }).format(satang / 100);
}

export function dateTime(iso: string | Date, locale: Locale, timeZone: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...opts,
  }).format(new Date(iso));
}

export function timeOnly(iso: string | Date, locale: Locale, timeZone: string) {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );
}
