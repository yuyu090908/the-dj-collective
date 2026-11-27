import "server-only";
import en, { type Dict } from "./dictionaries/en";
import ja from "./dictionaries/ja";
import th from "./dictionaries/th";
import type { Locale } from "./config";

const dicts: Record<Locale, Dict> = { en, ja, th };
export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? en;
}
export type { Dict };
