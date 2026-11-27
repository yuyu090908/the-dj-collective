import { mmss } from "./fmt";

const W = 800, H = 160;

function Axis({ duration }: { duration: number }) {
  return (
    <div className="mt-1 flex justify-between text-[11px] text-stone tnum" aria-hidden>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <span key={f}>{mmss(duration * f)}</span>)}
    </div>
  );
}

function Frame({ title, children, legend, note, duration, yLabels }: { title: string; children: React.ReactNode; legend?: React.ReactNode; note?: string; duration: number; yLabels?: [string, string] }) {
  return (
    <figure className="rounded-[8px] border border-line p-4">
      <figcaption className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span className="font-medium">{title}</span>{legend}</figcaption>
      <div className="relative">
        {yLabels && (
          <div className="pointer-events-none absolute inset-y-0 left-1 flex flex-col justify-between py-0.5 text-[10px] text-stone tnum" aria-hidden><span>{yLabels[0]}</span><span>{yLabels[1]}</span></div>
        )}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-36 w-full" role="img" aria-label={title}>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="#303030" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
          {children}
        </svg>
      </div>
      <Axis duration={duration} />
      {note && <p className="mt-2 text-xs text-stone">{note}</p>}
    </figure>
  );
}

const path = (vals: (number | null)[], step: number, duration: number, y: (v: number) => number) => {
  let d = "", pen = false;
  vals.forEach((v, i) => {
    if (v == null) { pen = false; return; }
    const x = ((i * step + step / 2) / duration) * W;
    d += `${pen ? "L" : "M"}${x.toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  });
  return d;
};

export function LoudnessChart({ title, values, step, duration, integrated, clips, unit }: { title: string; values: (number | null)[]; step: number; duration: number; integrated: number | null; clips: number[]; unit: string }) {
  const lo = -40, hi = 0;
  const y = (v: number) => H - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * H;
  return (
    <Frame title={title} duration={duration} yLabels={[`0 ${unit}`, `${lo}`]}>
      {integrated != null && <line x1={0} x2={W} y1={y(integrated)} y2={y(integrated)} stroke="#f0ede5" strokeOpacity={0.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
      {clips.map((t, i) => <line key={i} x1={(t / duration) * W} x2={(t / duration) * W} y1={0} y2={H} stroke="#ef4444" strokeOpacity={0.8} vectorEffect="non-scaling-stroke" />)}
      <path d={path(values, step, duration, y)} fill="none" stroke="#c4f34d" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </Frame>
  );
}

export function BandsChart({ title, bands, step, duration, labels, highValid, note }: { title: string; bands: { low: number[]; mid: number[]; high: number[] }; step: number; duration: number; labels: { low: string; mid: string; high: string }; highValid: boolean; note?: string }) {
  const all = [...bands.low, ...bands.mid, ...(highValid ? bands.high : [])].filter((v) => v > -100);
  const hi = all.length ? Math.max(...all) : 0;
  const lo = hi - 40;
  const y = (v: number) => H - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * H;
  const series = [
    { k: "low", v: bands.low, s: { stroke: "#f0ede5", strokeOpacity: 1 } },
    { k: "mid", v: bands.mid, s: { stroke: "#f0ede5", strokeOpacity: 0.55, strokeDasharray: "6 3" } },
    ...(highValid ? [{ k: "high", v: bands.high, s: { stroke: "#858581", strokeOpacity: 1, strokeDasharray: "2 3" } }] : []),
  ] as const;
  const legend = series.map((x) => (
    <span key={x.k} className="flex items-center gap-1.5 text-xs text-stone">
      <svg width="18" height="6" aria-hidden><line x1="0" x2="18" y1="3" y2="3" strokeWidth="2" {...x.s} /></svg>{labels[x.k as keyof typeof labels]}
    </span>
  ));
  return (
    <Frame title={title} duration={duration} legend={legend} note={note}>
      {series.map((x) => <path key={x.k} d={path(x.v.map((v) => (v > -100 ? v : null)), step, duration, y)} fill="none" strokeWidth={1.5} vectorEffect="non-scaling-stroke" {...x.s} />)}
    </Frame>
  );
}

export function BpmChart({ title, curve, duration }: { title: string; curve: { t: number; bpm: number; c: number }[]; duration: number }) {
  const good = curve.filter((p) => p.c >= 0.15);
  if (!good.length) return null;
  const vals = good.map((p) => p.bpm);
  const lo = Math.floor(Math.min(...vals) - 2), hi = Math.ceil(Math.max(...vals) + 2);
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  return (
    <Frame title={title} duration={duration} yLabels={[String(hi), String(lo)]}>
      {good.map((p, i) => <rect key={i} x={(p.t / duration) * W - 2} y={y(p.bpm) - 2} width={4} height={4} fill="#f0ede5" fillOpacity={0.35 + 0.65 * Math.min(1, p.c)} />)}
    </Frame>
  );
}

/** Key timeline: consecutive identical segments merged, opacity = confidence. */
export function KeyTimeline({ title, segments, duration, note }: { title: string; segments: { t: number; camelot: string; c: number }[]; duration: number; note?: string }) {
  const merged: { t: number; end: number; camelot: string; c: number }[] = [];
  segments.forEach((s, i) => {
    const end = segments[i + 1]?.t ?? duration;
    const last = merged[merged.length - 1];
    if (last && last.camelot === s.camelot) { last.end = end; last.c = Math.max(last.c, s.c); }
    else merged.push({ t: s.t, end, camelot: s.camelot, c: s.c });
  });
  if (!merged.length) return null;
  return (
    <figure className="rounded-[8px] border border-line p-4">
      <figcaption className="mb-3 text-sm font-medium">{title}</figcaption>
      <div className="flex h-10 w-full overflow-hidden rounded-[4px] border border-line">
        {merged.map((m, i) => (
          <div key={i} title={`${mmss(m.t)} ${m.camelot}`} className="flex min-w-0 items-center justify-center border-r border-line text-[11px] font-medium last:border-r-0 tnum"
            style={{ width: `${((m.end - m.t) / duration) * 100}%`, background: `rgba(240,237,229,${(0.05 + 0.2 * m.c).toFixed(2)})` }}>
            <span className="truncate px-0.5">{m.camelot}</span>
          </div>
        ))}
      </div>
      <Axis duration={duration} />
      {note && <p className="mt-2 text-xs text-stone">{note}</p>}
    </figure>
  );
}
