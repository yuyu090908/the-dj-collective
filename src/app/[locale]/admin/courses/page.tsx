import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { Alert, Field, inputCls } from "@/components/ui";
import { saveCourseAction } from "@/lib/admin-actions";

export default async function AdminCourses({ params }: PageProps<"/[locale]/admin/courses">) {
  const { t } = await adminPage(params);
  const rows = await q<{ id: string; level: number; title: Record<string, string>; description: Record<string, string>; is_published: boolean; modules: number }>(
    `select c.*, (select count(*) from course_modules m where m.course_id=c.id)::int modules from courses c order by level`,
  );
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.courses} />
      <Alert>{t.pages.courses.phaseNote}</Alert>
      <ul className="mt-6 space-y-4">
        {rows.map((c) => (
          <li key={c.id} className="rounded-[8px] border border-line p-5">
            <p className="kicker mb-3 tnum">Level {String(c.level).padStart(2, "0")} · {c.modules} {t.pages.courses.modules}</p>
            <ActionForm action={saveCourseAction} submit={t.common.save} variant="secondary" msgs={{ ok: t.common.saved, invalidInput: t.errors.invalidInput, generic: t.errors.generic }}>
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Title EN"><input name="en" defaultValue={c.title.en} className={inputCls} /></Field>
                <Field label="Title JA"><input name="ja" defaultValue={c.title.ja} className={inputCls} /></Field>
                <Field label="Title TH"><input name="th" defaultValue={c.title.th} className={inputCls} /></Field>
                <Field label="Description EN"><textarea name="den" rows={2} defaultValue={c.description.en} className={inputCls} /></Field>
                <Field label="Description JA"><textarea name="dja" rows={2} defaultValue={c.description.ja} className={inputCls} /></Field>
                <Field label="Description TH"><textarea name="dth" rows={2} defaultValue={c.description.th} className={inputCls} /></Field>
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="published" defaultChecked={c.is_published} className="h-5 w-5 accent-[#C4F34D]" />{t.admin.publish}</label>
            </ActionForm>
          </li>
        ))}
      </ul>
    </>
  );
}
