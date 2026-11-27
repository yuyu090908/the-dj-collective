import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, services } from "../env";
import { q1 } from "../db";
import { sign, verify } from "./crypto";

export type Role = "member" | "instructor" | "admin";
export type SessionUser = {
  id: string;
  email: string;
  role: Role;
  locale: "en" | "ja" | "th";
  timezone: string;
  status: string;
  displayName: string;
  experience: "beginner" | "intermediate" | "advanced";
  goal: string | null;
  totpEnabled: boolean;
  mfaVerified: boolean;
};

export const SESSION_COOKIE = "djc_session";
export const MFA_COOKIE = "djc_mfa";
const SESSION_TTL = 60 * 60 * 24 * 14; // 14 days
const MFA_TTL = 60 * 60 * 12;

export const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.isProd,
  path: "/",
};

/** Supabase server client (only when Supabase Auth is configured). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a Server Component — proxy refreshes the session */
        }
      },
    },
  });
}

async function currentUserId(): Promise<string | null> {
  if (services.supabaseAuth) {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  }
  const store = await cookies();
  const s = verify<{ uid: string }>(store.get(SESSION_COOKIE)?.value);
  return s?.uid ?? null;
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!env.databaseUrl) return null;
  const uid = await currentUserId().catch(() => null);
  if (!uid) return null;
  const row = await q1<{
    id: string; email: string; role: Role; locale: SessionUser["locale"]; timezone: string; status: string;
    display_name: string | null; experience_level: SessionUser["experience"]; goal: string | null; totp_enabled: boolean;
  }>(
    `select u.id, u.email, u.role, u.locale, u.timezone, u.status, u.totp_enabled,
            p.display_name, p.experience_level, p.goal
       from users u left join profiles p on p.user_id = u.id where u.id = $1`,
    [uid],
  );
  if (!row || row.status !== "active") return null;
  const store = await cookies();
  const mfa = verify<{ uid: string }>(store.get(MFA_COOKIE)?.value);
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    locale: row.locale,
    timezone: row.timezone,
    status: row.status,
    displayName: row.display_name || row.email.split("@")[0],
    experience: row.experience_level ?? "beginner",
    goal: row.goal,
    totpEnabled: row.totp_enabled,
    mfaVerified: Boolean(mfa && mfa.uid === row.id),
  };
});

export async function setLocalSession(uid: string) {
  const store = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  store.set(SESSION_COOKIE, sign({ uid, exp }), { ...cookieOpts, maxAge: SESSION_TTL });
}

export async function setMfaVerified(uid: string) {
  const store = await cookies();
  const exp = Math.floor(Date.now() / 1000) + MFA_TTL;
  store.set(MFA_COOKIE, sign({ uid, exp }), { ...cookieOpts, maxAge: MFA_TTL });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(MFA_COOKIE);
  if (services.supabaseAuth) {
    const sb = await supabaseServer();
    await sb.auth.signOut().catch(() => {});
  }
}
