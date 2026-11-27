import "server-only";
import { cache } from "react";
import { q, q1 } from "./db";

export const PLAN_ORDER = ["free", "member", "artist_pro", "stage_elite"] as const;
export type PlanCode = (typeof PLAN_ORDER)[number];
export type Quotas = { ai_coach_messages: number; mix_analyses: number; max_upload_mb: number; max_minutes: number };
export type UserPlan = {
  code: PlanCode;
  name: string;
  quotas: Quotas;
  sub: { id: string; status: string; provider: string; current_period_end: string | null; cancel_at_period_end: boolean } | null;
};

const rank = (c: string) => Math.max(0, PLAN_ORDER.indexOf(c as PlanCode));
export const atLeast = (have: string, need: string) => rank(have) >= rank(need);

/** The plan a user is entitled to right now. A past_due subscription keeps access until its period ends. */
export const getUserPlan = cache(async (userId: string): Promise<UserPlan> => {
  const sub = await q1<{ id: string; plan_code: string; status: string; provider: string; current_period_end: string | null; cancel_at_period_end: boolean }>(
    `select id, plan_code, status, provider, current_period_end, cancel_at_period_end from subscriptions
      where user_id=$1 and status in ('trialing','active','past_due')
        and (current_period_end is null or current_period_end > now())
      order by created_at desc limit 1`,
    [userId],
  );
  const code = (sub?.plan_code ?? "free") as PlanCode;
  const plan = await q1<{ name: string; quotas: Quotas }>(`select name, quotas from plans where code=$1`, [code]);
  return {
    code,
    name: plan?.name ?? "FREE",
    quotas: { ai_coach_messages: 0, mix_analyses: 0, max_upload_mb: 50, max_minutes: 20, ...(plan?.quotas ?? {}) },
    sub: sub ?? null,
  };
});

export type Usage = { coach: number; mix: number };
export const getUsage = cache(async (userId: string): Promise<Usage> => {
  const rows = await q<{ feature: string; n: number }>(
    `select feature, coalesce(sum(units),0)::int n from ai_usage
      where user_id=$1 and period_month = date_trunc('month', now())::date group by feature`,
    [userId],
  );
  const get = (f: string) => rows.find((r) => r.feature === f)?.n ?? 0;
  return { coach: get("coach"), mix: get("mix_analysis") };
});

export async function recordUsage(userId: string, feature: "coach" | "mix_analysis", info: { input?: number; output?: number; costUsd?: number } = {}) {
  await q(`insert into ai_usage (user_id, feature, units, input_tokens, output_tokens, cost_usd) values ($1,$2,1,$3,$4,$5)`, [
    userId, feature, info.input ?? null, info.output ?? null, info.costUsd ?? 0,
  ]);
}

/** Claude Opus 5.5 list price, USD per token (input $4 / output $20 per million). Used for the admin cost view. */
export const COACH_PRICE = { input: 4 / 1e6, output: 20 / 1e6 };
