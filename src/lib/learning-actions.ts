"use server";

import { revalidatePath } from "next/cache";
import { assertUser } from "./guards";
import { q } from "./db";
import { canRead, getModule } from "./learning";
import { rateLimit } from "./rate-limit";

export type QuizResult = { ok: boolean; error?: string; score?: number; passed?: boolean; correct?: number[] };
const PASS = 80;

async function complete(userId: string, moduleId: string, score: number | null) {
  await q(
    `insert into learning_progress (user_id, module_id, status, quiz_score, completed_at, updated_at)
     values ($1,$2,'completed',$3,now(),now())
     on conflict (user_id, module_id) do update
       set status='completed', quiz_score=greatest(coalesce(learning_progress.quiz_score,0), coalesce(excluded.quiz_score,0)),
           completed_at=coalesce(learning_progress.completed_at, now()), updated_at=now()`,
    [userId, moduleId, score],
  );
}

/** Graded on the server; correct answers are only revealed after an attempt. */
export async function submitQuizAction(moduleId: string, answers: number[]): Promise<QuizResult> {
  const user = await assertUser();
  if (!rateLimit(`quiz:${user.id}`, 30, 60_000)) return { ok: false, error: "rateLimited" };
  const m = await getModule(moduleId);
  if (!m || !m.is_published || !(await canRead(user.id, m))) return { ok: false, error: "forbidden" };
  const quiz = m.content.quiz ?? [];
  if (!quiz.length || answers.length !== quiz.length || answers.some((a) => !Number.isInteger(a) || a < 0)) return { ok: false, error: "answerAll" };
  const right = quiz.filter((item, i) => item.a === answers[i]).length;
  const score = Math.round((right / quiz.length) * 100);
  await q(`insert into quiz_attempts (user_id, module_id, score, answers) values ($1,$2,$3,$4)`, [user.id, moduleId, score, JSON.stringify(answers)]);
  if (score >= PASS) await complete(user.id, moduleId, score);
  else
    await q(
      `insert into learning_progress (user_id, module_id, status, quiz_score) values ($1,$2,'in_progress',$3)
       on conflict (user_id, module_id) do update set quiz_score=greatest(coalesce(learning_progress.quiz_score,0), excluded.quiz_score), updated_at=now()`,
      [user.id, moduleId, score],
    );
  revalidatePath("/", "layout");
  return { ok: true, score, passed: score >= PASS, correct: quiz.map((x) => x.a) };
}

/** For modules without a quiz. */
export async function markCompleteAction(moduleId: string): Promise<QuizResult> {
  const user = await assertUser();
  const m = await getModule(moduleId);
  if (!m || !m.is_published || !(await canRead(user.id, m))) return { ok: false, error: "forbidden" };
  if ((m.content.quiz ?? []).length) return { ok: false, error: "quizRequired" };
  await complete(user.id, moduleId, null);
  revalidatePath("/", "layout");
  return { ok: true, passed: true };
}

