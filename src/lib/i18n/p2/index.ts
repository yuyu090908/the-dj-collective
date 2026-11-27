import type { Locale } from "../config";

/** Small helper for Phase 02 feature dictionaries: ja/th must have exactly the shape of en. */
export function dict<T>(en: T, ja: T, th: T) {
  const all: Record<Locale, T> = { en, ja, th };
  return (l: Locale): T => all[l] ?? en;
}
