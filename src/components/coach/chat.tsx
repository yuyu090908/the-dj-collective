"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { lp, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import type { CoachT } from "@/lib/i18n/p2/coach";
import { Alert, btn, cx, inputCls } from "../ui";

type Msg = { role: "user" | "assistant"; content: string };
type Opt = { id: string; label: string };

/** Minimal, safe Markdown subset: paragraphs, "-"/"1." lists, **bold**, `code`. No HTML injection. */
function inline(s: string) {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong>
    : p.startsWith("`") && p.endsWith("`") ? <code key={i} className="rounded bg-ink-3 px-1 font-mono text-[0.9em]">{p.slice(1, -1)}</code>
    : <Fragment key={i}>{p}</Fragment>);
}
export function Md({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*([-*]|\d+\.)\s+/.test(l))) {
          const ordered = /^\s*\d+\./.test(lines[0]);
          const items = lines.map((l) => l.replace(/^\s*([-*]|\d+\.)\s+/, ""));
          return ordered
            ? <ol key={i} className="list-decimal space-y-1 pl-5">{items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ol>
            : <ul key={i} className="list-disc space-y-1 pl-5">{items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>;
        }
        if (/^#{1,4}\s/.test(b)) return <p key={i} className="font-semibold">{inline(b.replace(/^#{1,4}\s/, ""))}</p>;
        return <p key={i} className="whitespace-pre-wrap">{inline(b)}</p>;
      })}
    </div>
  );
}

export function CoachChat({ locale, s, connected, conversationId, initial, mixes, sets, ctx, usage }: {
  locale: Locale; s: CoachT; connected: boolean; conversationId?: string; initial: Msg[];
  mixes: Opt[]; sets: Opt[]; ctx: { mixId?: string; setId?: string; useLearning: boolean }; usage: { n: number; m: number };
}) {
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [mixId, setMixId] = useState(ctx.mixId ?? "");
  const [setId, setSetId] = useState(ctx.setId ?? "");
  const [useLearning, setUseLearning] = useState(ctx.useLearning);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const outOfQuota = usage.n >= usage.m;
  const disabled = !connected || busy || outOfQuota;

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs]);

  const send = async (message: string) => {
    if (!message.trim() || disabled) return;
    setErr(null);
    setBusy(true);
    setText("");
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    let newId: string | null = null;
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, conversationId, mixId: mixId || undefined, setId: setId || undefined, useLearning, locale }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "generic");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (!line) continue;
          const ev = JSON.parse(line);
          if (ev.t === "delta") setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: c[c.length - 1].content + ev.v }; return c; });
          else if (ev.t === "done") newId = ev.id;
          else if (ev.t === "error") throw new Error(ev.code);
        }
      }
      if (newId && newId !== conversationId) router.replace(lp(locale, `/app/ai-coach?c=${newId}`));
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setMsgs((m) => m.slice(0, -2));
      setText(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col rounded-[8px] border border-line" data-testid="coach-chat">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 text-sm">
        <span className="kicker">{s.attach}</span>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-stone">{s.mix}</span>
          <select value={mixId} onChange={(e) => setMixId(e.target.value)} className={cx(inputCls, "min-h-11 w-auto max-w-48 py-1")} disabled={busy} data-testid="coach-mix">
            <option value="">{s.none}</option>
            {mixes.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="whitespace-nowrap text-stone">{s.set}</span>
          <select value={setId} onChange={(e) => setSetId(e.target.value)} className={cx(inputCls, "min-h-11 w-auto max-w-48 py-1")} disabled={busy}>
            <option value="">{s.none}</option>
            {sets.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2" title={s.useLearningHint}>
          <input type="checkbox" checked={useLearning} onChange={(e) => setUseLearning(e.target.checked)} disabled={busy} className="size-4 accent-[#c4f34d]" />
          <span>{s.useLearning}</span>
        </label>
      </div>
      {useLearning && <p className="border-b border-line px-4 py-2 text-xs text-stone">{s.useLearningHint}</p>}

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex flex-col gap-2">
            {s.starters.map((q) => (
              <button key={q} type="button" disabled={disabled} onClick={() => send(q)}
                className="min-h-11 rounded-[6px] border border-line px-4 py-2 text-left text-sm enabled:hover:border-ivory/40 disabled:opacity-50">{q}</button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cx("max-w-[44rem] text-sm leading-relaxed", m.role === "user" ? "ml-auto rounded-[8px] bg-ink-3 px-4 py-3" : "")}>
            <p className="kicker mb-1">{m.role === "user" ? s.you : s.coach}</p>
            {m.role === "assistant" && !m.content && busy ? <p className="text-stone">{s.sending}</p> : <Md text={m.content} />}
          </div>
        ))}
        <div ref={end} />
      </div>

      <div className="border-t border-line p-4">
        {err && <div className="mb-3"><Alert kind="error">{s.errors[err] ?? s.errors.generic}</Alert></div>}
        <form onSubmit={(e) => { e.preventDefault(); void send(text); }} className="flex items-end gap-2">
          <label className="sr-only" htmlFor="coach-input">{s.placeholder}</label>
          <textarea id="coach-input" value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={4000} disabled={disabled}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(text); } }}
            placeholder={s.placeholder} className={cx(inputCls, "min-h-12 flex-1 resize-y")} data-testid="coach-input" />
          <button type="submit" disabled={disabled || !text.trim()} className={btn("primary", "min-h-12 shrink-0")} aria-label={s.send} data-testid="coach-send">
            <Send aria-hidden className="size-4" /><span className="max-sm:sr-only">{busy ? s.sending : s.send}</span>
          </button>
        </form>
        <p className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-stone tnum">
          <span>{fmt(s.usage, { n: usage.n, m: usage.m })}</span><span>{s.disclaimer}</span>
        </p>
      </div>
    </div>
  );
}
