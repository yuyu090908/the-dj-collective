import { test, expect } from "@playwright/test";
import { register, login, uniqueEmail, PASSWORD } from "./helpers";

test("register → dashboard → logout → login", async ({ page }) => {
  const email = uniqueEmail("auth");
  await register(page, email, "Auth Tester");
  await expect(page.locator("main")).toContainText("Auth Tester");
  await page.context().clearCookies();
  await page.goto("/app/dashboard");
  await expect(page).toHaveURL(/\/login\?next=/);
  await login(page, email, PASSWORD, "/app/my-lessons");
  await page.waitForURL(/\/app\/my-lessons/);
});

test("wrong password shows an error and stays on login", async ({ page }) => {
  await login(page, "nobody@local.test", "wrong-password-123");
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("registration requires terms + 10-char password", async ({ page }) => {
  await page.goto("/register");
  await page.locator('input[name="displayName"]').fill("x");
  await page.locator('input[name="email"]').fill(uniqueEmail("short"));
  await page.locator('input[name="password"]').fill("short");
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/register/);
});

test("open redirect is blocked on login next=", async ({ page }) => {
  const email = uniqueEmail("redir");
  await register(page, email);
  await page.context().clearCookies();
  await login(page, email, PASSWORD, "https://evil.example.com/");
  await page.waitForURL(/localhost:3000\/app\/dashboard/);
});
