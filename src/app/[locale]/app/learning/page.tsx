import { memberPage } from "@/lib/page-guards";
import { getCourses } from "@/lib/data";
import { learningHistory, progressMap } from "@/lib/learning";
import { atLeast, getUserPlan } from "@/lib/plan";
import { tr } from "@/lib/i18n/config";
import { dateTime, fmt } from "@/lib/i18n/format";
import { learnT } from "@/lib/i18n/p2/learn";
import { PageTitle } from "@/components/app/shell";
import { L, LinkButton, Tag, cx } from "@/components/ui";

export default async function Learning({ params }: PageProps<"/[locale]/app/learning">) {
  const { locale, t, user } = await memberPage(params);
  const s = learnT(locale);
  const [courses, prog, history, plan] = await Promise.all([getCourses(), progressMap(user.id), learningHistory(user.id), getUserPlan(user.id)]);
  const all = courses.flatMap((c) => c.modules.filter((m) => m.published));
  const done = all.filter((m) => prog.get(m.id)?.status === "completed").length;
  const next = all.find((m) => prog.get(m.id)?.status !== "completed");

  return (
    <>
      <PageTitle kicker={t.app.items.learning} title={s.title}
        action={next ? <LinkButton locale={locale} href={`/app/learning/${next.id}`}>{done ? s.continue : s.start}</LinkButton> : undefined} />
      <section className="mb-8 rounded-[8px] border border-line p-5" data-testid="learning-progress">
        <div className="flex items-baseline justify-between"><p className="kicker">{s.progress}</p><p className="tnum font-display text-2xl font-semibold text-lime">{all.length ? Math.round((done / all.length) * 100) : 0}%</p></div>
        <div className="mt-3 h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-lime" style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} /></div>
        <p className="mt-2 text-xs text-stone tnum">{fmt(s.of, { a: done, b: all.length })}</p>
      </section>

      <div className="space-y-4">
        {courses.map((c) => {
          const published = c.modules.filter((m) => m.published);
          const cDone = published.filter((m) => prog.get(m.id)?.status === "completed").length;
          const unlocked = atLeast(plan.code, c.min_plan);
          return (
            <section key={c.id} className="rounded-[8px] border border-line">
              <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
                <span className="kicker tnum">{s.level} {String(c.level).padStart(2, "0")}</span>
                <h2 className="font-display text-lg font-semibold uppercase">{tr(c.title, locale)}</h2>
                <span className="ml-auto text-xs text-stone tnum">{published.length ? fmt(s.of, { a: cDone, b: published.length }) : ""}</span>
                {!published.length && <Tag kind="phase">{s.preparing}</Tag>}
              </header>
              <ol className="grid sm:grid-cols-2">
                {c.modules.map((m, i) => {
                  const st = prog.get(m.id)?.status;
                  const open = m.published && (i === 0 || unlocked);
                  const inner = (
                    <>
                      <span className="kicker tnum w-8">{c.level}.{i + 1}</span>
                      <span className="flex-1 text-sm">{tr(m.title, locale)}</span>
                      {st === "completed" ? <Tag kind="live">✓</Tag> : !m.published ? null : i === 0 && !unlocked ? <Tag kind="lime">{s.preview}</Tag> : !unlocked ? <Tag>{s.locked}</Tag> : st ? <Tag kind="provisional">{s.inProgress}</Tag> : null}
                    </>
                  );
                  return (
                    <li key={m.id} className="border-b border-line sm:odd:border-r">
                      {m.published ? (
                        <L locale={locale} href={`/app/learning/${m.id}`} className={cx("flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-ink-2", !open && "opacity-70")}>{inner}</L>
                      ) : (
                        <div className="flex min-h-14 items-center gap-3 px-5 py-3 text-stone">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
              {!published.length && <p className="px-5 py-3 text-xs text-stone">{s.preparingNote}</p>}
            </section>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="kicker mb-3">{s.history}</h2>
        {history.length ? (
          <ul className="divide-y divide-line rounded-[8px] border border-line text-sm" data-testid="learning-history">
            {history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="tnum text-stone">{dateTime(h.at, locale, user.timezone)}</span>
                <span>{h.level}. {tr(h.title, locale)}</span>
                <span className="ml-auto">{h.kind === "done" ? <Tag kind="live">{s.moduleDone}</Tag> : <Tag>{fmt(s.quizAttempt, { s: h.score ?? 0 })}</Tag>}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-stone">{s.noHistory}</p>}
      </section>
    </>
  );
}
