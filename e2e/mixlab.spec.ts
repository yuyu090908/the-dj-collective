import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { holdSlot, INSTRUCTOR, login, payDemo, register, uniqueEmail } from "./helpers";

const WAV = "/tmp/e2e-mix.wav";

test.beforeAll(() => {
  if (!existsSync(WAV)) execFileSync("npx", ["tsx", "tests/make-wav.ts", WAV, "150", "22050"], { stdio: "inherit" });
});

test("Mix Lab analyses a synthesized 124 BPM mix in the browser and stores only measurements", async ({ page }) => {
  test.setTimeout(120_000);
  await register(page, uniqueEmail("mix"));
  await page.goto("/app/mix-lab");
  await expect(page.getByText(/never leaves this device/i)).toBeVisible();
  await page.getByTestId("mix-file").setInputFiles(WAV);
  await page.locator('input[name="title"]').fill("E2E click track");
  await page.getByTestId("mix-analyze").click();
  await page.waitForURL(/\/app\/mix-lab\/[0-9a-f-]{36}$/, { timeout: 90_000 });
  const bpm = Number((await page.getByTestId("m-bpm").locator("p").nth(1).innerText()).replace(/[^\d.]/g, ""));
  expect(Math.abs(bpm - 124)).toBeLessThan(1);
  await expect(page.getByTestId("m-clips")).toContainText("2");
  await expect(page.getByTestId("m-key")).toContainText("8A");
  await expect(page.getByTestId("mix-advice")).toContainText(/clipping/i);
  await expect(page.getByTestId("score-overall")).toHaveText(/\d+/);

  // free plan: 1 analysis per month → quota reached
  await page.goto("/app/mix-lab");
  await expect(page.getByTestId("mix-history")).toContainText("E2E click track");
  await expect(page.getByTestId("mix-analyze")).toBeDisabled();
});

test("student shares an analysis; their instructor reviews it; student sees the review", async ({ page, browser }) => {
  test.setTimeout(150_000);
  await register(page, uniqueEmail("share"), "Sharing Student");
  await holdSlot(page, { lastDay: true, slotIndex: 1 });
  await payDemo(page);
  await page.goto("/app/mix-lab");
  await page.getByTestId("mix-file").setInputFiles(WAV);
  await page.locator('input[name="title"]').fill("Shared practice mix");
  await page.getByTestId("mix-analyze").click();
  await page.waitForURL(/\/app\/mix-lab\/[0-9a-f-]{36}$/, { timeout: 90_000 });
  const url = page.url();
  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.getByText("Shared with your instructors.")).toBeVisible();

  const inst = await (await browser.newContext()).newPage();
  await login(inst, INSTRUCTOR.email, INSTRUCTOR.password, "/instructor/reviews");
  await inst.waitForURL(/\/instructor\/reviews/);
  const row = inst.getByTestId("instructor-shared").getByRole("link", { name: /Shared practice mix/ }).first();
  await expect(row).toContainText("Sharing Student");
  await row.click();
  await inst.waitForURL(/\/instructor\/reviews\/[0-9a-f-]{36}$/);
  await expect(inst.getByTestId("m-clips")).toContainText("2");
  await inst.locator('textarea[name="comment"]').fill("Good tempo control. Bring the channel gain down before 0:30.");
  await inst.getByRole("button", { name: "Post review" }).click();
  await expect(inst.getByText("Review posted.")).toBeVisible();

  await page.goto(url);
  await expect(page.getByTestId("mix-reviews")).toContainText("Bring the channel gain down");
  // an unrelated member cannot open it
  const other = await (await browser.newContext()).newPage();
  await register(other, uniqueEmail("nosy"));
  const res = await other.goto(url.replace(/^.*\/app/, "/app"));
  expect(res?.status()).toBe(404);
});
