import { test, expect } from "@playwright/test";
import { Client } from "pg";
import { register, holdSlot, payDemo, uniqueEmail } from "./helpers";

const DB = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/djc";

test("book a lesson: choose → time → hold → review → (demo) pay → confirmed", async ({ page }) => {
  await register(page, uniqueEmail("book"));
  await holdSlot(page);
  await expect(page.getByTestId("total")).toBeVisible();
  await payDemo(page);
  await page.goto("/app/my-lessons");
  await expect(page.getByTestId("lesson-item").first()).toContainText(/Confirmed/);
});

test("double booking: second user cannot take a slot held by the first", async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  await register(a, uniqueEmail("race-a"));
  await register(b, uniqueEmail("race-b"));
  // both open the picker and see the same free slot
  for (const p of [a, b]) {
    await p.goto("/booking");
    await p.getByRole("radio").first().click();
    await p.getByRole("button", { name: /continue/i }).first().click();
    await expect(p.locator("[data-slot]").first()).toBeVisible();
  }
  const start = await a.locator("[data-slot]").nth(1).getAttribute("data-slot");
  await a.locator(`[data-slot="${start}"]`).click();
  await a.getByTestId("hold").click();
  await a.waitForURL(/\/booking\/review\?b=/);
  // B still has the stale list and tries the same time
  await b.locator(`[data-slot="${start}"]`).click();
  await b.getByTestId("hold").click();
  await expect(b.getByText(/that time was just taken/i)).toBeVisible();
  await expect(b).toHaveURL(/\/booking$/);
});

test("database rejects overlapping active bookings under concurrency (exclusion constraint)", async () => {
  const c1 = new Client({ connectionString: DB });
  await c1.connect();
  const { rows: [ctx] } = await c1.query(`
    select (select id from instructors limit 1) instructor_id,
           (select id from lessons where slug='online-private-60') lesson_id,
           (select id from users where email like 'e2e-%' order by created_at desc limit 1) user_id`);
  const start = new Date(Date.now() + 40 * 86400_000);
  start.setUTCHours(3, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60_000);
  const insert = () => {
    const c = new Client({ connectionString: DB });
    return c.connect().then(() =>
      c.query(
        `insert into bookings (user_id, instructor_id, lesson_id, starts_at, ends_at, status, price_satang, currency, mode, hold_expires_at)
         values ($1,$2,$3,$4,$5,'held',0,'THB','online', now() + interval '10 min') returning id`,
        [ctx.user_id, ctx.instructor_id, ctx.lesson_id, start.toISOString(), end.toISOString()],
      ).then((r) => ({ ok: true as const, id: r.rows[0].id }), (e) => ({ ok: false as const, code: e.code })).finally(() => c.end()),
    );
  };
  const results = await Promise.all(Array.from({ length: 8 }, insert));
  const ok = results.filter((r) => r.ok);
  const rejected = results.filter((r) => !r.ok);
  expect(ok).toHaveLength(1);
  expect(rejected.every((r) => !r.ok && r.code === "23P01")).toBe(true);
  await c1.query(`delete from bookings where starts_at=$1`, [start.toISOString()]);
  await c1.end();
});

test("cancel and reschedule a confirmed lesson (>24h ahead)", async ({ page }) => {
  await register(page, uniqueEmail("change"));
  await holdSlot(page, { lastDay: true });
  await payDemo(page);
  await page.goto("/app/my-lessons");
  const item = page.getByTestId("lesson-item").first();
  const before = await item.locator("p").first().textContent();
  await item.getByRole("button", { name: /reschedule/i }).click();
  await item.getByTestId("day-chip").last().click();
  await item.locator("[data-slot]").last().click();
  await item.getByRole("button", { name: /^save$/i }).click();
  await expect(item.locator("p").first()).not.toHaveText(before!);
  await page.getByRole("button", { name: /cancel booking/i }).first().click();
  await expect(page.getByText(/Cancelled/).first()).toBeVisible();
});

test("signed-out user is asked to log in before holding", async ({ page }) => {
  await page.goto("/booking");
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: /continue/i }).first().click();
  await expect(page.getByTestId("hold")).toBeDisabled();
});
