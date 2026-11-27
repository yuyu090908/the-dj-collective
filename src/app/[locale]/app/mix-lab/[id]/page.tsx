import { notFound } from "next/navigation";
import { memberPage } from "@/lib/page-guards";
import { getMix, moduleRefs, reviewsFor } from "@/lib/mixlab";
import { deleteMixAction, shareMixAction } from "@/lib/mixlab-actions";
import { dateTime } from "@/lib/i18n/format";
import { mixT } from "@/lib/i18n/p2/mix";
import { PageTitle } from "@/components/app/shell";
import { MixReport } from "@/components/mixlab/report";
import { ActionForm } from "@/components/forms";
import { L, LinkButton, Tag } from "@/components/ui";

export default async function MixResult({ params }: PageProps<"/[locale]/app/mix-lab/[id]">) {
  const { locale, user } = await memberPage(params);
  const { id } = await params;
  const s = mixT(locale);
  const row = await getMix(id, user);
  if (!row || row.user_id !== user.id) notFound();
  const [refs, reviews] = await Promise.all([moduleRefs(), reviewsFor(row.id)]);
  const msgs = { shared: s.shared, unshared: s.unshared, notFound: s.notFound, generic: s.errors.generic };

  return (
    <>
      <L locale={locale} href="/app/mix-lab" className="mb-4 inline-flex min-h-11 items-center text-sm text-stone hover:text-ivory">← {s.back}</L>
      <PageTitle kicker={dateTime(row.created_at, locale, user.timezone)} title={row.title}
        action={<LinkButton locale={locale} href={`/app/ai-coach?mix=${row.id}`} variant="secondary">{s.askCoach}</LinkButton>}>
        {row.shared_with_instructor && <Tag kind="lime" className="mt-3">{s.sharedTag}</Tag>}
      </PageTitle>
      <MixReport row={row} s={s} locale={locale} refs={refs} />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[8px] border border-line p-5" data-testid="mix-reviews">
          <h2 className="kicker mb-3">{s.reviewsHdr}</h2>
          {reviews.length ? (
            <ul className="space-y-3 text-sm">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-[6px] border border-line p-3">
                  <p className="mb-1 text-xs text-stone">{r.name} · {dateTime(r.created_at, locale, user.timezone)}</p>
                  <p className="whitespace-pre-wrap">{r.comment}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone">{s.noReviews}</p>}
        </section>
        <section className="space-y-6 rounded-[8px] border border-line p-5">
          <div>
            <h2 className="kicker mb-2">{s.shareHdr}</h2>
            <p className="mb-3 text-sm text-stone">{s.shareBody}</p>
            <ActionForm action={shareMixAction} submit={row.shared_with_instructor ? s.unshare : s.share} msgs={msgs} variant="secondary">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="share" value={row.shared_with_instructor ? "0" : "1"} />
            </ActionForm>
          </div>
          <div className="border-t border-line pt-5">
            <ActionForm action={deleteMixAction} submit={s.del} msgs={msgs} variant="danger">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="locale" value={locale} />
            </ActionForm>
          </div>
        </section>
      </div>
    </>
  );
}
