import { memberPage } from "@/lib/page-guards";
import { q1 } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Field, inputCls } from "@/components/ui";
import { updateProfileAction } from "@/lib/account-actions";

type Pr = { display_name: string; dj_name: string | null; bio: string | null; experience_level: string; goal: string | null; genres: string[]; equipment: string[]; languages: string[]; city: string | null; country: string | null; weekly_practice_hours: number | null; is_public: boolean };

const L = {
  en: { djName: "DJ name", bio: "Bio", genres: "Favourite genres (comma separated)", equipment: "Equipment (comma separated)", languages: "Languages", city: "City", country: "Country", hours: "Practice hours / week" },
  ja: { djName: "DJ名", bio: "自己紹介", genres: "好きなジャンル（カンマ区切り）", equipment: "使用機材（カンマ区切り）", languages: "対応言語", city: "都市", country: "国", hours: "週の練習時間" },
  th: { djName: "ชื่อดีเจ", bio: "แนะนำตัว", genres: "แนวเพลงที่ชอบ (คั่นด้วยจุลภาค)", equipment: "อุปกรณ์ (คั่นด้วยจุลภาค)", languages: "ภาษา", city: "เมือง", country: "ประเทศ", hours: "ชั่วโมงฝึก / สัปดาห์" },
};

export default async function Profile({ params }: PageProps<"/[locale]/app/profile">) {
  const { locale, t, user } = await memberPage(params);
  const p = (await q1<Pr>(`select * from profiles where user_id=$1`, [user.id]))!;
  const l = L[locale];
  return (
    <>
      <PageTitle kicker={t.app.items.profile} title={t.app.items.profile} />
      <ActionForm action={updateProfileAction} submit={t.common.save} msgs={{ ok: t.app.profileSaved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }} className="max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.auth.displayName}><input name="displayName" defaultValue={p.display_name} required maxLength={60} className={inputCls} /></Field>
          <Field label={l.djName}><input name="djName" defaultValue={p.dj_name ?? ""} maxLength={60} className={inputCls} /></Field>
          <Field label={t.auth.experience}>
            <select name="experience" defaultValue={p.experience_level} className={inputCls}>
              {Object.entries(t.booking.levels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label={t.auth.goal}>
            <select name="goal" defaultValue={p.goal ?? "start"} className={inputCls}>
              {Object.entries(t.home.journey.options).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label={l.genres}><input name="genres" defaultValue={p.genres.join(", ")} className={inputCls} /></Field>
          <Field label={l.equipment}><input name="equipment" defaultValue={p.equipment.join(", ")} className={inputCls} /></Field>
          <Field label={l.languages}><input name="languages" defaultValue={p.languages.join(", ")} className={inputCls} /></Field>
          <Field label={l.hours}><input name="hours" type="number" min={0} max={80} step={0.5} defaultValue={p.weekly_practice_hours ?? ""} className={inputCls} /></Field>
          <Field label={l.city}><input name="city" defaultValue={p.city ?? ""} className={inputCls} /></Field>
          <Field label={l.country}><input name="country" defaultValue={p.country ?? ""} className={inputCls} /></Field>
        </div>
        <Field label={l.bio}><textarea name="bio" defaultValue={p.bio ?? ""} maxLength={1000} rows={4} className={inputCls} /></Field>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="isPublic" defaultChecked={p.is_public} className="h-5 w-5 accent-[#C4F34D]" />
          {t.app.publicProfile}
        </label>
      </ActionForm>
    </>
  );
}
