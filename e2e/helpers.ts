import { expect, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

export const ADMIN = { email: "admin@local.test", password: "admin-pass-12345" };
export const INSTRUCTOR = { email: "instructor@local.test", password: "instructor-pass-12345" };
export const PASSWORD = "member-pass-12345";
export const uniqueEmail = (tag: string) => `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@local.test`;

export async function register(page: Page, email: string, name = "E2E Member") {
  await page.goto("/register");
  await page.locator('input[name="displayName"]').fill(name);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(/\/app\/dashboard/);
}

export async function login(page: Page, email: string, password: string, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
}

/** Go through booking steps 1–2 and hold a slot. Returns the held slot start (ISO). */
export async function holdSlot(page: Page, opts: { lastDay?: boolean; slotIndex?: number } = {}) {
  await page.goto("/booking");
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: /continue/i }).first().click();
  const chips = page.getByTestId("day-chip");
  await expect(chips.first()).toBeVisible();
  if (opts.lastDay) await chips.last().click();
  const slot = page.locator("[data-slot]").nth(opts.slotIndex ?? 0);
  const start = (await slot.getAttribute("data-slot"))!;
  await slot.click();
  await page.getByTestId("hold").click();
  return start;
}

export async function payDemo(page: Page) {
  await page.waitForURL(/\/booking\/review\?b=/);
  await page.getByRole("button", { name: /continue to payment/i }).click();
  await page.waitForURL(/\/booking\/complete\?b=/);
  await page.getByTestId("demo-pay").click();
  await expect(page.getByTestId("booking-status")).toHaveAttribute("data-status", "confirmed");
}

// RFC 6238 TOTP (SHA-1, 30 s, 6 digits) — mirrors src/lib/auth/totp.ts
export function totp(secretB32: string, t = Date.now()) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const ch of secretB32.replace(/=+$/, "").toUpperCase()) bits += alpha.indexOf(ch).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(Math.floor(t / 30_000)));
  const h = createHmac("sha1", key).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}
