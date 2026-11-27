import { test, expect } from "@playwright/test";
import { register, uniqueEmail } from "./helpers";

const WIDTHS = [320, 375, 390, 430];
const PAGES = ["/", "/ja", "/th", "/lessons", "/lessons/bangkok", "/pricing", "/booking", "/instructors/lead-instructor", "/about", "/contact", "/register", "/courses", "/community"];

for (const w of WIDTHS) {
  test(`no horizontal scroll at ${w}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      await page.goto(p);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, `${p} @${w}`).toBeLessThanOrEqual(w);
    }
    await register(page, uniqueEmail(`m${w}`));
    for (const p of ["/app/dashboard", "/app/my-lessons", "/app/settings", "/app/ai-coach", "/app/mix-lab", "/app/learning", "/app/subscription", "/app/set-builder", "/ja/app/ai-coach", "/th/app/mix-lab"]) {
      await page.goto(p);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, `${p} @${w}`).toBeLessThanOrEqual(w);
    }
    await ctx.close();
  });
}

test("tap targets in mobile header are at least 44px", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto("/");
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("header a, header button")]
      .filter((e) => (e as HTMLElement).offsetParent !== null && !e.classList.contains("sr-only"))
      .map((e) => ({ t: (e.textContent || e.getAttribute("aria-label") || "").trim(), h: e.getBoundingClientRect().height }))
      .filter((x) => x.h < 44),
  );
  expect(small).toEqual([]);
  await ctx.close();
});
