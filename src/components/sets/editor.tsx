"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from "lucide-react";
import { saveSetAction } from "@/lib/setbuilder-actions";
import { bpmDelta, relation, setStats, SLOT_CURVE, targetEnergy, type LibTrack, type SetContext, type SetTrack, type Slot } from "@/lib/sets/logic";
import { fmt } from "@/lib/i18n/format";
import type { SetT } from "@/lib/i18n/p2/sets";
import { Alert, btn, cx, inputCls, Tag } from "../ui";
import { mmss } from "../mixlab/fmt";

const relKind = { same: "live", adjacent: "live", relative: "live", boost: "lime", clash: "provisional" } as const;

function EnergyChart({ tracks, slot, s }: { tracks: SetTrack[]; slot: Slot; s: SetT }) {
  const n = tracks.length;
  const W = 600, H = 140, pad = 8;
  const x = (i: number) => (n <= 1 ? W / 2 : pad + (i / (n - 1)) * (W - 2 * pad));
  const y = (e: number) => H - pad - ((e - 1) / 9) * (H - 2 * pad);
  const has = tracks.some((t) => t.energy != null);
  const guide = Array.from({ length: Math.max(2, n) }, (_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(targetEnergy(slot, i, Math.max(2, n))).toFixed(1)}`).join("");
  let d = "", pen = false;
  tracks.forEach((t, i) => { if (t.energy == null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(t.energy).toFixed(1)}`; pen = true; });
  return (
    <figure className="rounded-[8px] border border-line p-4" data-testid="energy-chart">
      <figcaption className="mb-2 text-sm font-medium">{fmt(s.energyChart, { slot: s.slots[slot] })}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full" role="img" aria-label={fmt(s.energyChart, { slot: s.slots[slot] })}>
        {[1, 5, 10].map((e) => <g key={e}><line x1={0} x2={W} y1={y(e)} y2={y(e)} stroke="#303030" /><text x={2} y={y(e) - 3} fill="#858581" fontSize="10">{e}</text></g>)}
        <path d={guide} fill="none" stroke="#f0ede5" strokeOpacity={0.5} strokeDasharray="5 4" />
        {has && <path d={d} fill="none" stroke="#c4f34d" strokeWidth={2} />}
        {tracks.map((t, i) => t.energy != null && <circle key={i} cx={x(i)} cy={y(t.energy)} r={3.5} fill="#c4f34d" />)}
      </svg>
      <p className="mt-1 text-xs text-stone">{has ? s.energyNote : s.energyUnset} ({SLOT_CURVE[slot].join(" → ")})</p>
    </figure>
  );
}

export function SetEditor({ id, s, library, initial }: {
  id: string; s: SetT; library: LibTrack[];
  initial: { title: string; context: SetContext; tracks: SetTrack[] };
}) {
  const [title, setTitle] = useState(initial.title);
  const [ctx, setCtx] = useState<SetContext>(initial.context);
  const [tracks, setTracks] = useState<SetTrack[]>(initial.tracks);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [compat, setCompat] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  const change = (f: (t: SetTrack[]) => SetTrack[]) => { setTracks(f); setDirty(true); setMsg(null); };
  const move = (from: number, to: number) => change((t) => { if (to < 0 || to >= t.length) return t; const c = [...t]; const [x] = c.splice(from, 1); c.splice(to, 0, x); return c; });
  const last = tracks[tracks.length - 1];
  const used = new Set(tracks.map((t) => t.libId).filter(Boolean));
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return library.filter((t) => (!q || `${t.title} ${t.artist} ${t.genre}`.toLowerCase().includes(q))
      && (!compat || !last?.camelot || (t.camelot && relation(last.camelot, t.camelot) !== "clash"))).slice(0, 100);
  }, [library, query, compat, last]);
  const stats = setStats(tracks);

  const save = () => start(async () => {
    const r = await saveSetAction(id, { title, context: ctx, tracks });
    if (r.ok) { setDirty(false); setMsg({ kind: "ok", text: s.saved }); }
    else setMsg({ kind: "error", text: s.errors[r.error ?? "generic"] ?? s.errors.generic });
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-[8px] border border-line p-4 sm:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <label className="block"><span className="mb-1 block text-xs text-stone">{s.setTitle}</span>
          <input value={title} maxLength={120} onChange={(e) => { setTitle(e.target.value); setDirty(true); }} className={inputCls} /></label>
        <label className="block"><span className="mb-1 block text-xs text-stone">{s.minutes}</span>
          <input type="number" min={10} max={600} value={ctx.minutes} onChange={(e) => { setCtx({ ...ctx, minutes: Number(e.target.value) || 60 }); setDirty(true); }} className={inputCls} /></label>
        <label className="block"><span className="mb-1 block text-xs text-stone">{s.slot}</span>
          <select value={ctx.slot} onChange={(e) => { setCtx({ ...ctx, slot: e.target.value as Slot }); setDirty(true); }} className={inputCls}>
            {Object.entries(s.slots).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></label>
        <label className="block"><span className="mb-1 block text-xs text-stone">{s.genre}</span>
          <input value={ctx.genre} maxLength={60} onChange={(e) => { setCtx({ ...ctx, genre: e.target.value }); setDirty(true); }} className={inputCls} /></label>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm tnum" data-testid="set-stats">
        <span className={cx(stats.total / 60 > ctx.minutes ? "text-warn" : "")}>{fmt(s.total, { t: Math.round(stats.total / 60), m: ctx.minutes })}</span>
        {stats.missing > 0 && <span className="text-stone">{fmt(s.missingDur, { n: stats.missing })}</span>}
        <span className={stats.clashes ? "text-warn" : "text-stone"}>{fmt(s.clashes, { n: stats.clashes })}</span>
        <span className={stats.bigJumps ? "text-warn" : "text-stone"}>{fmt(s.jumps, { n: stats.bigJumps })}</span>
        <span className="ml-auto flex items-center gap-3">
          {dirty && <span className="text-xs text-warn">{s.unsaved}</span>}
          <button type="button" onClick={save} disabled={pending} className={btn("primary", "min-h-11")} data-testid="set-save">{pending ? "…" : s.save}</button>
        </span>
      </div>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <ol className="rounded-[8px] border border-line" data-testid="set-tracks">
            {tracks.length === 0 && <li className="px-4 py-6 text-sm text-stone">{s.emptySet}</li>}
            {tracks.map((t, i) => {
              const prev = tracks[i - 1];
              const rel = prev ? relation(prev.camelot, t.camelot) : null;
              const d = prev ? bpmDelta(prev.bpm, t.bpm) : null;
              return (
                <li key={`${t.libId ?? t.title}-${i}`} className={cx("border-b border-line last:border-b-0", drag === i && "opacity-50")}
                  draggable onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
                  onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag != null && drag !== i) move(drag, i); setDrag(null); }}>
                  {prev && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-line bg-ink-2 px-4 py-1.5 text-xs tnum" data-testid="transition">
                      <span className={cx(d != null && Math.abs(d) > 6 ? "text-warn" : "text-stone")}>{d == null ? "BPM ?" : `BPM ${d > 0 ? "+" : ""}${d}%`}</span>
                      {rel ? <Tag kind={relKind[rel]}>{s.rel[rel]}</Tag> : <span className="text-stone">{s.noKey}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-2 py-2 sm:px-3">
                    <GripVertical aria-hidden className="hidden size-4 shrink-0 cursor-grab text-stone sm:block" />
                    <span className="w-6 shrink-0 text-right text-xs text-stone tnum">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{t.title}</p>
                      <p className="truncate text-xs text-stone tnum">{[t.artist, t.bpm && `${t.bpm} BPM`, t.camelot, t.duration_sec && mmss(t.duration_sec)].filter(Boolean).join(" · ")}</p>
                    </div>
                    <label className="shrink-0"><span className="sr-only">{s.t.energy}</span>
                      <select value={t.energy ?? ""} onChange={(e) => change((ts) => ts.map((x, j) => (j === i ? { ...x, energy: e.target.value ? Number(e.target.value) : null } : x)))}
                        className="min-h-11 rounded-[6px] border border-line bg-ink px-1.5 text-sm tnum" title={s.t.energy} aria-label={`${s.t.energy} ${i + 1}`}>
                        <option value="">E –</option>
                        {Array.from({ length: 10 }, (_, k) => <option key={k} value={k + 1}>E {k + 1}</option>)}
                      </select></label>
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid size-11 shrink-0 place-items-center rounded-[6px] text-stone enabled:hover:text-ivory disabled:opacity-30" aria-label={s.up}><ArrowUp className="size-4" /></button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === tracks.length - 1} className="grid size-11 shrink-0 place-items-center rounded-[6px] text-stone enabled:hover:text-ivory disabled:opacity-30" aria-label={s.down}><ArrowDown className="size-4" /></button>
                    <button type="button" onClick={() => change((ts) => ts.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center rounded-[6px] text-stone hover:text-err" aria-label={s.remove}><X className="size-4" /></button>
                  </div>
                </li>
              );
            })}
          </ol>
          <EnergyChart tracks={tracks} slot={ctx.slot} s={s} />
        </div>

        <section className="rounded-[8px] border border-line">
          <div className="space-y-2 border-b border-line p-4">
            <h2 className="kicker">{s.library}</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s.search} className={inputCls} aria-label={s.search} data-testid="lib-search" />
            <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={compat} onChange={(e) => setCompat(e.target.checked)} className="size-4 accent-[#c4f34d]" />{s.compatOnly}</label>
          </div>
          {library.length === 0 ? <p className="p-4 text-sm text-stone">{s.emptyLib}</p> : results.length === 0 ? <p className="p-4 text-sm text-stone">{s.noResults}</p> : (
            <ul className="max-h-[32rem] divide-y divide-line overflow-y-auto" data-testid="lib-results">
              {results.map((t) => {
                const r = last && last.camelot && t.camelot ? relation(last.camelot, t.camelot) : null;
                return (
                  <li key={t.id} className="flex items-center gap-2 px-4 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{t.title}</p>
                      <p className="truncate text-xs text-stone tnum">{[t.artist, t.bpm && `${t.bpm} BPM`, t.camelot].filter(Boolean).join(" · ")}{r ? ` · ${s.rel[r]}` : ""}</p>
                    </div>
                    <button type="button" onClick={() => change((ts) => [...ts, { libId: t.id, title: t.title, artist: t.artist, bpm: t.bpm, camelot: t.camelot, duration_sec: t.duration_sec, genre: t.genre, energy: t.energy }])}
                      className={btn(used.has(t.id) ? "secondary" : "primary", "min-h-11 shrink-0 px-3")} aria-label={`${s.addToSet}: ${t.title}`}>
                      <Plus aria-hidden className="size-4" /><span className="max-sm:sr-only">{used.has(t.id) ? s.inSet : s.addToSet}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
