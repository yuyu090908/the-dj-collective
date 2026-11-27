import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, Empty, LinkButton, PageHero, SectionHead, Tag } from "@/components/ui";
import { q } from "@/lib/db";
import { env } from "@/lib/env";
import { dateTime, fmt } from "@/lib/i18n/format";

type Ev = { id: string; slug: string; title: string; venue_name: string | null; city: string; starts_at: string; genres: string[]; lineup: string[]; ticket_url: string | null; image_url: string | null; is_showcase: boolean };

export async function generateMetadata({ params }: PageProps<"/[locale]/events">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/events", t.pages.events.title, t.pages.events.lead);
}

export default async function Events({ params }: PageProps<"/[locale]/events">) {
  const { locale, t } = await pageCtx(params);
  const e = t.pages.events;
  const events = env.databaseUrl
    ? await q<Ev>(`select * from events where status='published' and starts_at > now() - interval '6 hours' order by starts_at limit 50`).catch(() => [])
    : [];
  return (
    <>
      <PageHero kicker="Events" title={e.title} lead={e.lead}>
        <div className="mt-6"><Tag kind="phase">{fmt(t.status.comingPhase, { n: 4 })} — Events & Gigs</Tag></div>
      </PageHero>
      <Container className="pt-12">
        <SectionHead title={e.upcoming} />
        {events.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {events.map((ev) => (
              <li key={ev.id} className="grid gap-3 py-5 md:grid-cols-[200px_1fr_auto] md:items-center">
                <p className="font-display text-sm uppercase tracking-[0.1em] text-lime tnum">{dateTime(ev.starts_at, locale, "Asia/Bangkok")}</p>
                <div>
                  <p className="font-display text-xl font-semibold uppercase">{ev.title}</p>
                  <p className="text-sm text-stone">{[ev.venue_name, ev.city].filter(Boolean).join(" · ")} {ev.genres.length ? `— ${ev.genres.join(", ")}` : ""}</p>
                </div>
                {ev.ticket_url && <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-[6px] border border-ivory/70 px-4 text-sm">Tickets</a>}
              </li>
            ))}
          </ul>
        ) : (
          <Empty title={e.empty}>
            <LinkButton locale={locale} href="/booking" variant="secondary">{t.nav.book}</LinkButton>
          </Empty>
        )}
      </Container>
    </>
  );
}
