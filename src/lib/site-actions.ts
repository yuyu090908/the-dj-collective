"use server";

import { z } from "zod";
import { q } from "./db";
import { rateLimit } from "./rate-limit";
import { clientIp } from "./guards";
import { sendEmail } from "./integrations";
import { getSiteMedia } from "./data";
import type { FormState } from "./auth/actions";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  topic: z.enum(["lessons", "platform", "events", "other"]),
  body: z.string().trim().min(5).max(5000),
  locale: z.string().max(5),
  website: z.string().max(0).optional(), // honeypot
});

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60_000)) return { error: "rateLimited" };
  const p = schema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "invalidInput" };
  const d = p.data;
  await q(`insert into contact_messages (name,email,topic,body,locale) values ($1,$2,$3,$4,$5)`, [d.name, d.email, d.topic, d.body, d.locale]);
  const to = (await getSiteMedia()).contactEmail;
  if (to) await sendEmail(to, `[Contact] ${d.topic} — ${d.name}`, `${d.email}\n\n${d.body}`).catch(() => false);
  return { ok: true };
}
