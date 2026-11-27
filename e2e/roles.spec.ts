import { test, expect } from "@playwright/test";
import { ADMIN, INSTRUCTOR, login, register, totp, uniqueEmail, holdSlot, payDemo } from "./helpers";

test("member cannot open admin or instructor areas", async ({ page }) => {
  await register(page, uniqueEmail("member"));
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/forbidden/);
  await page.goto("/instructor/dashboard");
  await expect(page).toHaveURL(/\/forbidden/);
});

test("admin must enrol and verify TOTP before the admin area", async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password, "/admin/dashboard");
  await page.waitForURL(/\/mfa/);
  const secret = (await page.getByTestId("totp-secret").textContent())!.trim();
  await page.locator('input[name="code"]').fill("000000");
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator("form").getByRole("alert")).toBeVisible(); // scoped: Next.js route announcer also has role=alert
  await page.locator('input[name="code"]').fill(totp(secret));
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/);
  // every signed-in screen must render (admin can open all three areas)
  const all = [
    ...["dashboard", "users", "instructors", "bookings", "payments", "courses", "content", "settings", "community", "events", "battles", "ai-usage"].map((x) => `/admin/${x}`),
    ...["dashboard", "my-lessons", "profile", "settings", "subscription", "learning", "ai-coach", "mix-lab", "set-builder", "practice", "community", "battles", "ranking", "artist-studio", "gigs", "messages"].map((x) => `/app/${x}`),
    ...["dashboard", "calendar", "students", "lessons", "assignments", "reviews", "earnings"].map((x) => `/instructor/${x}`),
  ];
  for (const prefix of ["", "/ja", "/th"]) {
    for (const path of all) {
      const res = await page.request.get(prefix + path, { maxRedirects: 0 });
      expect(res.status(), prefix + path).toBe(200);
    }
  }
  for (const p of ["users", "instructors", "bookings", "payments", "courses", "content", "settings"]) {
    const res = await page.goto(`/admin/${p}`);
    expect(res?.status(), p).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/admin/${p}`));
  }
  await expect(page.getByText("Audit log")).toBeVisible();
  await expect(page.getByText("auth.mfa_enrolled").first()).toBeVisible();
});

test("instructor sees a student's booking", async ({ page, browser }) => {
  const student = await (await browser.newContext()).newPage();
  await register(student, uniqueEmail("for-instructor"), "Student For Instructor");
  await holdSlot(student, { slotIndex: 2 });
  await payDemo(student);
  await login(page, INSTRUCTOR.email, INSTRUCTOR.password, "/instructor/lessons");
  await page.waitForURL(/\/instructor\/lessons/);
  await expect(page.getByText("Student For Instructor").first()).toBeVisible();
  for (const p of ["dashboard", "calendar", "students", "earnings"]) {
    const res = await page.goto(`/instructor/${p}`);
    expect(res?.status(), p).toBe(200);
  }
});
