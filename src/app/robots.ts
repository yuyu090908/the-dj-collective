import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/$/, "");
  const priv = ["/app", "/instructor", "/admin", "/api", "/booking/review", "/booking/complete", "/mfa"];
  const disallow = priv.flatMap((p) => [p, `/ja${p}`, `/th${p}`]);
  return { rules: [{ userAgent: "*", allow: "/", disallow }], sitemap: `${base}/sitemap.xml` };
}
