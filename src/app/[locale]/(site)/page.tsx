/* eslint-disable @next/next/no-img-element */
import { ArrowRight, ArrowUpRight, Mic2, Sparkles } from "lucide-react";
import { pageCtx, seo } from "@/lib/i18n/server";
import { lp, tr } from "@/lib/i18n/config";
import { fmt, money } from "@/lib/i18n/format";
import { getLessons, getPlans, getPublishedInstructors, getSiteMedia } from "@/lib/data";
import { Container, L, LinkButton, SectionHead, Tag, Kicker, Empty } from "@/components/ui";
import { BandBars, EnergyCurve, PanelArt, Waveform } from "@/components/visuals";
import { HeroVideo, Journey, type JourneyRec } from "@/components/home/client";
import { InstructorFeature } from "@/components/site/instructor";
import { env } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/", `${t.meta.tagline} DJ School Bangkok & Online`, t.meta.defaultDescription);
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await pageCtx(params);
  const h = t.home;
  const [media, instructors, lessons, plans] = await Promise.all([
    getSiteMedia().catch(() => null),
    getPublishedInstructors().catch(() => []),
    getLessons().catch(() => []),
    getPlans().catch(() => []),
  ]);
  const minPrice = (mode: string) => {
    const ls = lessons.filter((l) => l.mode === mode);
    return ls.length ? Math.min(...ls.map((l) => l.price_satang)) : null;
  };
  const provisional = lessons.some((l) => l.is_provisional);
  const memberPlan = plans.find((p) => p.code === "member");

  const quick: { key: keyof typeof h.quick.items; href: string }[] = [
    { key: "studio", href: "/lessons/bangkok" },
    { key: "online", href: "/lessons/online" },
    { key: "mixlab", href: "/app/mix-lab" },
    { key: "coach", href: "/app/ai-coach" },
    { key: "community", href: "/community" },
    { key: "battles", href: "/app/battles" },
    { key: "artist", href: "/app/artist-studio" },
    { key: "events", href: "/events" },
  ];
  const phaseOf: Record<string, number | null> = { studio: null, online: null, mixlab: 2, coach: 2, community: 3, battles: 3, artist: 4, events: 4 };

  const j = h.journey;
  const L_ = (s: string) => lp(locale, s);
  const lessonTitle = (slug: string) => tr(lessons.find((l) => l.slug === slug)?.title, locale) || t.nav.lessons;
  const recs: Record<string, JourneyRec[]> = {
    start: [
      { kind: j.lesson, title: lessonTitle("bkk-private-60"), href: L_("/booking?lesson=bkk-private-60") },
      { kind: j.course, title: "Level 01 — Foundation", href: L_("/courses#level-1") },
      { kind: j.tool, title: "AI DJ Coach", href: L_("/app/ai-coach"), note: "Phase 02" },
    ],
    improve: [
      { kind: j.lesson, title: lessonTitle("bkk-private-90"), href: L_("/booking?lesson=bkk-private-90") },
      { kind: j.course, title: "Level 02 — Mixing", href: L_("/courses#level-2") },
      { kind: j.tool, title: "AI Mix Lab", href: L_("/app/mix-lab"), note: "Phase 02" },
    ],
    club: [
      { kind: j.lesson, title: lessonTitle("bkk-private-90"), href: L_("/booking?lesson=bkk-private-90") },
      { kind: j.course, title: "Level 04 — Performance", href: L_("/courses#level-4") },
      { kind: j.tool, title: "AI Set Builder", href: L_("/app/set-builder"), note: "Phase 02" },
    ],
    online: [
      { kind: j.lesson, title: lessonTitle("online-private-60"), href: L_("/booking?lesson=online-private-60") },
      { kind: j.course, title: "Level 01 — Foundation", href: L_("/courses#level-1") },
      { kind: j.tool, title: "AI DJ Coach", href: L_("/app/ai-coach"), note: "Phase 02" },
    ],
    analyze: [
      { kind: j.lesson, title: lessonTitle("online-mix-review-30"), href: L_("/booking?lesson=online-mix-review-30") },
      { kind: j.tool, title: "AI Mix Lab", href: L_("/app/mix-lab"), note: "Phase 02" },
      { kind: j.course, title: "Level 03 — Music Selection", href: L_("/courses#level-3") },
    ],
    community: [
      { kind: j.tool, title: t.nav.community, href: L_("/community"), note: "Phase 03" },
      { kind: j.tool, title: "DJ Battles", href: L_("/app/battles"), note: "Phase 03" },
      { kind: j.course, title: "Level 05 — Artist Development", href: L_("/courses#level-5") },
    ],
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "THE DJ COLLECTIVE",
    url: env.siteUrl,
    description: t.meta.defaultDescription,
    areaServed: ["Bangkok", "Online"],
    knowsLanguage: ["en", "ja", "th"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

      {/* SECTION 02 — HERO */}
      <section className="grain relative isolate overflow-hidden border-b border-line">
        {media?.heroVideo ? (
          <HeroVideo src={media.heroVideo} mobileSrc={media.heroVideoMobile} poster={media.heroPoster} />
        ) : media?.heroPoster ? (
          <img src={media.heroPoster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="gridlines absolute inset-0 opacity-60" aria-hidden="true">
            <Waveform seed={21} bars={160} height={240} className="absolute inset-x-0 top-1/2 h-[46%] w-full -translate-y-1/2 text-ivory/[0.09]" />
          </div>
        )}
        <div className="absolute inset-0 -z-0 bg-[linear-gradient(to_top,#101010_8%,rgba(16,16,16,0.72)_45%,rgba(16,16,16,0.55))]" aria-hidden="true" />
        <Container className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-end pb-10 pt-16 md:min-h-[720px] md:pb-14">
          <div className="mb-auto hidden justify-between pt-2 md:flex">
            <span className="kicker tnum">13.7563° N — 100.5018° E</span>
            <span className="kicker">{h.hero.based}</span>
          </div>
          <h1 className="animate-fade-up font-display text-display font-bold uppercase">
            <span className="block">{h.hero.line1}</span>
            <span className="block">{h.hero.line2}</span>
            <span className="block text-lime">{h.hero.line3}</span>
          </h1>
          <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="max-w-xl text-lg leading-snug text-ivory md:text-xl">{h.hero.sub}</p>
              <p className="kicker mt-4 hidden sm:block">{h.hero.genres}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton locale={locale} href="/booking" className="min-h-12 px-6">
                {h.hero.cta1} <ArrowRight size={16} aria-hidden="true" />
              </LinkButton>
              <LinkButton locale={locale} href="/academy" variant="secondary" className="min-h-12 px-6">
                {h.hero.cta2}
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 03 — QUICK ACCESS */}
      <Container className="pt-16 md:pt-24">
        <SectionHead kicker={h.quick.kicker} title={h.quick.title} />
        <ul className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
          {quick.map((q, i) => {
            const it = h.quick.items[q.key];
            const img = media?.quick?.[q.key];
            const phase = phaseOf[q.key];
            return (
              <li key={q.key}>
                <L locale={locale} href={q.href} className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-line bg-ink-2 transition-colors hover:border-stone">
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-ink">
                    {img ? (
                      <img src={img} alt={it.t} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    ) : (
                      <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
                        <PanelArt kind={q.key} />
                      </div>
                    )}
                    <span className="kicker tnum absolute left-3 top-3">{String(i + 1).padStart(2, "0")}</span>
                    {phase && <Tag kind="phase" className="absolute right-3 top-3 bg-ink/80">{fmt(t.status.comingPhase, { n: phase })}</Tag>}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-3 md:p-4">
                    <h3 className="flex items-center justify-between gap-2 font-display text-[0.95rem] font-semibold uppercase leading-tight tracking-tight md:text-base">
                      {it.t}
                      <ArrowUpRight size={16} className="shrink-0 text-stone transition-colors group-hover:text-lime" aria-hidden="true" />
                    </h3>
                    <p className="text-[0.8125rem] leading-snug text-stone md:text-sm">{it.d}</p>
                  </div>
                </L>
              </li>
            );
          })}
        </ul>
      </Container>

      {/* SECTION 04 — CHOOSE YOUR JOURNEY */}
      <Container className="pt-20 md:pt-28">
        <SectionHead kicker={j.kicker} title={j.title} sub={j.sub} />
        <Journey
          options={Object.entries(j.options).map(([key, label]) => ({ key, label }))}
          recs={recs}
          labels={{ recommended: j.recommended }}
        />
      </Container>

      {/* SECTION 05 — MEET YOUR INSTRUCTOR */}
      <Container className="pt-20 md:pt-28">
        <SectionHead kicker={h.instructor.kicker} title={h.instructor.title} />
        {instructors[0] ? (
          <InstructorFeature locale={locale} t={t} ins={instructors[0]} />
        ) : (
          <Empty title={h.instructor.empty} />
        )}
      </Container>

      {/* SECTION 06 — AI MUSIC TECHNOLOGY */}
      <section id="ai-lab" className="scroll-mt-20">
        <Container className="pt-20 md:pt-28">
          <SectionHead
            kicker={h.ai.kicker}
            title={h.ai.title}
            sub={h.ai.sub}
            action={<Tag kind="sample">{h.ai.previewNote}</Tag>}
          />
          <div className="grid gap-3 lg:grid-cols-3">
            {/* MIX LAB preview */}
            <div className="rounded-[8px] border border-line bg-ink-2 p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold tracking-[0.1em]">{h.ai.mixlab}</p>
                <Tag kind="sample">{t.status.sample}</Tag>
              </div>
              <p className="mt-1 text-sm text-stone">{h.ai.mixlabD}</p>
              <div className="mt-5 rounded-[6px] border border-line bg-ink p-3">
                <div className="flex justify-between text-[0.6875rem] text-stone tnum font-display"><span>00:00</span><span>12:34</span><span>60:00</span></div>
                <Waveform seed={5} bars={150} height={70} progress={0.21} markers={[0.21, 0.58]} className="mt-2 h-16 w-full text-ivory/70" />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-[6px] border border-line bg-ink p-3">
                  <p className="kicker mb-2">{h.ai.energy}</p>
                  <EnergyCurve points={[0.3, 0.38, 0.5, 0.46, 0.62, 0.8, 0.72, 0.88, 0.6, 0.45]} className="w-full" />
                </div>
                <div className="rounded-[6px] border border-line bg-ink p-3">
                  <div className="mb-2 flex justify-between"><p className="kicker">{h.ai.bands}</p><p className="kicker tnum">{h.ai.bpm} 124.0 → 126.0</p></div>
                  <BandBars className="h-[120px] w-full text-ivory" />
                </div>
              </div>
              <div className="mt-3 flex gap-3 rounded-[6px] border border-lime/40 bg-lime/[0.05] p-3 text-sm">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-lime" aria-hidden="true" />
                <p>{h.ai.sampleAdvice}</p>
              </div>
            </div>
            <div className="grid gap-3">
              {/* COACH preview */}
              <div className="rounded-[8px] border border-line bg-ink-2 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold tracking-[0.1em]">{h.ai.coach}</p>
                  <Tag kind="sample">{t.status.sample}</Tag>
                </div>
                <p className="mt-1 text-sm text-stone">{h.ai.coachD}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="ml-8 rounded-[6px] border border-line bg-ink px-3 py-2">{h.ai.coachQ}</p>
                  <div className="flex gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] bg-lime text-ink"><Mic2 size={13} aria-hidden="true" /></span>
                    <p className="rounded-[6px] border border-lime/30 bg-lime/[0.05] px-3 py-2">{h.ai.coachA}</p>
                  </div>
                </div>
              </div>
              {/* SET BUILDER preview */}
              <div className="rounded-[8px] border border-line bg-ink-2 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold tracking-[0.1em]">{h.ai.setbuilder}</p>
                  <Tag kind="sample">{t.status.sample}</Tag>
                </div>
                <p className="mt-1 text-sm text-stone">{h.ai.setbuilderD}</p>
                <EnergyCurve
                  points={[0.22, 0.34, 0.5, 0.72, 0.9, 0.58, 0.4]}
                  labels={["Opening", "Groove Low", "Groove", "Build", "Peak", "Recovery", "Closing"]}
                  className="mt-3 w-full"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 07 — COMMUNITY */}
      <Container className="pt-20 md:pt-28">
        <SectionHead
          kicker={h.community.kicker}
          title={h.community.title}
          sub={h.community.publicOnly}
          action={<Tag kind="phase">{fmt(t.status.comingPhase, { n: 3 })}</Tag>}
        />
        <div className="grid gap-3 md:grid-cols-4">
          {[h.community.latestMixes, h.community.djs, h.community.events, h.community.challenges].map((title, i) => (
            <div key={title} className="rounded-[8px] border border-line p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold uppercase tracking-[0.1em]">{title}</p>
                <span className="kicker tnum">0</span>
              </div>
              <p className="mt-6 text-sm text-stone">{h.community.empty}</p>
              <L locale={locale} href={["/community", "/artists", "/events", "/community"][i]} className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm text-ivory hover:text-lime">
                {t.common.viewAll} <ArrowRight size={14} aria-hidden="true" />
              </L>
            </div>
          ))}
        </div>
      </Container>

      {/* SECTION 08 — MEMBERSHIP */}
      <Container className="pt-20 md:pt-28">
        <SectionHead
          kicker={h.membership.kicker}
          title={h.membership.title}
          action={
            <LinkButton locale={locale} href="/pricing" variant="secondary">
              {h.membership.compare}
            </LinkButton>
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { t: h.membership.inPerson, d: h.membership.inPersonD, price: minPrice("in_person"), href: "/lessons/bangkok", unit: "" },
            { t: h.membership.online, d: h.membership.onlineD, price: minPrice("online"), href: "/lessons/online", unit: "" },
            { t: h.membership.ai, d: h.membership.aiD, price: memberPlan?.price_satang ?? null, href: "/pricing", unit: t.common.perMonth, accent: true },
          ].map((c) => (
            <L key={c.t} locale={locale} href={c.href} className={`group flex flex-col rounded-[8px] border p-6 transition-colors ${c.accent ? "border-lime/50" : "border-line"} hover:border-ivory/60`}>
              <p className="font-display text-lg font-semibold uppercase tracking-tight">{c.t}</p>
              <p className="mt-2 text-sm text-stone">{c.d}</p>
              <div className="mt-8 flex items-end justify-between gap-3">
                <p className="font-display">
                  {c.price !== null ? (
                    <>
                      <span className="kicker mr-2">{h.membership.from}</span>
                      <span className={`tnum text-3xl font-semibold ${c.accent ? "text-lime" : ""}`}>{money(c.price, locale)}</span>
                      <span className="ml-1 text-sm text-stone">{c.unit}</span>
                    </>
                  ) : (
                    <span className="text-stone">{t.common.notSet}</span>
                  )}
                </p>
                <ArrowUpRight size={20} className="text-stone group-hover:text-lime" aria-hidden="true" />
              </div>
              <div className="mt-3 min-h-5">
                {!c.accent && provisional && <Tag kind="provisional">{t.status.provisional}</Tag>}
                {c.accent && <Tag kind="provisional">{t.status.provisional}</Tag>}
              </div>
            </L>
          ))}
        </div>
        <Kicker className="mt-4 normal-case tracking-normal">{t.pages.pricing.payments}</Kicker>
      </Container>
    </>
  );
}
