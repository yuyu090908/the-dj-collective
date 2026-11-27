import { memberPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Field, inputCls } from "@/components/ui";
import { deleteAccountAction, updateSettingsAction } from "@/lib/account-actions";
import { localeNames, locales } from "@/lib/i18n/config";

const TZ = ["Asia/Bangkok", "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Ho_Chi_Minh", "Australia/Sydney", "Europe/London", "Europe/Berlin", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC"];

export default async function Settings({ params }: PageProps<"/[locale]/app/settings">) {
  const { locale, t, user } = await memberPage(params);
  const consents = await q<{ kind: string; granted: boolean }>(
    `select distinct on (kind) kind, granted from consent_records where user_id=$1 order by kind, created_at desc`,
    [user.id],
  );
  const has = (k: string) => consents.find((c) => c.kind === k)?.granted ?? false;
  const a = t.app;
  return (
    <>
      <PageTitle kicker={a.items.settings} title={a.items.settings} />
      <div className="grid max-w-4xl gap-6">
        <section className="rounded-[8px] border border-line p-5 md:p-6">
          <h2 className="kicker mb-4">{a.preferences}</h2>
          <ActionForm action={updateSettingsAction} submit={t.common.save} msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.nav.language}>
                <select name="locale" defaultValue={user.locale} className={inputCls}>
                  {locales.map((l) => <option key={l} value={l}>{localeNames[l]}</option>)}
                </select>
              </Field>
              <Field label={t.booking.timezone}>
                <select name="timezone" defaultValue={user.timezone} className={inputCls}>
                  {(TZ.includes(user.timezone) ? TZ : [user.timezone, ...TZ]).map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </Field>
            </div>
            <h2 className="kicker mt-4">{a.privacy}</h2>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="ai_learning_context" defaultChecked={has("ai_learning_context")} className="h-5 w-5 accent-[#C4F34D]" />{a.aiConsent}</label>
            <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="marketing" defaultChecked={has("marketing")} className="h-5 w-5 accent-[#C4F34D]" />{a.marketingConsent}</label>
          </ActionForm>
        </section>
        <section className="rounded-[8px] border border-line p-5 md:p-6">
          <h2 className="kicker mb-4">{a.privacy}</h2>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/me/export" className="inline-flex min-h-11 items-center rounded-[6px] border border-ivory/70 px-5 font-display text-sm font-semibold uppercase tracking-[0.08em]">{a.exportData}</a>
        </section>
        <section className="rounded-[8px] border border-err/40 p-5 md:p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-err">{a.deleteAccount}</h2>
          <p className="mt-2 text-sm text-stone">{a.deleteWarn}</p>
          <ActionForm action={deleteAccountAction} submit={a.deleteAccount} variant="danger" className="mt-4" msgs={{ invalidInput: t.errors.invalidInput, forbidden: t.auth.forbidden, generic: t.errors.generic }}>
            <input type="hidden" name="locale" value={locale} />
            <Field label={a.deleteConfirm}><input name="confirm" autoComplete="off" className={inputCls} /></Field>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
