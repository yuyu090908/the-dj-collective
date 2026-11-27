import "server-only";
import { headers } from "next/headers";
import { pageCtx } from "./i18n/server";
import { requireAdmin, requireRole, requireUser } from "./guards";
import { q1 } from "./db";

type P = Promise<{ locale: string }>;
const path = async (fallback: string) => (await headers()).get("x-pathname") ?? fallback;

/** Every protected page re-checks auth itself (layouts are not re-run on client navigation). */
export async function memberPage(params: P) {
  const { locale, t } = await pageCtx(params);
  const user = await requireUser(locale, await path("/app/dashboard"));
  return { locale, t, user };
}

export async function instructorPage(params: P) {
  const { locale, t } = await pageCtx(params);
  const user = await requireRole(locale, ["instructor"], await path("/instructor/dashboard"));
  const inst = await q1<{ id: string; dj_name: string; timezone: string }>(`select id, dj_name, timezone from instructors where user_id=$1`, [user.id]);
  return { locale, t, user, inst };
}

export async function adminPage(params: P) {
  const { locale, t } = await pageCtx(params);
  const user = await requireAdmin(locale, await path("/admin/dashboard"));
  return { locale, t, user };
}
