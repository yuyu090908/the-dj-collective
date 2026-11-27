import { notFound } from "next/navigation";
import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, L } from "@/components/ui";
import { q1 } from "@/lib/db";
import { env } from "@/lib/env";
import { tr, type Localized } from "@/lib/i18n/config";

type AP = { slug: string; logo_url: string | null; photo_url: string | null; bio: Localized; genres: string[]; mixes: string[]; social: Record<string, string>; visible_sections: string[]; dj_name: string | null };

async function load(slug: string) {
  if (!env.databaseUrl) return null;
  return q1<AP>(
    `select ap.*, p.dj_name from artist_profiles ap join profiles p on p.user_id=ap.user_id where ap.slug=$1 and ap.is_public`,
    [slug],
  );
}

export async function generateMetadata({ params }: PageProps<"/[locale]/artists/[slug]">) {
  const { locale } = await pageCtx(params);
  const { slug } = await params;
  const a = await load(slug);
  return a ? seo(locale, `/artists/${slug}`, a.dj_name ?? slug, tr(a.bio, locale)) : {};
}

export default async function ArtistPage({ params }: PageProps<"/[locale]/artists/[slug]">) {
  const { locale, t } = await pageCtx(params);
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();
  const show = (k: string) => a.visible_sections.includes(k);
  return (
    <Container className="pt-10">
      <nav className="kicker mb-6"><L locale={locale} href="/artists">{t.pages.artists.title}</L> / {a.dj_name ?? slug}</nav>
      <h1 className="font-display text-display font-bold uppercase">{a.dj_name ?? slug}</h1>
      {show("bio") && <p className="mt-6 max-w-2xl text-lg">{tr(a.bio, locale)}</p>}
      {show("genres") && <p className="kicker mt-6">{a.genres.join(" / ")}</p>}
    </Container>
  );
}
