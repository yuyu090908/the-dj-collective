"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { q, tx } from "./db";
import { getSessionUser, clearSession } from "./auth/session";
import { isLocale, lp } from "./i18n/config";
import { isValidTimeZone } from "./booking/tz";
import { audit } from "./audit";
import type { FormState } from "./auth/actions";

const list = (v: FormDataEntryValue | null) =>
  String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 20).map((s) => s.slice(0, 40));

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  djName: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(1000).optional(),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["start", "improve", "club", "online", "analyze", "community"]),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  hours: z.coerce.number().min(0).max(80).optional(),
});

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const u = await getSessionUser();
  if (!u) return { error: "generic" };
  const p = profileSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(
    `update profiles set display_name=$2, dj_name=nullif($3,''), bio=nullif($4,''), experience_level=$5, goal=$6, city=nullif($7,''),
            country=nullif($8,''), weekly_practice_hours=$9, genres=$10, equipment=$11, languages=$12, is_public=$13 where user_id=$1`,
    [u.id, d.displayName, d.djName ?? "", d.bio ?? "", d.experience, d.goal, d.city ?? "", d.country ?? "", d.hours ?? null,
      list(fd.get("genres")), list(fd.get("equipment")), list(fd.get("languages")), fd.get("isPublic") === "on"],
  );
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  const u = await getSessionUser();
  if (!u) return { error: "generic" };
  const locale = String(fd.get("locale"));
  const tz = String(fd.get("timezone"));
  if (!isLocale(locale) || !isValidTimeZone(tz)) return { error: "invalidInput" };
  await q(`update users set locale=$2, timezone=$3 where id=$1`, [u.id, locale, tz]);
  for (const kind of ["ai_learning_context", "marketing"] as const) {
    const want = fd.get(kind) === "on";
    const cur = await q<{ granted: boolean }>(`select granted from consent_records where user_id=$1 and kind=$2 order by created_at desc limit 1`, [u.id, kind]);
    if ((cur[0]?.granted ?? false) !== want) {
      await q(`insert into consent_records (user_id, kind, granted, version) values ($1,$2,$3,'2026-11')`, [u.id, kind, want]);
    }
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccountAction(_: FormState, fd: FormData): Promise<FormState> {
  const u = await getSessionUser();
  if (!u) return { error: "generic" };
  if (fd.get("confirm") !== "DELETE") return { error: "invalidInput" };
  if (u.role === "admin") return { error: "forbidden" };
  // Bookings reference users with on delete cascade; payments keep an anonymised row for accounting.
  await tx(async (c) => {
    await c.query(`update payments set user_id=null where user_id=$1`, [u.id]);
    await c.query(`update instructors set user_id=null where user_id=$1`, [u.id]);
    await c.query(`delete from auth.users where id=$1`, [u.id]);
  });
  await audit(null, "account.deleted", "user", u.id);
  await clearSession();
  const l = String(fd.get("locale"));
  redirect(lp(isLocale(l) ? l : "en", "/"));
}
