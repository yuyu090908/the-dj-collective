import { adminPage } from "@/lib/page-guards";
import { getSiteMedia } from "@/lib/data";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Alert, Field, inputCls } from "@/components/ui";
import { saveContentAction } from "@/lib/admin-actions";

const QUICK = ["studio", "online", "mixlab", "coach", "community", "battles", "artist", "events"] as const;
const SOCIAL = ["instagram", "youtube", "tiktok", "soundcloud", "mixcloud", "line"] as const;

export default async function AdminContent({ params }: PageProps<"/[locale]/admin/content">) {
  const { t } = await adminPage(params);
  const m = await getSiteMedia();
  const a = t.admin;
  return (
    <>
      <PageTitle kicker="Admin" title={a.homepage} />
      <Alert>
        HTTPS URLs only. Upload media to Supabase Storage (public bucket) or a CDN and paste the URL. Empty fields fall back to the built-in visuals. Social links that are left empty are hidden on the site.
      </Alert>
      <div className="mt-6">
        <ActionForm action={saveContentAction} submit={t.common.save} msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }}>
          <fieldset className="grid gap-3 md:grid-cols-3">
            <legend className="kicker mb-3">Hero</legend>
            <Field label={a.heroVideo}><input name="heroVideo" type="url" defaultValue={m.heroVideo} placeholder="https://" className={inputCls} /></Field>
            <Field label={a.heroVideoMobile}><input name="heroVideoMobile" type="url" defaultValue={m.heroVideoMobile} placeholder="https://" className={inputCls} /></Field>
            <Field label={a.heroPoster}><input name="heroPoster" type="url" defaultValue={m.heroPoster} placeholder="https://" className={inputCls} /></Field>
          </fieldset>
          <fieldset className="mt-6 grid gap-3 md:grid-cols-2">
            <legend className="kicker mb-3">{a.quickImages}</legend>
            {QUICK.map((k) => (
              <Field key={k} label={k}><input name={`q_${k}`} type="url" defaultValue={m.quick[k] ?? ""} placeholder="https://" className={inputCls} /></Field>
            ))}
          </fieldset>
          <fieldset className="mt-6 grid gap-3 md:grid-cols-2">
            <legend className="kicker mb-3">{a.socialLinks}</legend>
            {SOCIAL.map((k) => (
              <Field key={k} label={k}><input name={`s_${k}`} type="url" defaultValue={m.social[k] ?? ""} placeholder="https://" className={inputCls} /></Field>
            ))}
            <Field label="Contact email"><input name="contactEmail" type="email" defaultValue={m.contactEmail} className={inputCls} /></Field>
          </fieldset>
        </ActionForm>
      </div>
    </>
  );
}
