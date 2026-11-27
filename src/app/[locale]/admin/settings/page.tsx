import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { money, dateTime } from "@/lib/i18n/format";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { ServiceStatus } from "@/components/app/services";
import { Alert, Field, Tag, inputCls, Button } from "@/components/ui";
import { createCouponAction, saveLessonAction, savePlanAction, saveStudioAction, toggleCouponAction } from "@/lib/admin-actions";

type Plan = { code: string; name: string; price_satang: number; quotas: Record<string, number>; is_active: boolean };
type Lesson = { id: string; slug: string; mode: string; title: Record<string, string>; duration_min: number; price_satang: number; is_provisional: boolean; is_active: boolean };
type Studio = { id: string; name: string; address: string | null; map_query: string | null; access_notes: Record<string, string>; equipment: string[]; is_placeholder: boolean };
type Coupon = { id: string; code: string; percent_off: number | null; max_redemptions: number | null; redemptions: number; valid_until: string | null; is_active: boolean };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-12 font-display text-xl font-semibold">{children}</h2>;
}

const check = "h-5 w-5 accent-[#C4F34D]";

export default async function AdminSettings({ params }: PageProps<"/[locale]/admin/settings">) {
  const { locale, t, user } = await adminPage(params);
  const a = t.admin;
  const msgs = { ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic };
  const [plans, lessons, studios, coupons, audits] = await Promise.all([
    q<Plan>(`select code, name, price_satang, quotas, is_active from plans order by sort_order, price_satang`),
    q<Lesson>(`select * from lessons order by sort_order, slug`),
    q<Studio>(`select * from studios order by created_at`),
    q<Coupon>(`select * from coupons order by created_at desc`),
    q<{ id: string; action: string; target_type: string | null; target_id: string | null; created_at: string; email: string | null; ip: string | null }>(
      `select a.id, a.action, a.target_type, a.target_id, a.created_at, a.ip, u.email from audit_logs a left join users u on u.id=a.actor_id order by a.created_at desc limit 50`,
    ),
  ]);
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.settings} />

      <section id="services">
        <H>{a.services}</H>
        <div className="rounded-[8px] border border-line px-5 py-2"><ServiceStatus t={t} /></div>
        <p className="mt-3 text-sm text-stone">
          2FA: {user.totpEnabled ? <Tag kind="live">ON</Tag> : <Tag kind="notConnected">OFF</Tag>} — admin pages always require a TOTP code (12h session).
        </p>
      </section>

      <section id="lessons">
        <H>{a.lessonPrices}</H>
        <Alert kind="warn">Prices are shown with a “Provisional” label until you tick “{a.priceConfirmed}”.</Alert>
        <ul className="mt-4 space-y-4">
          {lessons.map((l) => (
            <li key={l.id} className="rounded-[8px] border border-line p-5">
              <p className="kicker mb-3 flex flex-wrap items-center gap-2">
                {l.slug} · {l.mode} · {money(l.price_satang, locale)}
                {l.is_provisional && <Tag kind="provisional">{t.status.provisional}</Tag>}
              </p>
              <ActionForm action={saveLessonAction} submit={t.common.save} variant="secondary" msgs={msgs}>
                <input type="hidden" name="id" value={l.id} />
                <div className="grid gap-3 md:grid-cols-5">
                  <Field label="Price (THB)"><input name="price" type="number" min={0} step="1" defaultValue={l.price_satang / 100} className={inputCls} /></Field>
                  <Field label="Duration (min)"><input name="duration" type="number" min={15} max={480} defaultValue={l.duration_min} className={inputCls} /></Field>
                  <Field label="Title EN"><input name="titleEn" defaultValue={l.title.en} className={inputCls} /></Field>
                  <Field label="Title JA"><input name="titleJa" defaultValue={l.title.ja ?? ""} className={inputCls} /></Field>
                  <Field label="Title TH"><input name="titleTh" defaultValue={l.title.th ?? ""} className={inputCls} /></Field>
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="confirmed" defaultChecked={!l.is_provisional} className={check} />{a.priceConfirmed}</label>
                  <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={l.is_active} className={check} />{a.publish}</label>
                </div>
              </ActionForm>
            </li>
          ))}
        </ul>
      </section>

      <section id="plans">
        <H>{a.plans}</H>
        <Alert>Subscription checkout is Phase 02. Prices and quotas edited here are what the pricing page shows.</Alert>
        <ul className="mt-4 space-y-4">
          {plans.map((p) => (
            <li key={p.code} className="rounded-[8px] border border-line p-5">
              <p className="kicker mb-3">{p.name} · {p.code}</p>
              <ActionForm action={savePlanAction} submit={t.common.save} variant="secondary" msgs={msgs}>
                <input type="hidden" name="code" value={p.code} />
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                  <Field label="Price / month (THB)"><input name="price" type="number" min={0} defaultValue={p.price_satang / 100} className={inputCls} /></Field>
                  <Field label="AI coach msgs"><input name="coach" type="number" min={0} defaultValue={p.quotas.ai_coach_messages ?? 0} className={inputCls} /></Field>
                  <Field label="Mix analyses"><input name="mix" type="number" min={0} defaultValue={p.quotas.mix_analyses ?? 0} className={inputCls} /></Field>
                  <Field label="Max upload MB"><input name="mb" type="number" min={1} defaultValue={p.quotas.max_upload_mb ?? 50} className={inputCls} /></Field>
                  <Field label="Max minutes"><input name="minutes" type="number" min={1} defaultValue={p.quotas.max_minutes ?? 60} className={inputCls} /></Field>
                </div>
                <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={p.is_active} className={check} />{a.publish}</label>
              </ActionForm>
            </li>
          ))}
        </ul>
      </section>

      <section id="studio">
        <H>{a.studio}</H>
        {studios.map((s) => (
          <div key={s.id} className="rounded-[8px] border border-line p-5">
            <ActionForm action={saveStudioAction} submit={t.common.save} variant="secondary" msgs={msgs}>
              <input type="hidden" name="id" value={s.id} />
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Name"><input name="name" defaultValue={s.name} className={inputCls} /></Field>
                <Field label="Address"><input name="address" defaultValue={s.address ?? ""} className={inputCls} /></Field>
                <Field label="Google Maps query" hint="Shown as an embedded map when set"><input name="mapQuery" defaultValue={s.map_query ?? ""} className={inputCls} /></Field>
                <Field label="Access EN"><textarea name="en" rows={2} defaultValue={s.access_notes.en ?? ""} className={inputCls} /></Field>
                <Field label="Access JA"><textarea name="ja" rows={2} defaultValue={s.access_notes.ja ?? ""} className={inputCls} /></Field>
                <Field label="Access TH"><textarea name="th" rows={2} defaultValue={s.access_notes.th ?? ""} className={inputCls} /></Field>
              </div>
              <Field label="Equipment (one per line)"><textarea name="equipment" rows={4} defaultValue={s.equipment.join("\n")} className={inputCls} /></Field>
              <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="placeholder" defaultChecked={s.is_placeholder} className={check} />{a.placeholder}</label>
            </ActionForm>
          </div>
        ))}
      </section>

      <section id="coupons">
        <H>{a.coupons}</H>
        <div className="rounded-[8px] border border-line p-5">
          <ActionForm action={createCouponAction} submit={t.common.create} variant="secondary" msgs={msgs}>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <Field label="Code"><input name="code" required pattern="[A-Za-z0-9_\-]{3,30}" className={inputCls} /></Field>
              <Field label="% off"><input name="percent" type="number" min={1} max={100} required className={inputCls} /></Field>
              <Field label="Max redemptions (0 = ∞)"><input name="max" type="number" min={0} defaultValue={0} className={inputCls} /></Field>
              <Field label="Valid until"><input name="until" type="date" className={inputCls} /></Field>
            </div>
          </ActionForm>
        </div>
        {coupons.length > 0 && (
          <ul className="mt-4 divide-y divide-line rounded-[8px] border border-line text-sm">
            {coupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <code className="font-mono">{c.code}</code>
                <span className="tnum">{c.percent_off}%</span>
                <span className="tnum text-stone">{c.redemptions}/{c.max_redemptions ?? "∞"}</span>
                {c.valid_until && <span className="text-stone">→ {dateTime(c.valid_until, locale, "Asia/Bangkok", { dateStyle: "medium" })}</span>}
                {c.is_active ? <Tag kind="live">ON</Tag> : <Tag>OFF</Tag>}
                <form action={toggleCouponAction} className="ml-auto">
                  <input type="hidden" name="id" value={c.id} />
                  <Button variant="ghost" type="submit">{c.is_active ? "Disable" : "Enable"}</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="audit">
        <H>{a.audit}</H>
        <div className="overflow-x-auto rounded-[8px] border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-stone"><tr><th className="px-4 py-2 font-normal">Time</th><th className="px-4 py-2 font-normal">Actor</th><th className="px-4 py-2 font-normal">Action</th><th className="px-4 py-2 font-normal">Target</th><th className="px-4 py-2 font-normal">IP</th></tr></thead>
            <tbody className="divide-y divide-line">
              {audits.map((r) => (
                <tr key={r.id}>
                  <td className="tnum px-4 py-2 text-stone">{dateTime(r.created_at, locale, "Asia/Bangkok")}</td>
                  <td className="px-4 py-2">{r.email ?? "system"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.action}</td>
                  <td className="px-4 py-2 font-mono text-xs text-stone">{r.target_type}{r.target_id ? `:${r.target_id.slice(0, 8)}` : ""}</td>
                  <td className="px-4 py-2 font-mono text-xs text-stone">{r.ip ?? ""}</td>
                </tr>
              ))}
              {audits.length === 0 && <tr><td colSpan={5} className="px-4 py-4 text-stone">{t.common.none}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
