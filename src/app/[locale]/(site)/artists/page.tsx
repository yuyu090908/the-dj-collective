import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, Empty, L, LinkButton, PageHero, Tag } from "@/components/ui";
import { q } from "@/lib/db";
import { env } from "@/lib/env";
import { fmt } from "@/lib/i18n/format";

export async function generateMetadata({ params }: PageProps<"/[locale]/artists">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/artists", t.pages.artists.title, t.pages.artists.lead);
}

export default async function Artists({ params }: PageProps<"/[locale]/artists">) {
  const { locale, t } = await pageCtx(params);
  const a = t.pages.artists;
  const artists = env.databaseUrl
    ? await q<{ slug: string; genres: string[]; dj_name: string | null }>(
        `select ap.slug, ap.genres, p.dj_name from artist_profiles ap join profiles p on p.user_id=ap.user_id where ap.is_public order by ap.created_at desc`,
      ).catch(() => [])
    : [];
  return (
    <>
      <PageHero kicker="Artists" title={a.title} lead={a.lead}>
        <div className="mt-6"><Tag kind="phase">{fmt(t.status.comingPhase, { n: 4 })} — Digital Press Kit</Tag></div>
      </PageHero>
      <Container className="pt-12">
        {artists.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {artists.map((x) => (
              <li key={x.slug}>
                <L locale={locale} href={`/artists/${x.slug}`} className="block rounded-[8px] border border-line p-5 hover:border-stone">
                  <p className="font-display text-lg font-semibold uppercase">{x.dj_name ?? x.slug}</p>
                  <p className="text-xs text-stone">{x.genres.join(" · ")}</p>
                </L>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title={a.empty}>
            <LinkButton locale={locale} href="/register" variant="secondary">{t.nav.join}</LinkButton>
          </Empty>
        )}
      </Container>
    </>
  );
}
