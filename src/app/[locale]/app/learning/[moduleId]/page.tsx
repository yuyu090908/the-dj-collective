import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { memberPage } from "@/lib/page-guards";
import { canRead, getModule, progressMap, siblings, touchModule } from "@/lib/learning";
import { tr } from "@/lib/i18n/config";
import { learnT } from "@/lib/i18n/p2/learn";
import { PageTitle } from "@/components/app/shell";
import { L, LinkButton, Tag } from "@/components/ui";
import { MarkDone, Quiz } from "@/components/learning/quiz";

export default async function ModulePage({ params }: PageProps<"/[locale]/app/learning/[moduleId]">) {
  const { locale, t, user } = await memberPage(params);
  const { moduleId } = await params;
  const s = learnT(locale);
  const m = await getModule(moduleId);
  if (!m) notFound();
  const kicker = `${s.level} ${String(m.level).padStart(2, "0")} · ${tr(m.course_title, locale)} · ${m.level}.${m.sort_order + 1}`;

  if (!m.is_published) {
    return (
      <>
        <PageTitle kicker={kicker} title={tr(m.title, locale)} />
        <div className="rounded-[8px] border border-dashed border-line p-8 text-center text-stone"><Tag kind="phase">{s.preparing}</Tag><p className="mt-3">{s.preparingNote}</p></div>
      </>
    );
  }
  if (!(await canRead(user.id, m))) {
    return (
      <>
        <PageTitle kicker={kicker} title={tr(m.title, locale)} />
        <div className="rounded-[8px] border border-line bg-ink-2 p-8" data-testid="module-locked">
          <Lock className="text-lime" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl font-semibold">{s.lockedTitle}</h2>
          <p className="mt-2 max-w-xl text-sm text-stone">{s.lockedBody}</p>
          <div className="mt-6"><LinkButton locale={locale} href="/app/subscription">{s.upgrade}</LinkButton></div>
        </div>
      </>
    );
  }

  await touchModule(user.id, m.id);
  const [prog, nav] = await Promise.all([progressMap(user.id), siblings(m)]);
  const completed = prog.get(m.id)?.status === "completed";
  const c = m.content;
  const body = tr(c.body, locale);
  const points = c.points?.[locale] ?? c.points?.en ?? [];
  const quiz = (c.quiz ?? []).map((x) => ({ q: tr(x.q, locale), o: x.o[locale] ?? x.o.en ?? [] }));
  const labels = {
    submitQuiz: s.submitQuiz, score: s.score, passed: s.passed, retry: s.retry, correct: s.correct, wrong: s.wrong,
    answerAll: s.answerAll, generic: t.errors.generic, markDone: s.markDone, done: s.done,
  };

  return (
    <article className="max-w-3xl">
      <PageTitle kicker={kicker} title={tr(m.title, locale)} />
      <div className="-mt-4 mb-8 flex flex-wrap items-center gap-2 text-xs text-stone">
        {c.minutes ? <span className="tnum">{c.minutes} {s.minutes}</span> : null}
        {m.sort_order === 0 && <Tag kind="lime">{s.preview}</Tag>}
        {completed && <Tag kind="live">{s.completed}</Tag>}
      </div>

      <div className="space-y-4 text-[1.0625rem] leading-relaxed text-ivory/90">
        {body.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <p className="mt-4 text-xs text-stone">{s.draftNote}</p>

      {points.length > 0 && (
        <section className="mt-10 rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-3">{s.keyPoints}</h2>
          <ul className="space-y-2">{points.map((p) => <li key={p} className="flex gap-3"><span className="mt-2.5 h-1 w-3 shrink-0 bg-lime" />{p}</li>)}</ul>
        </section>
      )}
      {c.practice && (
        <section className="mt-6 rounded-[8px] border border-lime/40 bg-lime/[0.03] p-5">
          <h2 className="kicker mb-3 text-lime">{s.practice}</h2>
          <p>{tr(c.practice, locale)}</p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold">{s.quiz}</h2>
        {quiz.length ? <Quiz moduleId={m.id} items={quiz} labels={labels} completed={completed} /> : <MarkDone moduleId={m.id} labels={labels} completed={completed} />}
      </section>

      <nav className="mt-12 flex justify-between gap-3 border-t border-line pt-6">
        {nav.prev ? <L locale={locale} href={`/app/learning/${nav.prev}`} className="inline-flex min-h-11 items-center gap-2 text-sm"><ArrowLeft size={16} />{s.prev}</L> : <span />}
        {nav.next ? <L locale={locale} href={`/app/learning/${nav.next}`} className="inline-flex min-h-11 items-center gap-2 text-sm">{s.next}<ArrowRight size={16} /></L> : <span />}
      </nav>
    </article>
  );
}
