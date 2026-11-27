// Brand visuals drawn in SVG: no stock photos, no fake imagery.
// Deterministic pseudo-random so server and client render identically.

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="18" r="2" fill="currentColor" />
      <rect x="23" y="5" width="4" height="4" fill="#C4F34D" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-ivory">
      <LogoMark />
      <span className="font-display text-[0.8125rem] font-bold uppercase leading-none tracking-[-0.01em] whitespace-nowrap sm:text-[0.95rem]">
        {compact ? "TDC" : <>The DJ Collective</>}
      </span>
    </span>
  );
}

export function Waveform({
  seed = 7, bars = 120, height = 64, className, progress = 0, markers = [],
}: { seed?: number; bars?: number; height?: number; className?: string; progress?: number; markers?: number[] }) {
  const r = rng(seed);
  const w = bars * 4;
  const vals = Array.from({ length: bars }, (_, i) => {
    const env = 0.45 + 0.55 * Math.sin((i / bars) * Math.PI * 1.15 + 0.3) ** 2;
    return Math.max(0.08, Math.min(1, env * (0.55 + r() * 0.6)));
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {vals.map((v, i) => {
        const h = v * (height - 4);
        const played = i / bars < progress;
        return <rect key={i} x={i * 4} y={(height - h) / 2} width="2.4" height={h} fill={played ? "#C4F34D" : "currentColor"} opacity={played ? 1 : 0.55} />;
      })}
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={m * w} x2={m * w} y1="0" y2={height} stroke="#C4F34D" strokeWidth="1.5" />
          <rect x={m * w - 3} y="0" width="6" height="6" fill="#C4F34D" />
        </g>
      ))}
    </svg>
  );
}

export function EnergyCurve({ points, className, labels }: { points: number[]; className?: string; labels?: string[] }) {
  const w = 600, h = 160, pad = 8;
  const step = (w - pad * 2) / (points.length - 1);
  const xy = points.map((p, i) => [pad + i * step, h - pad - p * (h - pad * 2)] as const);
  const d = xy.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + (labels ? 22 : 0)}`} className={className} role="img" aria-label="Energy curve">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={h - pad - g * (h - pad * 2)} y2={h - pad - g * (h - pad * 2)} stroke="#303030" strokeDasharray="2 4" />
      ))}
      <path d={`${d} L${w - pad},${h - pad} L${pad},${h - pad} Z`} fill="#C4F34D" opacity="0.08" />
      <path d={d} fill="none" stroke="#C4F34D" strokeWidth="2" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#101010" stroke="#C4F34D" strokeWidth="1.5" />
      ))}
      {labels?.map((l, i) => (
        <text key={l} x={pad + i * step} y={h + 16} fill="#858581" fontSize="10" textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"} fontFamily="var(--font-space)">
          {l.toUpperCase()}
        </text>
      ))}
    </svg>
  );
}

export function BandBars({ seed = 3, className }: { seed?: number; className?: string }) {
  const r = rng(seed);
  const n = 48;
  return (
    <svg viewBox={`0 0 ${n * 6} 60`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const band = i < 16 ? 0 : i < 32 ? 1 : 2;
        const base = [0.75, 0.55, 0.4][band];
        const v = Math.min(1, base * (0.6 + r() * 0.7));
        return <rect key={i} x={i * 6} y={60 - v * 58} width="4" height={v * 58} fill={band === 0 ? "#C4F34D" : "currentColor"} opacity={band === 0 ? 0.9 : 0.5} />;
      })}
    </svg>
  );
}

/** Abstract artwork for each Quick Access panel. */
export function PanelArt({ kind }: { kind: string }) {
  const common = "absolute inset-0 h-full w-full text-ivory/70";
  switch (kind) {
    case "studio":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1].map((d) => (
            <g key={d} transform={`translate(${50 + d * 120} 100)`}>
              {[46, 38, 30, 22].map((r) => <circle key={r} r={r} fill="none" stroke="currentColor" strokeOpacity={0.25 + r / 200} />)}
              <circle r="5" fill="#C4F34D" />
            </g>
          ))}
          <rect x="132" y="40" width="36" height="120" rx="3" fill="none" stroke="currentColor" strokeOpacity=".5" />
          {[0, 1, 2].map((k) => <circle key={k} cx="150" cy={62 + k * 22} r="6" fill="none" stroke="currentColor" strokeOpacity=".6" />)}
          <rect x="140" y="135" width="20" height="4" fill="currentColor" opacity=".7" />
        </svg>
      );
    case "online":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect x="40" y="36" width="220" height="128" rx="6" fill="none" stroke="currentColor" strokeOpacity=".5" />
          <rect x="190" y="110" width="58" height="42" rx="3" fill="none" stroke="#C4F34D" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1="60" x2={60 + ((i * 37) % 110)} y1={56 + i * 10} y2={56 + i * 10} stroke="currentColor" strokeOpacity=".35" />)}
          <circle cx="219" cy="128" r="6" fill="currentColor" opacity=".6" />
        </svg>
      );
    case "mixlab":
      return (
        <div className={common + " flex items-center px-5"}>
          <Waveform seed={11} bars={70} height={90} className="h-24 w-full text-ivory/60" progress={0.42} markers={[0.42, 0.71]} />
        </div>
      );
    case "coach":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect x="40" y="44" width="150" height="34" rx="4" fill="none" stroke="currentColor" strokeOpacity=".45" />
          <rect x="110" y="92" width="150" height="50" rx="4" fill="#C4F34D" fillOpacity=".12" stroke="#C4F34D" strokeOpacity=".8" />
          <rect x="40" y="156" width="110" height="20" rx="4" fill="none" stroke="currentColor" strokeOpacity=".3" />
          {[0, 1, 2].map((i) => <rect key={i} x={124} y={104 + i * 10} width={110 - i * 28} height="3" fill="currentColor" opacity=".55" />)}
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[[70, 70], [150, 50], [230, 80], [110, 140], [200, 150], [150, 100]].map(([x, y], i, a) => (
            <g key={i}>
              {a.slice(i + 1).map(([x2, y2], j) => <line key={j} x1={x} y1={y} x2={x2} y2={y2} stroke="currentColor" strokeOpacity=".18" />)}
              <circle cx={x} cy={y} r={i === 5 ? 10 : 7} fill={i === 5 ? "#C4F34D" : "#101010"} stroke="currentColor" strokeOpacity=".7" />
            </g>
          ))}
        </svg>
      );
    case "battles":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0.62, 0.84, 0.48, 0.7].map((v, i) => (
            <g key={i}>
              <rect x={56 + i * 50} y={170 - v * 120} width="30" height={v * 120} fill={i === 1 ? "#C4F34D" : "currentColor"} opacity={i === 1 ? 0.9 : 0.35} />
              <text x={71 + i * 50} y="186" textAnchor="middle" fontSize="10" fill="currentColor" opacity=".6">{String(i + 1).padStart(2, "0")}</text>
            </g>
          ))}
        </svg>
      );
    case "artist":
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect x="80" y="30" width="140" height="140" fill="none" stroke="currentColor" strokeOpacity=".4" />
          <text x="150" y="112" textAnchor="middle" fontSize="40" fontWeight="700" fill="currentColor" opacity=".8" fontFamily="var(--font-space)" letterSpacing="-2">D/N</text>
          <rect x="80" y="30" width="18" height="18" fill="#C4F34D" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 300 200" className={common} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={40 + i * 32} y="40" width="24" height="120" rx="2" fill="none" stroke={i === 4 ? "#C4F34D" : "currentColor"} strokeOpacity={i === 4 ? 1 : 0.3} />
          ))}
          <text x="40" y="184" fontSize="10" fill="currentColor" opacity=".6" fontFamily="var(--font-space)">MON TUE WED THU FRI SAT SUN</text>
        </svg>
      );
  }
}
