import "server-only";
import { q, q1 } from "./db";
import { atLeast, getUserPlan } from "./plan";
import type { Localized } from "./i18n/config";

export type QuizItem = { q: Localized; o: Record<string, string[]>; a: number };
export type ModuleContent = { minutes: number; body: Localized; points: Record<string, string[]>; practice: Localized; quiz: QuizItem[] };
export type ModuleRow = {
  id: string; course_id: string; sort_order: number; title: Localized; content: Partial<ModuleContent>; is_published: boolean;
  level: number; course_title: Localized; min_plan: string;
};

export async function getModule(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return q1<ModuleRow>(
    `select m.id, m.course_id, m.sort_order, m.title, m.content, m.is_published, c.level, c.title course_title, c.min_plan
       from course_modules m join courses c on c.id = m.course_id where m.id=$1 and c.is_published`,
    [id],
  );
}

/** The first module of every level is a free preview; everything else needs the course's plan. */
export async function canRead(userId: string, m: Pick<ModuleRow, "sort_order" | "min_plan">) {
  if (m.sort_order === 0) return true;
  const plan = await getUserPlan(userId);
  return atLeast(plan.code, m.min_plan);
}

export async function siblings(m: ModuleRow) {
  const rows = await q<{ id: string; sort_order: number; level: number; is_published: boolean }>(
    `select m.id, m.sort_order, c.level, m.is_published from course_modules m join courses c on c.id=m.course_id
      where c.is_published and m.is_published order by c.level, m.sort_order`,
  );
  const i = rows.findIndex((r) => r.id === m.id);
  return { prev: i > 0 ? rows[i - 1].id : null, next: i >= 0 && i < rows.length - 1 ? rows[i + 1].id : null };
}

export async function progressMap(userId: string) {
  const rows = await q<{ module_id: string; status: string; quiz_score: number | null }>(
    `select module_id, status, quiz_score from learning_progress where user_id=$1`,
    [userId],
  );
  return new Map(rows.map((r) => [r.module_id, r]));
}

export async function learningHistory(userId: string, limit = 20) {
  return q<{ kind: "done" | "quiz"; at: string; module_id: string; title: Localized; level: number; score: number | null }>(
    `select * from (
       select 'done' kind, lp.completed_at at, lp.module_id, m.title, c.level, lp.quiz_score score
         from learning_progress lp join course_modules m on m.id=lp.module_id join courses c on c.id=m.course_id
        where lp.user_id=$1 and lp.status='completed'
       union all
       select 'quiz', qa.created_at, qa.module_id, m.title, c.level, qa.score
         from quiz_attempts qa join course_modules m on m.id=qa.module_id join courses c on c.id=m.course_id
        where qa.user_id=$1
     ) h order by at desc limit $2`,
    [userId, limit],
  );
}

/** Opening a module marks it as started. */
export async function touchModule(userId: string, moduleId: string) {
  await q(
    `insert into learning_progress (user_id, module_id, status) values ($1,$2,'in_progress') on conflict (user_id, module_id) do nothing`,
    [userId, moduleId],
  );
}
