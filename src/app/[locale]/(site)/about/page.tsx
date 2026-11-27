import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, LinkButton, PageHero } from "@/components/ui";
import { Waveform } from "@/components/visuals";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/about", t.pages.about.title, t.pages.about.lead);
}

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { locale, t } = await pageCtx(params);
  const a = t.pages.about;
  return (
    <>
      <PageHero kicker="About" title={a.title} lead={a.lead} />
      <Container className="grid gap-10 pt-14 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          {a.body.map((b, i) => (
            <p key={i} className="flex gap-5 text-lg leading-relaxed">
              <span className="kicker tnum pt-1.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{b}</span>
            </p>
          ))}
          <div className="flex gap-3 pt-4">
            <LinkButton locale={locale} href="/academy">{t.nav.academy}</LinkButton>
            <LinkButton locale={locale} href="/contact" variant="secondary">{t.nav.contact}</LinkButton>
          </div>
        </div>
        <div className="gridlines relative flex min-h-72 flex-col justify-end overflow-hidden rounded-[8px] border border-line p-6">
          <Waveform seed={42} bars={90} height={120} className="absolute inset-x-6 top-10 h-40 text-ivory/30" />
          <p className="relative font-display text-[clamp(2rem,4vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-tight">
            LEARN.<br />CONNECT.<br /><span className="text-lime">PERFORM.</span>
          </p>
          <p className="relative mt-4 text-stone">{a.slogan}</p>
        </div>
      </Container>
    </>
  );
}
