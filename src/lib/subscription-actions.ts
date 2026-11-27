"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertUser } from "./guards";
import { isLocale, type Locale } from "./i18n/config";
import { cancelDemoSubscription, manageUrl, startSubscription, SubscriptionError } from "./subscription";
import type { FormState } from "./auth/actions";

const loc = (v: FormDataEntryValue | null): Locale => (typeof v === "string" && isLocale(v) ? v : "en");

export async function subscribeAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  let url: string;
  try {
    url = await startSubscription(user.id, String(fd.get("plan") ?? ""), loc(fd.get("locale")));
  } catch (e) {
    if (e instanceof SubscriptionError) return { error: e.message };
    console.error("subscribe failed", e);
    return { error: "generic" };
  }
  redirect(url);
}

export async function manageBillingAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await assertUser();
  let url: string;
  try {
    url = await manageUrl(user.id, loc(fd.get("locale")));
  } catch (e) {
    if (e instanceof SubscriptionError) return { error: e.message };
    return { error: "generic" };
  }
  redirect(url);
}

export async function cancelDemoAction(): Promise<FormState> {
  const user = await assertUser();
  await cancelDemoSubscription(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
