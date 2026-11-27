"use server";

import { redirect } from "next/navigation";
import { assertUser } from "./guards";
import { q1 } from "./db";
import { isLocale, lp } from "./i18n/config";
import type { FormState } from "./auth/actions";

export async function deleteConversationAction(_s: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  const r = await q1(`delete from ai_conversations where id=$1 and user_id=$2 returning id`, [String(fd.get("id") ?? ""), user.id]);
  if (!r) return { error: "notFound" };
  const locale = String(fd.get("locale") ?? "en");
  redirect(lp(isLocale(locale) ? locale : "en", "/app/ai-coach"));
}
