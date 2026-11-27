import { z } from "zod";
import { assertUser, AuthError } from "@/lib/guards";
import { coachTurn, CoachError } from "@/lib/coach";
import { services } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";
import { isLocale } from "@/lib/i18n/config";

const Body = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  mixId: z.string().uuid().optional(),
  setId: z.string().uuid().optional(),
  useLearning: z.boolean().default(false),
  locale: z.string().refine(isLocale),
});

const json = (code: string, status: number) => Response.json({ error: code }, { status });

/** Streams newline-delimited JSON events: {t:"delta",v} … {t:"done",id} | {t:"error",code}. */
export async function POST(req: Request) {
  let user;
  try { user = await assertUser(); } catch (e) { if (e instanceof AuthError) return json("unauthorized", 401); throw e; }
  if (!services.llm) return json("not_connected", 503);
  if (!rateLimit(`coach:${user.id}`, 12, 60_000)) return json("rateLimited", 429);
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return json("invalid", 400);
  const b = p.data;

  const enc = new TextEncoder();
  const body = new ReadableStream({
    async start(ctrl) {
      const send = (o: unknown) => ctrl.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      try {
        for await (const ev of coachTurn({ userId: user.id, locale: b.locale as "en", message: b.message, conversationId: b.conversationId, mixId: b.mixId, setId: b.setId, useLearning: b.useLearning })) send(ev);
      } catch (e) {
        console.error("coach", e);
        send({ t: "error", code: e instanceof CoachError ? e.message : "generic" });
      }
      ctrl.close();
    },
  });
  return new Response(body, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" } });
}
