import { notFound } from "next/navigation";
import { instructorPage } from "@/lib/page-guards";
import { getMix, moduleRefs, reviewsFor } from "@/lib/mixlab";
import { reviewMixAction } from "@/lib/mixlab-actions";
import { dateTime } from "@/lib/i18n/format";
import { mixT } from "@/lib/i18n/p2/mix";
import { PageTitle } from "@/components/app/shell";
import { MixReport } from "@/components/mixlab/report";
import { ActionForm } from "@/components/forms";
import { L, inputCls } from "@/components/ui";

export default async function ReviewMix({ params }: PageProps<"/[locale]/instructor/reviews/[id]">) {
  const { locale, user, inst } = await instructorPage(params);
  const { id } = await params;
  const s = mixT(locale);
  const row = await getMix(id, user);
  if (!row || row.user_id === user.id) notFound();
  const [refs, reviews] = await Promise.all([moduleRefs(), reviewsFor(row.id)]);
  const tz = inst?.timezone ?? user.timezone;
  return (
    <>
      <L locale={locale} href="/instructor/reviews" className="mb-4 inline-flex min-h-11 items-center text-sm text-stone hover:text-ivory">← {s.instructorHdr}</L>
      <PageTitle kicker={dateTime(row.created_at, locale, tz)} title={row.title} />
      <MixReport row={row} s={s} locale={locale} refs={refs} playable={false} />
      <section className="mt-8 rounded-[8px] border border-line p-5">
        <h2 className="kicker mb-3">{s.reviewsHdr}</h2>
        {reviews.length > 0 && (
          <ul className="mb-5 space-y-3 text-sm">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-[6px] border border-line p-3">
                <p className="mb-1 text-xs text-stone">{r.name} · {dateTime(r.created_at, locale, tz)}</p>
                <p className="whitespace-pre-wrap">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
        <ActionForm action={reviewMixAction} submit={s.reviewSubmit} msgs={{ reviewSaved: s.reviewSaved, reviewTooShort: s.reviewTooShort, forbidden: s.forbidden, generic: s.errors.generic }}>
          <input type="hidden" name="id" value={row.id} />
          <label className="block">
            <span className="mb-1.5 block text-sm">{s.reviewLabel}</span>
            <textarea name="comment" required minLength={10} maxLength={4000} rows={5} className={inputCls} />
          </label>
        </ActionForm>
      </section>
    </>
  );
}
