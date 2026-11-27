import { adminPage } from "@/lib/page-guards";
import { q, q1 } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Field, inputCls, L, LinkButton, Tag } from "@/components/ui";
import { saveInstructorAction } from "@/lib/admin-actions";
import type { Instructor } from "@/lib/data";

export default async function AdminInstructors({ params, searchParams }: PageProps<"/[locale]/admin/instructors">) {
  const { locale, t } = await adminPage(params);
  const sp = await searchParams;
  const list = await q<Instructor & { email: string | null }>(`select i.*, u.email from instructors i left join users u on u.id=i.user_id order by sort_order, created_at`);
  const editing = typeof sp.edit === "string" ? await q1<Instructor & { email: string | null }>(`select i.*, u.email from instructors i left join users u on u.id=i.user_id where i.id=$1`, [sp.edit]) : null;
  const creating = sp.new === "1";
  const e = editing;
  const a = t.admin;
  const h = t.home.instructor;
  return (
    <>
      <PageTitle kicker="Admin" title={a.nav.instructors} action={<LinkButton locale={locale} href="/admin/instructors?new=1">{a.newInstructor}</LinkButton>} />
      <ul className="mb-8 divide-y divide-line rounded-[8px] border border-line">
        {list.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="font-display text-lg font-semibold uppercase">{i.dj_name}</span>
            <span className="text-sm text-stone">/{i.slug}</span>
            {i.is_published ? <Tag kind="live">{a.publish}</Tag> : <Tag>draft</Tag>}
            {i.is_placeholder && <Tag kind="placeholder">{a.placeholder}</Tag>}
            <span className="text-xs text-stone">{i.email ?? "— no login linked"}</span>
            <L locale={locale} href={`/admin/instructors?edit=${i.id}`} className="ml-auto inline-flex min-h-11 items-center rounded-[6px] border border-line px-4 text-sm">{t.common.edit}</L>
          </li>
        ))}
      </ul>
      {(e || creating) && (
        <section className="rounded-[8px] border border-line p-5 md:p-6">
          <h2 className="kicker mb-4">{e ? `${t.common.edit}: ${e.dj_name}` : a.newInstructor}</h2>
          <ActionForm action={saveInstructorAction} submit={t.common.save} msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, userNotFound: "User email not found — the instructor must register first.", generic: t.errors.generic }}>
            {e && <input type="hidden" name="id" value={e.id} />}
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="DJ name"><input name="djName" required defaultValue={e?.dj_name ?? ""} className={inputCls} /></Field>
              <Field label="Slug (URL)"><input name="slug" required pattern="[a-z0-9-]{2,60}" defaultValue={e?.slug ?? ""} className={inputCls} /></Field>
              <Field label={h.base}><input name="baseCity" defaultValue={e?.base_city ?? "Bangkok"} className={inputCls} /></Field>
              <Field label="Photo URL (https)"><input name="photoUrl" type="url" defaultValue={e?.photo_url ?? ""} className={inputCls} /></Field>
              <Field label={`${h.video} URL (https)`}><input name="introVideoUrl" type="url" defaultValue={e?.intro_video_url ?? ""} className={inputCls} /></Field>
              <Field label="Login email (links the instructor account)"><input name="userEmail" type="email" defaultValue={e?.email ?? ""} className={inputCls} /></Field>
              <Field label="Time zone"><input name="timezone" defaultValue={e?.timezone ?? "Asia/Bangkok"} className={inputCls} /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Bio — EN"><textarea name="bioEn" rows={5} defaultValue={e?.bio?.en ?? ""} className={inputCls} /></Field>
              <Field label="Bio — JA"><textarea name="bioJa" rows={5} defaultValue={e?.bio?.ja ?? ""} className={inputCls} /></Field>
              <Field label="Bio — TH"><textarea name="bioTh" rows={5} defaultValue={e?.bio?.th ?? ""} className={inputCls} /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={`${h.genres} (one per line)`}><textarea name="genres" rows={4} defaultValue={e?.genres.join("\n") ?? ""} className={inputCls} /></Field>
              <Field label={`${h.languages} (one per line)`}><textarea name="languages" rows={4} defaultValue={e?.languages.join("\n") ?? ""} className={inputCls} /></Field>
              <Field label={`${h.equipment} (one per line)`}><textarea name="equipment" rows={4} defaultValue={e?.equipment.join("\n") ?? ""} className={inputCls} /></Field>
              <Field label={`${h.mixes} (https URLs, one per line)`}><textarea name="mixUrls" rows={4} defaultValue={e?.mix_urls.join("\n") ?? ""} className={inputCls} /></Field>
            </div>
            <Field label={`${h.credits} — "Title | Venue | Year" per line. Prefix with ✓ only after you have verified it; unverified lines are never shown publicly.`}>
              <textarea name="achievements" rows={4} defaultValue={(e?.achievements ?? []).map((x) => `${x.verified ? "✓ " : ""}${[x.title, x.venue, x.year].filter(Boolean).join(" | ")}`).join("\n")} className={inputCls} />
            </Field>
            <div className="grid gap-4 md:grid-cols-5">
              {["instagram", "soundcloud", "mixcloud", "youtube", "tiktok"].map((k) => (
                <Field key={k} label={k}><input name={`social_${k}`} type="url" defaultValue={e?.social?.[k] ?? ""} className={inputCls} /></Field>
              ))}
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPublished" defaultChecked={e?.is_published ?? false} className="h-5 w-5 accent-[#C4F34D]" />{a.publish}</label>
              <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="isPlaceholder" defaultChecked={e?.is_placeholder ?? false} className="h-5 w-5 accent-[#C4F34D]" />{a.placeholder} (shows a PLACEHOLDER tag publicly)</label>
            </div>
          </ActionForm>
        </section>
      )}
    </>
  );
}
