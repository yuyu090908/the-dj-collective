import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { locales, lp } from "@/lib/i18n/config";
import { getPublishedInstructors } from "@/lib/data";

export const dynamic = "force-dynamic";

const STATIC = [
  "/", "/academy", "/instructors", "/lessons", "/lessons/bangkok", "/lessons/online", "/courses",
  "/community", "/events", "/artists", "/pricing", "/about", "/contact", "/booking", "/device-check",
  "/legal/terms", "/legal/privacy", "/legal/refund", "/legal/copyright",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  // Placeholder instructors are not real people: keep them out of the index.
  const instructors = (await getPublishedInstructors().catch(() => [])).filter((i) => !i.is_placeholder);
  const paths = [...STATIC, ...instructors.map((i) => `/instructors/${i.slug}`)];
  return paths.map((p) => ({
    url: base + lp("en", p),
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.6,
    alternates: { languages: Object.fromEntries([...locales.map((l) => [l, base + lp(l, p)]), ["x-default", base + lp("en", p)]]) },
  }));
}
