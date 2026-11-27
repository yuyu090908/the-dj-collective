import { instructorPage } from "@/lib/page-guards";
import { sharedWithInstructor } from "@/lib/mixlab";
import { dateTime } from "@/lib/i18n/format";
import { mixT } from "@/lib/i18n/p2/mix";
import { PageTitle } from "@/components/app/shell";
import { L, Tag } from "@/components/ui";

export default async function Reviews({ params }: PageProps<"/[locale]/instructor/reviews">) {
  const { locale, t, user, inst } = await instructorPage(params);
  const s = mixT(locale);
  const rows = await sharedWithInstructor(user.id);
  const tz = inst?.timezone ?? user.timezone;
  return (
    <>
      <PageTitle kicker={t.instructor.nav.reviews} title={s.instructorHdr} />
      <p className="-mt-4 mb-6 max-w-2xl text-sm text-stone">{s.shareBody}</p>
      {rows.length ? (
        <ul className="divide-y divide-line rounded-[8px] border border-line text-sm" data-testid="instructor-shared">
          {rows.map((r) => (
            <li key={r.id}>
              <L locale={locale} href={`/instructor/reviews/${r.id}`} className="flex min-h-14 flex-wrap items-center gap-3 px-5 py-3 hover:bg-ink-2">
                <span className="tnum text-stone">{dateTime(r.created_at, locale, tz)}</span>
                <span className="font-medium">{r.student}</span>
                <span className="flex-1">{r.title}</span>
                <span className="tnum text-lime">{r.overall ?? "—"}</span>
                {r.reviewed ? <Tag kind="live">{s.reviewed}</Tag> : <Tag kind="provisional">{s.toReview}</Tag>}
              </L>
            </li>
          ))}
        </ul>
      ) : <p className="rounded-[8px] border border-line px-5 py-6 text-sm text-stone">{s.instructorEmpty}</p>}
    </>
  );
}
