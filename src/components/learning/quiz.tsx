"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { markCompleteAction, submitQuizAction, type QuizResult } from "@/lib/learning-actions";
import { Alert, btn, cx } from "../ui";

type Labels = { submitQuiz: string; score: string; passed: string; retry: string; correct: string; wrong: string; answerAll: string; generic: string; markDone: string; done: string };

export function Quiz({ moduleId, items, labels, completed }: {
  moduleId: string; items: { q: string; o: string[] }[]; labels: Labels; completed: boolean;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null));
  const [res, setRes] = useState<QuizResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const submit = () => {
    if (answers.some((a) => a === null)) return setRes({ ok: false, error: "answerAll" });
    start(async () => {
      const r = await submitQuizAction(moduleId, answers as number[]);
      setRes(r);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-6" data-testid="quiz">
      {items.map((it, qi) => (
        <fieldset key={qi} className="rounded-[8px] border border-line p-4">
          <legend className="px-1 font-display text-sm font-semibold">{qi + 1}. {it.q}</legend>
          <div className="mt-2 grid gap-2">
            {it.o.map((o, oi) => {
              const chosen = answers[qi] === oi;
              const isRight = res?.correct?.[qi] === oi;
              const show = Boolean(res?.correct);
              return (
                <label key={oi} className={cx("flex min-h-11 cursor-pointer items-center gap-3 rounded-[6px] border px-3 text-sm",
                  show && isRight ? "border-ok text-ok" : show && chosen ? "border-err" : chosen ? "border-lime" : "border-line hover:border-stone")}>
                  <input type="radio" name={`q${qi}`} className="h-4 w-4 accent-[#C4F34D]" checked={chosen} disabled={pending}
                    onChange={() => { setAnswers((a) => a.map((v, i) => (i === qi ? oi : v))); setRes(null); }} />
                  <span className="flex-1">{o}</span>
                  {show && isRight && <Check size={16} aria-label={labels.correct} />}
                  {show && chosen && !isRight && <X size={16} aria-hidden="true" />}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      {res?.error && <Alert kind="error">{res.error === "answerAll" ? labels.answerAll : labels.generic}</Alert>}
      {res?.ok && (
        <Alert kind={res.passed ? "ok" : "warn"}>
          <span className="tnum font-semibold" data-testid="quiz-score">{labels.score.replace("{s}", String(res.score))}</span> — {res.passed ? labels.passed : labels.retry}
        </Alert>
      )}
      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} disabled={pending} className={btn("primary")}>{pending ? "…" : labels.submitQuiz}</button>
        {completed && <span className="text-sm text-ok">✓ {labels.done}</span>}
      </div>
    </div>
  );
}

export function MarkDone({ moduleId, labels, completed }: { moduleId: string; labels: Pick<Labels, "markDone" | "done" | "generic">; completed: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);
  const router = useRouter();
  if (completed) return <span className="text-sm text-ok">✓ {labels.done}</span>;
  return (
    <div>
      <button type="button" disabled={pending} className={btn("primary")}
        onClick={() => start(async () => { const r = await markCompleteAction(moduleId); if (r.ok) router.refresh(); else setErr(true); })}>
        {labels.markDone}
      </button>
      {err && <div className="mt-3"><Alert kind="error">{labels.generic}</Alert></div>}
    </div>
  );
}
