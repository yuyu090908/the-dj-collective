"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { q, q1 } from "./db";
import { assertAdmin } from "./guards";
import { audit } from "./audit";
import { cancelBooking, refundBooking } from "./booking/service";
import type { FormState } from "./auth/actions";

const url = z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "https only");
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 30);
const done = () => revalidatePath("/", "layout");

export async function setRoleAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const id = String(fd.get("userId"));
  const role = z.enum(["member", "instructor", "admin"]).parse(fd.get("role"));
  const status = z.enum(["active", "suspended"]).parse(fd.get("status"));
  if (id === admin.id && (role !== "admin" || status !== "active")) return { error: "forbidden" };
  const before = await q1(`select role, status from users where id=$1`, [id]);
  await q(`update users set role=$2, status=$3 where id=$1`, [id, role, status]);
  await audit(admin.id, "user.update", "user", id, { before, after: { role, status } });
  done();
  return { ok: true };
}

const instructorSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,60}$/),
  djName: z.string().trim().min(1).max(80),
  baseCity: z.string().trim().max(80),
  photoUrl: url, introVideoUrl: url,
  bioEn: z.string().max(3000), bioJa: z.string().max(3000), bioTh: z.string().max(3000),
  userEmail: z.string().trim().max(200).optional(),
  timezone: z.string().max(64),
});

export async function saveInstructorAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const p = instructorSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  let userId: string | null = null;
  if (d.userEmail) {
    const u = await q1<{ id: string }>(`select id from users where email=lower($1)`, [d.userEmail]);
    if (!u) return { error: "userNotFound" };
    userId = u.id;
    await q(`update users set role='instructor' where id=$1 and role='member'`, [userId]);
  }
  // achievements: one per line "Title | Venue | Year" — only lines prefixed with "✓ " are marked verified
  const achievements = lines(fd.get("achievements")).map((l) => {
    const verified = l.startsWith("✓");
    const [title, venue, year] = l.replace(/^✓\s*/, "").split("|").map((s) => s.trim());
    return { title, venue, year, verified };
  });
  const social = Object.fromEntries(["instagram", "soundcloud", "mixcloud", "youtube", "tiktok"].map((k) => [k, String(fd.get(`social_${k}`) ?? "").trim()]).filter(([, v]) => /^https:\/\//.test(v)));
  const vals = [
    d.slug, d.djName, d.baseCity, d.photoUrl || null, d.introVideoUrl || null, { en: d.bioEn, ja: d.bioJa, th: d.bioTh },
    lines(fd.get("genres")), lines(fd.get("languages")), JSON.stringify(achievements), lines(fd.get("equipment")),
    lines(fd.get("mixUrls")).filter((u) => /^https:\/\//.test(u)), social, fd.get("isPublished") === "on", fd.get("isPlaceholder") === "on", userId, d.timezone,
  ];
  let id = d.id;
  if (id) {
    await q(
      `update instructors set slug=$2, dj_name=$3, base_city=$4, photo_url=$5, intro_video_url=$6, bio=$7, genres=$8, languages=$9,
              achievements=$10, equipment=$11, mix_urls=$12, social=$13, is_published=$14, is_placeholder=$15,
              user_id=coalesce($16, user_id), timezone=$17 where id=$1`,
      [id, ...vals],
    );
  } else {
    const r = await q<{ id: string }>(
      `insert into instructors (slug, dj_name, base_city, photo_url, intro_video_url, bio, genres, languages, achievements, equipment, mix_urls, social, is_published, is_placeholder, user_id, timezone)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning id`,
      vals,
    );
    id = r[0].id;
  }
  await audit(admin.id, d.id ? "instructor.update" : "instructor.create", "instructor", id, { slug: d.slug, published: vals[12] });
  done();
  return { ok: true };
}

export async function adminCancelBookingAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const id = String(fd.get("bookingId"));
  await cancelBooking(id, { id: admin.id, role: "admin" }, "cancelled_by_admin");
  await audit(admin.id, "booking.cancel", "booking", id);
  done();
  return { ok: true };
}

export async function adminRefundAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const id = String(fd.get("bookingId"));
  const ok = await refundBooking(id, admin.id, "admin_refund").catch(() => false);
  done();
  return ok ? { ok: true } : { error: "generic" };
}

export async function savePlanAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const p = z.object({ code: z.string(), price: z.coerce.number().min(0).max(1_000_000), coach: z.coerce.number().int().min(0), mix: z.coerce.number().int().min(0), mb: z.coerce.number().int().min(1).max(2000), minutes: z.coerce.number().int().min(1).max(600) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(`update plans set price_satang=$2, quotas=$3, is_active=$4, updated_at=now() where code=$1`, [
    d.code, Math.round(d.price * 100), { ai_coach_messages: d.coach, mix_analyses: d.mix, max_upload_mb: d.mb, max_minutes: d.minutes }, fd.get("active") === "on",
  ]);
  await audit(admin.id, "plan.update", "plan", d.code, d);
  done();
  return { ok: true };
}

export async function saveLessonAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const p = z.object({ id: z.string().uuid(), price: z.coerce.number().min(0).max(1_000_000), duration: z.coerce.number().int().min(15).max(480), titleEn: z.string().min(1).max(120), titleJa: z.string().max(120), titleTh: z.string().max(120) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(`update lessons set price_satang=$2, duration_min=$3, title=$4, is_provisional=$5, is_active=$6 where id=$1`, [
    d.id, Math.round(d.price * 100), d.duration, { en: d.titleEn, ja: d.titleJa, th: d.titleTh }, fd.get("confirmed") !== "on", fd.get("active") === "on",
  ]);
  await audit(admin.id, "lesson.update", "lesson", d.id, d);
  done();
  return { ok: true };
}

export async function saveStudioAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const p = z.object({ id: z.string().uuid(), name: z.string().min(1).max(120), address: z.string().max(300), mapQuery: z.string().max(300), en: z.string().max(500), ja: z.string().max(500), th: z.string().max(500) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(`update studios set name=$2, address=nullif($3,''), map_query=nullif($4,''), access_notes=$5, equipment=$6, is_placeholder=$7 where id=$1`, [
    d.id, d.name, d.address, d.mapQuery, { en: d.en, ja: d.ja, th: d.th }, lines(fd.get("equipment")), fd.get("placeholder") === "on",
  ]);
  await audit(admin.id, "studio.update", "studio", d.id);
  done();
  return { ok: true };
}

export async function createCouponAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const p = z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/), percent: z.coerce.number().int().min(0).max(100), max: z.coerce.number().int().min(0), until: z.string().optional() }).safeParse(Object.fromEntries(fd));
  if (!p.success || p.data.percent === 0) return { error: "invalidInput" };
  const d = p.data;
  try {
    await q(`insert into coupons (code, percent_off, max_redemptions, valid_until) values ($1,$2,$3,$4)`, [d.code, d.percent, d.max || null, d.until ? new Date(d.until).toISOString() : null]);
  } catch {
    return { error: "invalidInput" };
  }
  await audit(admin.id, "coupon.create", "coupon", d.code, d);
  done();
  return { ok: true };
}

export async function toggleCouponAction(fd: FormData) {
  const admin = await assertAdmin();
  const id = String(fd.get("id"));
  await q(`update coupons set is_active = not is_active where id=$1`, [id]);
  await audit(admin.id, "coupon.toggle", "coupon", id);
  done();
}

export async function saveContentAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const urls = ["heroVideo", "heroVideoMobile", "heroPoster", ...["studio", "online", "mixlab", "coach", "community", "battles", "artist", "events"].map((k) => `q_${k}`), ...["instagram", "youtube", "tiktok", "soundcloud", "mixcloud", "line"].map((k) => `s_${k}`)];
  for (const k of urls) {
    const v = get(k);
    if (v && !/^https:\/\//.test(v)) return { error: "invalidInput" };
  }
  const email = get("contactEmail");
  if (email && !z.string().email().safeParse(email).success) return { error: "invalidInput" };
  const upsert = (key: string, value: unknown) =>
    q(`insert into site_content (key, locale, value, updated_by) values ($1,'*',$2,$3) on conflict (key, locale) do update set value=excluded.value, updated_by=excluded.updated_by, updated_at=now()`, [key, value, admin.id]);
  await upsert("home.hero", { video_url: get("heroVideo"), video_mobile_url: get("heroVideoMobile"), poster_url: get("heroPoster") });
  await upsert("home.quick_images", Object.fromEntries(["studio", "online", "mixlab", "coach", "community", "battles", "artist", "events"].map((k) => [k, get(`q_${k}`)]).filter(([, v]) => v)));
  await upsert("site.social", Object.fromEntries(["instagram", "youtube", "tiktok", "soundcloud", "mixcloud", "line"].map((k) => [k, get(`s_${k}`)]).filter(([, v]) => v)));
  await upsert("site.contact", { email });
  await audit(admin.id, "content.update", "site_content", "home");
  done();
  return { ok: true };
}

export async function saveCourseAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await assertAdmin();
  const id = String(fd.get("id"));
  const p = z.object({ en: z.string().min(1).max(120), ja: z.string().max(120), th: z.string().max(120), den: z.string().max(500), dja: z.string().max(500), dth: z.string().max(500) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(`update courses set title=$2, description=$3, is_published=$4 where id=$1`, [id, { en: d.en, ja: d.ja, th: d.th }, { en: d.den, ja: d.dja, th: d.dth }, fd.get("published") === "on"]);
  await audit(admin.id, "course.update", "course", id);
  done();
  return { ok: true };
}

export async function markContactAction(fd: FormData) {
  const admin = await assertAdmin();
  const id = String(fd.get("id"));
  await q(`update contact_messages set status='answered' where id=$1`, [id]);
  await audit(admin.id, "contact.answered", "contact_message", id);
  done();
}
