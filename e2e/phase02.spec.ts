import { test, expect, type Page } from "@playwright/test";
import { register, uniqueEmail } from "./helpers";

async function subscribe(page: Page, plan: string) {
  await page.goto("/app/subscription");
  await page.getByTestId(`plan-${plan}`).locator('button[type="submit"]').click();
  await expect(page.getByTestId("current-plan")).toHaveAttribute("data-plan", plan);
}

test("free member: module 1 is a preview, others are locked; demo subscription unlocks them and quizzes are graded", async ({ page }) => {
  await register(page, uniqueEmail("learn"));
  await page.goto("/app/learning");
  const links = page.locator('ol a[href*="/app/learning/"]');
  const second = await links.nth(1).getAttribute("href");
  await page.goto(second!);
  await expect(page.getByTestId("module-locked")).toBeVisible();

  await subscribe(page, "member");
  await page.goto(second!);
  await expect(page.getByTestId("module-locked")).toHaveCount(0);
  const quiz = page.getByTestId("quiz");
  for (const fs of await quiz.locator("fieldset").all()) await fs.locator('input[type="radio"]').first().check();
  await quiz.getByRole("button").last().click();
  await expect(page.getByTestId("quiz-score")).toContainText("%");
  await page.goto("/app/learning");
  await expect(page.getByTestId("learning-history")).toBeVisible();
});

test("AI Coach shows NOT CONNECTED and disables input without an API key", async ({ page }) => {
  await register(page, uniqueEmail("coach"));
  await page.goto("/app/ai-coach");
  await expect(page.getByTestId("coach-not-connected")).toBeVisible();
  await expect(page.getByTestId("coach-input")).toBeDisabled();
  await expect(page.getByTestId("coach-send")).toBeDisabled();
  const res = await page.request.post("/api/coach", { data: { message: "hi", locale: "en" } });
  expect(res.status()).toBe(503);
  expect((await res.json()).error).toBe("not_connected");
});

test("Set Builder: locked on free, then import CSV + rekordbox XML, build a set, check transitions, save", async ({ page }) => {
  await register(page, uniqueEmail("sets"));
  await page.goto("/app/set-builder");
  await expect(page.getByTestId("set-locked")).toBeVisible();

  await subscribe(page, "artist_pro");
  await page.goto("/app/set-builder");
  await page.getByTestId("lib-file").setInputFiles("e2e/fixtures/library.csv");
  await expect(page.getByTestId("lib-import")).toContainText(/Imported 4 tracks/);
  await page.getByTestId("lib-file").setInputFiles("e2e/fixtures/rekordbox.xml");
  await expect(page.getByTestId("lib-import")).toContainText(/Imported 2 tracks/);
  await page.getByTestId("lib-file").setInputFiles("e2e/fixtures/library.csv");
  await expect(page.getByTestId("lib-import")).toContainText(/Imported 0 tracks \(4 skipped/);
  await expect(page.getByTestId("lib-count")).toContainText("6");
  await expect(page.getByTestId("lib-table")).toContainText("12A"); // Dbm → 12A

  await page.locator('input[name="title"]').first().fill("E2E warm-up");
  await page.locator('input[name="minutes"]').fill("30");
  await page.getByRole("button", { name: "Create set" }).click();
  await page.waitForURL(/\/app\/set-builder\/[0-9a-f-]{36}$/);

  const results = page.getByTestId("lib-results");
  for (const name of ["Opening Pad", "Second Wind", "Clash Test"]) await results.getByRole("button", { name: `Add: ${name}` }).click();
  const tr = page.getByTestId("transition");
  await expect(tr.nth(0)).toContainText("BPM +0.8%");
  await expect(tr.nth(0)).toContainText("adjacent"); // 8A → 9A
  await expect(tr.nth(1)).toContainText("clash");    // 9A → 2B
  await expect(page.getByTestId("set-stats")).toContainText("1 key clashes");
  await page.getByRole("button", { name: "Move up" }).nth(2).click(); // Clash Test to position 2
  await page.getByTestId("set-save").click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("set-tracks").locator("li").nth(1)).toContainText("Clash Test");
  await expect(page.getByTestId("energy-chart")).toBeVisible();
});
