import { notFound, redirect } from "next/navigation";
import { memberPage } from "@/lib/page-guards";
import { canUseSetBuilder, getSet, listLibrary } from "@/lib/setbuilder";
import { deleteSetAction } from "@/lib/setbuilder-actions";
import { lp } from "@/lib/i18n/config";
import { setT } from "@/lib/i18n/p2/sets";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { SetEditor } from "@/components/sets/editor";
import { L, LinkButton } from "@/components/ui";

export default async function EditSet({ params }: PageProps<"/[locale]/app/set-builder/[id]">) {
  const { locale, t, user } = await memberPage(params);
  const { id } = await params;
  if (!(await canUseSetBuilder(user.id))) redirect(lp(locale, "/app/set-builder"));
  const s = setT(locale);
  const [set, library] = await Promise.all([getSet(user.id, id), listLibrary(user.id)]);
  if (!set) notFound();
  return (
    <>
      <L locale={locale} href="/app/set-builder" className="mb-4 inline-flex min-h-11 items-center text-sm text-stone hover:text-ivory">← {s.sets}</L>
      <PageTitle kicker={t.app.groups.ai} title={set.title}
        action={<LinkButton locale={locale} href={`/app/ai-coach?set=${set.id}`} variant="secondary">{s.askCoach}</LinkButton>} />
      <SetEditor id={set.id} s={s} library={library} initial={{ title: set.title, context: set.context, tracks: set.tracks }} />
      <div className="mt-10 max-w-sm">
        <ActionForm action={deleteSetAction} submit={s.deleteSet} msgs={s.errors} variant="danger">
          <input type="hidden" name="id" value={set.id} />
          <input type="hidden" name="locale" value={locale} />
        </ActionForm>
      </div>
    </>
  );
}
