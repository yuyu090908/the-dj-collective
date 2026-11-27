"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { services } from "../env";
import { q, q1, tx, isPgError } from "../db";
import { hashPassword, verifyPassword } from "./crypto";
import { clearSession, getSessionUser, setLocalSession, setMfaVerified, supabaseServer } from "./session";
import { verifyTotp } from "./totp";
import { rateLimit } from "../rate-limit";
import { clientIp, homeFor, safeNext } from "../guards";
import { audit } from "../audit";
import { isLocale, lp, type Locale } from "../i18n/config";

export type FormState = { error?: string; ok?: boolean; message?: string; fields?: Record<string, string> } | undefined;

const TERMS_VERSION = "2026-11-draft";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(10).max(200),
  displayName: z.string().trim().min(1).max(60),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["start", "improve", "club", "online", "analyze", "community"]).optional(),
  terms: z.literal("on"),
  locale: z.string(),
  next: z.string().optional(),
});

function localeOf(v: FormDataEntryValue | null): Locale {
  const s = String(v ?? "en");
  return isLocale(s) ? s : "en";
}

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const locale = localeOf(fd.get("locale"));
  if (!rateLimit(`register:${await clientIp()}`, 10, 60_000)) return { error: "rateLimited" };
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.path[0];
    if (issue === "password") return { error: "weak" };
    if (issue === "terms") return { error: "termsRequired" };
    return { error: "invalidInput" };
  }
  const d = parsed.data;
  let uid: string;

  if (services.supabaseAuth) {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.signUp({
      email: d.email,
      password: d.password,
      options: { data: { locale, display_name: d.displayName } },
    });
    if (error) return { error: /registered|exists/i.test(error.message) ? "exists" : "generic" };
    if (!data.user) return { error: "generic" };
    uid = data.user.id;
    await finishProfile(uid, d, locale);
    if (!data.session) return { ok: true, message: "checkEmail" };
  } else {
    try {
      uid = await tx(async (c) => {
        const r = await c.query(
          `insert into auth.users (email, encrypted_password, raw_user_meta_data) values ($1,$2,$3) returning id`,
          [d.email, hashPassword(d.password), { locale, display_name: d.displayName }],
        );
        return r.rows[0].id as string;
      });
    } catch (e) {
      if (isPgError(e, "23505")) return { error: "exists" };
      throw e;
    }
    await finishProfile(uid, d, locale);
    await setLocalSession(uid);
  }
  redirect(lp(locale, safeNext(d.next, "/app/dashboard")));
}

async function finishProfile(uid: string, d: z.infer<typeof registerSchema>, locale: Locale) {
  await q(`update users set locale=$2 where id=$1`, [uid, locale]);
  await q(
    `update profiles set display_name=$2, experience_level=$3, goal=$4 where user_id=$1`,
    [uid, d.displayName, d.experience, d.goal ?? null],
  );
  await q(
    `insert into consent_records (user_id, kind, granted, version) values ($1,'terms',true,$2), ($1,'privacy',true,$2)`,
    [uid, TERMS_VERSION],
  );
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  locale: z.string(),
  next: z.string().optional(),
});

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const locale = localeOf(fd.get("locale"));
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "invalid" };
  const { email, password, next } = parsed.data;
  if (!rateLimit(`login:${await clientIp()}:${email}`, 8, 60_000)) return { error: "rateLimited" };

  let uid: string | null = null;
  if (services.supabaseAuth) {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error: "invalid" };
    uid = data.user.id;
  } else {
    const row = await q1<{ id: string; encrypted_password: string }>(
      `select id, encrypted_password from auth.users where email=$1`,
      [email],
    );
    // constant-ish work even when the user does not exist
    const ok = verifyPassword(password, row?.encrypted_password ?? "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==");
    if (!row || !ok) return { error: "invalid" };
    uid = row.id;
  }
  const u = await q1<{ role: "member" | "instructor" | "admin"; status: string }>(
    `select role, status from users where id=$1`,
    [uid],
  );
  if (!u || u.status !== "active") return { error: "invalid" };
  if (!services.supabaseAuth) await setLocalSession(uid);
  if (u.role === "admin") await audit(uid, "auth.login");
  redirect(lp(locale, safeNext(next, homeFor(u.role))));
}

export async function logoutAction(fd: FormData) {
  const locale = localeOf(fd.get("locale"));
  await clearSession();
  redirect(lp(locale, "/"));
}

export async function mfaAction(_: FormState, fd: FormData): Promise<FormState> {
  const locale = localeOf(fd.get("locale"));
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return { error: "forbidden" };
  if (!rateLimit(`mfa:${user.id}`, 6, 60_000)) return { error: "rateLimited" };
  const code = String(fd.get("code") ?? "");
  const row = await q1<{ totp_secret: string | null; totp_enabled: boolean }>(
    `select totp_secret, totp_enabled from users where id=$1`,
    [user.id],
  );
  if (!row?.totp_secret || !verifyTotp(row.totp_secret, code)) {
    await audit(user.id, "auth.mfa_failed");
    return { error: "mfaInvalid" };
  }
  if (!row.totp_enabled) {
    await q(`update users set totp_enabled=true where id=$1`, [user.id]);
    await audit(user.id, "auth.mfa_enrolled");
  }
  await setMfaVerified(user.id);
  await audit(user.id, "auth.mfa_verified");
  redirect(lp(locale, safeNext(fd.get("next"), "/admin/dashboard")));
}
