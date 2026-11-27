import { test, expect } from "@playwright/test";

const PUBLIC = [
  "/", "/academy", "/instructors", "/instructors/lead-instructor", "/lessons", "/lessons/bangkok", "/lessons/online",
  "/courses", "/community", "/events", "/artists", "/pricing", "/about", "/contact", "/booking", "/device-check",
  "/legal/terms", "/legal/privacy", "/legal/refund", "/legal/copyright", "/login", "/register",
];
const PROTECTED = [
  "/app/dashboard", "/app/my-lessons", "/app/profile", "/app/settings", "/app/subscription", "/app/learning", "/app/ai-coach",
  "/app/mix-lab", "/app/set-builder", "/app/practice", "/app/community", "/app/battles", "/app/ranking", "/app/artist-studio",
  "/app/gigs", "/app/messages", "/instructor/dashboard", "/instructor/calendar", "/instructor/students", "/instructor/lessons",
  "/instructor/assignments", "/instructor/reviews", "/instructor/earnings", "/admin/dashboard", "/admin/users", "/admin/instructors",
  "/admin/bookings", "/admin/courses", "/admin/payments", "/admin/community", "/admin/events", "/admin/battles", "/admin/ai-usage",
  "/admin/content", "/admin/settings",
];
const LOCALES = [
  { prefix: "", lang: "en" },
  { prefix: "/ja", lang: "ja" },
  { prefix: "/th", lang: "th" },
];

for (const { prefix, lang } of LOCALES) {
  test(`public routes render in ${lang}`, async ({ request }) => {
    for (const p of PUBLIC) {
      const url = prefix + (p === "/" && prefix ? "" : p);
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
      const html = await res.text();
      expect(html, url).toContain(`<html lang="${lang}"`);
      expect(html, `${url} hreflang`).toMatch(/hreflang="th"/i);
    }
  });
}

test("unknown route returns 404 page", async ({ request }) => {
  const res = await request.get("/this-does-not-exist");
  expect(res.status()).toBe(404);
});

test("protected routes redirect signed-out visitors to login", async ({ request }) => {
  for (const p of PROTECTED) {
    const res = await request.get(p, { maxRedirects: 0 });
    expect([302, 303, 307], p).toContain(res.status());
    expect(res.headers().location, p).toContain("/login?next=");
  }
});

test("/en prefix redirects to unprefixed English", async ({ request }) => {
  const res = await request.get("/en/pricing", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/\/pricing$/);
});

test("SEO + PWA endpoints", async ({ request }) => {
  const sm = await request.get("/sitemap.xml");
  expect(sm.status()).toBe(200);
  const xml = await sm.text();
  expect(xml).toContain("/lessons/bangkok");
  expect(xml).not.toContain("lead-instructor"); // placeholder instructor is not indexed
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  const mf = await request.get("/manifest.webmanifest");
  expect((await mf.json()).name).toBe("THE DJ COLLECTIVE");
  expect((await request.get("/sw.js")).status()).toBe(200);
});

test("placeholder instructor has no Person structured data", async ({ request }) => {
  const html = await (await request.get("/instructors/lead-instructor")).text();
  expect(html).not.toContain('"@type":"Person"');
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
