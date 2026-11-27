import type { Locale } from "@/lib/i18n/config";
import { tr } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import type { MixT } from "@/lib/i18n/p2/mix";
import type { MixRow } from "@/lib/mixlab";
import type { moduleRefs } from "@/lib/mixlab";
import { L, Tag, cx } from "../ui";
import { BandsChart, BpmChart, KeyTimeline, LoudnessChart } from "./charts";
import { MixPlayer, type Marker } from "./player";
import { mmss } from "./fmt";

type Refs = Awaited<ReturnType<typeof moduleRefs>>;

function Metric({ label, value, unit, sub, testid }: { label: string; value: React.ReactNode; unit?: string; sub?: string; testid?: string }) {
  return (
    <div className="rounded-[6px] border border-line p-4" data-testid={testid}>
      <p className="text-xs text-stone">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tnum">{value}{unit && <span className="ml-1 text-sm font-normal text-stone">{unit}</span>}</p>
      {sub && <p className="mt-0.5 text-xs text-stone tnum">{sub}</p>}
    </div>
  );
}

export function MixReport({ row, s, locale, refs, playable = true }: { row: MixRow; s: MixT; locale: Locale; refs: Refs; playable?: boolean }) {
  const m = row.measured, e = row.estimated, dur = row.duration_sec || 1;
  const pc = (c: number) => fmt(s.conf, { c: Math.round(c * 100) });
  const markers: Marker[] = [
    ...m.clipTimes.map((t) => ({ t, label: s.m.clips, kind: "clip" as const })),
    ...m.gaps.map((g) => ({ t: g.t, label: `${s.m.gaps} · ${g.dur}s`, kind: "gap" as const })),
    ...e.transitions.map((x) => ({ t: x.t, label: `${x.reasons.map((r) => s.reasons[r]).join(" + ")} · ${pc(x.c)}`, kind: "transition" as const })),
  ].sort((a, b) => a.t - b.t);
  const scoreKeys = ["clipping", "loudness", "tempo", "harmonic", "flow"] as const;

  return (
    <div className="space-y-8">
      {/* measured */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3"><Tag kind="live">{s.measured}</Tag><span className="text-xs text-stone">{s.measuredNote}</span></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric label={s.m.lufs} value={m.integratedLufs ?? "—"} unit={s.units.lufs} testid="m-lufs" />
          <Metric label={s.m.lra} value={m.lra ?? "—"} unit={s.units.lu} />
          <Metric label={s.m.peak} value={m.peakDbfs} unit={s.units.dbfs} />
          <Metric label={s.m.clips} value={m.clipEvents} testid="m-clips" />
          <Metric label={s.m.stereo} value={m.stereoCorrelation ?? "—"} />
          <Metric label={s.m.gaps} value={m.gaps.length} />
        </div>
      </section>
      {/* estimated */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3"><Tag kind="provisional">{s.estimated}</Tag><span className="text-xs text-stone">{s.estimatedNote}</span></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Metric label={s.m.bpm} value={e.bpm.value ?? "—"} unit={s.units.bpm} sub={pc(e.bpm.confidence)} testid="m-bpm" />
          <Metric label={s.m.range} value={e.bpm.min != null ? `${e.bpm.min}–${e.bpm.max}` : "—"} />
          <Metric label={s.m.key} value={e.key.camelot ? `${e.key.camelot}` : "—"} sub={e.key.name ? `${e.key.name} · ${pc(e.key.confidence)}` : undefined} testid="m-key" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <LoudnessChart title={s.charts.loudness} values={m.shortTerm} step={m.curveStep} duration={dur} integrated={m.integratedLufs} clips={m.clipTimes} unit={s.units.lufs} />
        <BandsChart title={s.charts.bands} bands={m.bands} step={m.curveStep} duration={dur} labels={s.bands} highValid={m.highBandValid}
          note={m.highBandValid ? undefined : fmt(s.highInvalid, { sr: m.sampleRate })} />
        <BpmChart title={s.charts.bpm} curve={e.bpm.curve} duration={dur} />
        <KeyTimeline title={s.charts.key} segments={e.key.segments} duration={dur} note={s.estimatedNote} />
      </div>

      {/* scores */}
      <section className="rounded-[8px] border border-line">
        <header className="flex flex-wrap items-baseline gap-3 border-b border-line px-5 py-4">
          <h2 className="kicker">{s.scoresHdr}</h2>
          <span className="ml-auto text-sm text-stone">{s.overall}</span>
          <span className="font-display text-3xl font-semibold text-lime tnum" data-testid="score-overall">{row.scores.overall ?? "—"}</span>
        </header>
        <ul className="divide-y divide-line">
          {scoreKeys.map((k) => {
            const v = row.scores[k];
            return (
              <li key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr_60px] sm:items-center sm:gap-4">
                <span className="text-sm">{s.scores[k]}</span>
                <span className="text-xs text-stone">{v == null ? s.na : s.formulas[k]}</span>
                <span className={cx("font-display text-xl font-semibold tnum sm:text-right", v == null && "text-stone")}>{v ?? "—"}</span>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-5 py-3 text-xs text-stone">{s.scoresNote} {s.overall}: {s.formulas.overall}.</p>
      </section>

      {/* advice */}
      <section>
        <h2 className="kicker mb-3">{s.adviceHdr}</h2>
        <ul className="space-y-2" data-testid="mix-advice">
          {row.advice.map((a, i) => {
            const mod = a.module ? refs.get(`${a.module.level}.${a.module.order}`) : undefined;
            return (
              <li key={i} className="rounded-[6px] border border-line px-4 py-3 text-sm">
                <p>{fmt(s.advice[a.key] ?? a.key, a.params)}</p>
                {(a.at?.length || mod) && (
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone">
                    {a.at?.length ? <span className="tnum">{s.at}: {a.at.map(mmss).join(", ")}</span> : null}
                    {mod && <L locale={locale} href={`/app/learning/${mod.id}`} className="text-ivory underline underline-offset-4">{s.study}: {mod.level}.{mod.sort_order + 1} {tr(mod.title, locale)}</L>}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* transitions + player */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-1">{s.transitions}</h2>
          <p className="mb-3 text-xs text-stone">{s.transitionsNote}</p>
          {e.transitions.length ? (
            <ul className="divide-y divide-line text-sm" data-testid="mix-transitions">
              {e.transitions.map((x, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-2">
                  <span className="w-16 tnum">{mmss(x.t)}</span>
                  <span className="flex-1">{x.reasons.map((r) => s.reasons[r]).join(" + ")}</span>
                  <span className="text-xs text-stone tnum">{pc(x.c)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone">{s.noTransitions}</p>}
        </section>
        {playable && <MixPlayer hash={row.sha256} markers={markers} labels={{ hdr: s.listenHdr, body: s.listenBody, pick: s.pickAgain, mismatch: s.mismatch }} />}
      </div>
      <p className="text-xs text-stone tnum">{fmt(s.analyzer, { v: row.analyzer, sr: m.sampleRate, ch: m.channels })} · {row.filename} · {mmss(row.duration_sec)}</p>
    </div>
  );
}
