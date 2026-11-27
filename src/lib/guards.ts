import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser, type Role, type SessionUser } from "./auth/session";
import { lp, type Locale } from "./i18n/config";

export function safeNext(next: unknown, fallback = "/app/dashboard"): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : fallback;
}

export function homeFor(role: Role): string {
  return role === "admin" ? "/admin/dashboard" : role === "instructor" ? "/instructor/dashboard" : "/app/dashboard";
}

/** For pages/layouts: redirect to login when signed out. */
export async function requireUser(locale: Locale, next: string): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect(lp(locale, `/login?next=${encodeURIComponent(next)}`));
  return u;
}

/** For pages/layouts: enforce a role (admins pass every check). Admins also need 2FA. */
export async function requireRole(locale: Locale, roles: Role[], next: string): Promise<SessionUser> {
  const u = await requireUser(locale, next);
  if (u.role !== "admin" && !roles.includes(u.role)) redirect(lp(locale, "/forbidden"));
  if (u.role === "admin" && !roles.includes("member") && !u.mfaVerified) {
    redirect(lp(locale, `/mfa?next=${encodeURIComponent(next)}`));
  }
  return u;
}

export async function requireAdmin(locale: Locale, next: string): Promise<SessionUser> {
  const u = await requireUser(locale, next);
  if (u.role !== "admin") redirect(lp(locale, "/forbidden"));
  if (!u.mfaVerified) redirect(lp(locale, `/mfa?next=${encodeURIComponent(next)}`));
  return u;
}

export class AuthError extends Error {}

/** For server actions / route handlers: throw instead of redirecting. */
export async function assertUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw new AuthError("unauthenticated");
  return u;
}

export async function assertAdmin(): Promise<SessionUser> {
  const u = await assertUser();
  if (u.role !== "admin" || !u.mfaVerified) throw new AuthError("forbidden");
  return u;
}

export async function assertInstructor(): Promise<SessionUser> {
  const u = await assertUser();
  if (u.role !== "instructor" && !(u.role === "admin" && u.mfaVerified)) throw new AuthError("forbidden");
  return u;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
