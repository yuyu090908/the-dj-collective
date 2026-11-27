import { ArrowRight, Bell, Bot, CalendarClock, GraduationCap, Dumbbell, Upload, Palette } from "lucide-react";
import { memberPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { getCourses } from "@/lib/data";
import { PageTitle } from "@/components/app/shell";
import { L, LinkButton, Tag, Empty } from "@/components/ui";
import { tr } from "@/lib/i18n/config";
import { dateTime, fmt } from "@/lib/i18n/format";
import { progressMap } from "@/lib/learning";
import { listMixes } from "@/lib/mixlab";
import { getUsage, getUserPlan } from "@/lib/plan";
import { services } from "@/lib/env";
import { dashT } from "@/lib/i18n/p2/dash";

type B = { id: string; starts_at: string; mode: string; status: string; title: Record<string, string>; dj_name: string; meeting_url: string | null; user_timezone: string | null };

export default async function Dashboard({ params }: PageProps<"/[locale]/app/dashboard">) {
  const { locale, t, user } = await memberPage(params);
  const a = t.app;
  const d = dashT(locale);
  const [next, notes, courses, prog, mixes, plan, usage, skills] = await Promise.all([
    q<B>(
      `select b.id, b.starts_at, b.mode, b.status, l.title, i.dj_name, b.meeting_url, b.user_timezone
         from bookings b join lessons l on l.id=b.lesson_id join instructors i on i.id=b.instructor_id
        where b.user_id=$1 and b.status='confirmed' and b.ends_at > now() order by b.starts_at limit 3`,
      [user.id],
    ),
    q<{ id: string; kind: string; payload: Record<string, string>; created_at: string; read_at: string | null }>(
      `select id, kind, payload, created_at, read_at from notifications where user_id=$1 order by created_at desc limit 5`,
      [user.id],
    ),
    getCourses(),
    progressMap(user.id),
    listMixes(user.id, 1),
    getUserPlan(user.id),
    getUsage(user.id),
    q<{ skill: string; score: number; source: string; created_at: string }>(
      `select distinct on (skill, source) skill, score, source, created_at from skill_scores where user_id=$1 order by skill, source, created_at desc`,
      [user.id],
    ),
  ]);
  const published = courses.flatMap((c) => c.modules.filter((m) => m.published).map((m, i) => ({ ...m, level: c.level, idx: i })));
  const doneN = published.filter((m) => prog.get(m.id)?.status === "completed").length;
  const pct = published.length ? Math.round((doneN / published.length) * 100) : 0;
  const nextMod = published.find((m) => prog.get(m.id)?.status !== "completed");
  const mix = mixes[0];
  const tz = user.timezone;
  const levelNo = user.experience === "advanced" ? 4 : user.experience === "intermediate" ? 2 : 1;
  const course = courses.find((c) => c.level === levelNo);
  const nextLesson = next[0];
  const goalClub = user.goal === "club";

  const panel = (key: string, node: React.ReactNode) => ({ key, node });
  const P = {
    continue: panel("continue", (
      <Card icon={<GraduationCap size={18} />} title={a.panels.continue} href={nextMod ? `/app/learning/${nextMod.id}` : "/app/learning"} locale={locale} cta={t.common.open}>
        {nextMod ? (
          <>
            <p className="kicker tnum">{d.nextModule} · {nextMod.level}.{nextMod.idx + 1}</p>
            <p className="mt-1 font-display text-xl font-semibold uppercase">{tr(nextMod.title, locale)}</p>
          </>
        ) : <p className="text-sm">{d.allDone}</p>}
        <div className="mt-3 h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-lime" style={{ width: `${pct}%` }} /></div>
        <p className="mt-1.5 text-xs text-stone tnum">{fmt(d.progressOf, { p: pct, a: doneN, b: published.length })}</p>
      </Card>
    )),
    practice: panel("practice", (
      <Card icon={<Dumbbell size={18} />} title={a.panels.practice} tag={<Tag kind="phase">Phase 04</Tag>} href="/app/practice" locale={locale} cta={t.common.open}>
        <ul className="space-y-1.5 text-sm">
          {(course?.modules ?? []).slice(0, 3).map((m) => <li key={m.id} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 bg-lime" />{tr(m.title, locale)}</li>)}
        </ul>
      </Card>
    )),
    coach: panel("coach", (
      <Card icon={<Bot size={18} />} title={a.panels.coach} tag={services.llm ? undefined : <Tag kind="notConnected">{t.status.notConnected}</Tag>} href="/app/ai-coach" locale={locale} cta={t.common.open}>
        <p className="text-sm text-stone">{t.home.ai.coachD}</p>
        <p className="mt-2 text-xs text-stone tnum">{fmt(d.coachUsage, { n: usage.coach, m: plan.quotas.ai_coach_messages })}</p>
      </Card>
    )),
    upload: panel("upload", (
      <Card icon={<Upload size={18} />} title={a.panels.upload} href={mix ? `/app/mix-lab/${mix.id}` : "/app/mix-lab"} locale={locale} cta={t.common.open}>
        {mix ? (
          <>
            <p className="kicker">{d.latestMix}</p>
            <p className="mt-1 truncate font-medium">{mix.title}</p>
            <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-stone tnum">
              <span>{d.score} <span className="font-semibold text-lime">{mix.overall ?? "—"}</span></span>
              {mix.bpm != null && <span>{mix.bpm} BPM</span>}{mix.camelot && <span>{mix.camelot}</span>}{mix.lufs != null && <span>{mix.lufs} LUFS</span>}
            </p>
          </>
        ) : <p className="text-sm text-stone">{d.noMix}</p>}
        <p className="mt-2 text-xs text-stone tnum">{fmt(d.mixLeft, { n: Math.max(0, plan.quotas.mix_analyses - usage.mix) })}</p>
      </Card>
    )),
    artist: panel("artist", (
      <Card icon={<Palette size={18} />} title="ARTIST STUDIO" tag={<Tag kind="phase">Phase 04</Tag>} href="/app/artist-studio" locale={locale} cta={t.common.open}>
        <p className="text-sm text-stone">{a.priorityFor.advanced}</p>
      </Card>
    )),
  };
  const order =
    user.experience === "beginner" && !goalClub ? [P.continue, P.practice, P.coach, P.upload]
    : user.experience === "intermediate" ? [P.upload, P.continue, P.coach, P.practice]
    : [P.artist, P.upload, P.coach, P.continue];

  return (
    <>
      <PageTitle kicker={a.items.dashboard} title={fmt(a.hello, { name: user.displayName })}>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="kicker">{a.level}</span>
          <span className="font-display font-semibold text-lime tnum">LV {String(levelNo).padStart(2, "0")}</span>
          <span className="kicker ml-3">{a.progress}</span>
          <span className="font-display font-semibold text-lime tnum">{pct}%</span>
        </div>
      </PageTitle>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* NEXT LESSON — always first-class */}
          <section className="rounded-[8px] border border-lime/40 bg-ink-2 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-display text-sm font-semibold tracking-[0.12em]"><CalendarClock size={18} className="text-lime" aria-hidden="true" /> {a.panels.next}</p>
              <L locale={locale} href="/app/my-lessons" className="text-sm text-stone hover:text-ivory">{t.common.viewAll}</L>
            </div>
            {nextLesson ? (
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="tnum font-display text-3xl font-semibold">{dateTime(nextLesson.starts_at, locale, nextLesson.user_timezone || tz)}</p>
                  <p className="mt-1 text-sm text-stone">{tr(nextLesson.title, locale)} · {nextLesson.dj_name}</p>
                </div>
                {nextLesson.mode === "online" && nextLesson.meeting_url ? (
                  <a href={nextLesson.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-[6px] bg-lime px-5 font-display text-sm font-semibold uppercase text-ink">{a.joinCall}</a>
                ) : (
                  <LinkButton locale={locale} href="/app/my-lessons" variant="secondary">{a.items.myLessons}</LinkButton>
                )}
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-stone">{a.noNextLesson}</p>
                <LinkButton locale={locale} href="/booking">{a.bookNow}</LinkButton>
              </div>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-2">{order.map((p) => <div key={p.key}>{p.node}</div>)}</div>

          <section className="rounded-[8px] border border-line p-5">
            <p className="font-display text-sm font-semibold tracking-[0.12em]">{a.growth.toUpperCase()}</p>
            {skills.length ? (
              <ul className="mt-4 space-y-3" data-testid="skill-scores">
                {skills.map((k) => (
                  <li key={`${k.skill}-${k.source}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[200px_minmax(0,1fr)_48px]">
                    <span>{d.skills[k.skill] ?? k.skill} <span className="text-xs text-stone">· {d.source[k.source] ?? k.source}</span></span>
                    <span className="order-3 col-span-2 h-1.5 rounded-full bg-line sm:order-none sm:col-span-1"><span className="block h-full rounded-full bg-ivory/70" style={{ width: `${k.score}%` }} /></span>
                    <span className="text-right font-semibold tnum">{k.score}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="mt-4"><Empty title={a.growthEmpty} /></div>}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[8px] border border-line p-5">
            <p className="flex items-center gap-2 font-display text-sm font-semibold tracking-[0.12em]"><Bell size={16} aria-hidden="true" /> {a.notifications.toUpperCase()}</p>
            {notes.length ? (
              <ul className="mt-3 divide-y divide-line text-sm">
                {notes.map((n) => (
                  <li key={n.id} className="py-2.5">
                    <p>{n.kind === "booking_confirmed" ? t.booking.confirmed : n.kind === "booking_reminder" ? t.booking.reminder : n.kind === "booking_cancelled" ? t.booking.cancelled : n.kind}</p>
                    <p className="text-xs text-stone tnum">{dateTime(n.created_at, locale, tz)}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-stone">{a.noNotifications}</p>}
          </section>
          <section className="rounded-[8px] border border-line p-5">
            <p className="font-display text-sm font-semibold tracking-[0.12em]">COMMUNITY</p>
            <p className="mt-3 text-sm text-stone">{t.home.community.empty}</p>
            <Tag kind="phase" className="mt-3">Phase 03</Tag>
          </section>
        </aside>
      </div>
    </>
  );
}

function Card({ icon, title, tag, href, locale, cta, children }: { icon: React.ReactNode; title: string; tag?: React.ReactNode; href: string; locale: "en" | "ja" | "th"; cta: string; children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col rounded-[8px] border border-line bg-ink-2 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-display text-sm font-semibold tracking-[0.12em]"><span className="text-lime">{icon}</span>{title}</p>
        {tag}
      </div>
      <div className="mt-4 flex-1">{children}</div>
      <L locale={locale} href={href} className="mt-4 inline-flex min-h-11 items-center gap-1 self-start text-sm hover:text-lime">{cta} <ArrowRight size={14} aria-hidden="true" /></L>
    </section>
  );
}
