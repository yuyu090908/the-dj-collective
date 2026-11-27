import { pageCtx, seo } from "@/lib/i18n/server";
import { Alert, Container, LinkButton, PageHero, SectionHead, Tag } from "@/components/ui";
import { getLessons } from "@/lib/data";
import { LessonCards } from "@/components/site/lessons";
import { services } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/lessons/online">) {
  const { locale, t } = await pageCtx(params);
  const title = { en: "Online DJ Lessons — Live 1:1", ja: "DJ オンラインレッスン — ライブ1対1", th: "เรียนดีเจออนไลน์ — ตัวต่อตัวสด" }[locale];
  return seo(locale, "/lessons/online", title, t.pages.lessons.onlineLead);
}

export default async function Online({ params }: PageProps<"/[locale]/lessons/online">) {
  const { locale, t } = await pageCtx(params);
  const p = t.pages.lessons;
  const lessons = await getLessons("online").catch(() => []);
  return (
    <>
      <PageHero kicker="Online" title={p.online} lead={p.onlineLead} />
      <Container className="pt-14">
        <LessonCards lessons={lessons} locale={locale} t={t} />
      </Container>
      <Container className="pt-20">
        <SectionHead title={p.onlineHow} />
        <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {p.onlineSteps.map((s, i) => (
            <li key={s} className="rounded-[8px] border border-line p-5">
              <span className="font-display text-2xl font-semibold text-lime tnum">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-4 text-sm">{s}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <Alert>{p.audioNote}</Alert>
          <div className="flex flex-wrap items-center gap-3">
            <span className="kicker">{p.videoProvider}: Daily</span>
            {services.daily ? <Tag kind="live">{t.status.live}</Tag> : <Tag kind="notConnected">{t.status.notConnected}</Tag>}
            <LinkButton locale={locale} href="/device-check" variant="secondary">{p.deviceCheck}</LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
