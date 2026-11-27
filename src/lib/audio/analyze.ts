/**
 * In-browser mix analysis. Pure TypeScript (no DOM), so it can also run in Node for tests.
 *
 * MEASURED (deterministic signal measurements):
 *   sample peak, clipping runs, integrated loudness + loudness range (ITU-R BS.1770 / EBU R128 gating),
 *   short-term loudness curve, low/mid/high band energy curves, stereo correlation, silent gaps.
 * ESTIMATED (heuristics with a confidence value — can be wrong):
 *   tempo (onset autocorrelation), key (Krumhansl–Kessler chroma profiles), possible transition points.
 */

export const ANALYZER_VERSION = "browser-v1";

export type Analysis = {
  version: string;
  durationSec: number;
  sampleRate: number; // analysis sample rate (audio is decoded at a reduced rate to fit in memory)
  channels: number;
  measured: {
    peakDbfs: number;
    clipEvents: number;
    clipTimes: number[];
    integratedLufs: number | null;
    lra: number | null;
    stereoCorrelation: number | null;
    curveStep: number; // seconds between curve points
    shortTerm: (number | null)[]; // LUFS, 3 s window
    bands: { low: number[]; mid: number[]; high: number[] }; // dB (relative)
    highBandValid: boolean;
    gaps: { t: number; dur: number }[];
  };
  estimated: {
    bpm: { value: number | null; confidence: number; min: number | null; max: number | null; curve: { t: number; bpm: number; c: number }[] };
    key: { camelot: string | null; name: string | null; confidence: number; segments: { t: number; camelot: string; c: number }[] };
    transitions: { t: number; reasons: ("tempo" | "key" | "texture")[]; c: number }[];
  };
};

type Progress = (stage: string, pct: number) => void;
const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const r1 = (x: number) => Math.round(x * 10) / 10;
const r2 = (x: number) => Math.round(x * 100) / 100;
const db = (x: number) => (x > 0 ? 10 * Math.log10(x) : -120);

// ───────────────────────── FFT (radix-2, in place) ─────────────────────────
function makeFft(n: number) {
  const levels = Math.log2(n);
  if (!Number.isInteger(levels)) throw new Error("fft size must be a power of 2");
  const cos = new Float32Array(n / 2);
  const sin = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n);
    sin[i] = Math.sin((2 * Math.PI * i) / n);
  }
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let x = i, y = 0;
    for (let j = 0; j < levels; j++) { y = (y << 1) | (x & 1); x >>>= 1; }
    rev[i] = y;
  }
  return (re: Float32Array, im: Float32Array) => {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tre = re[l] * cos[k] + im[l] * sin[k];
          const tim = -re[l] * sin[k] + im[l] * cos[k];
          re[l] = re[j] - tre; im[l] = im[j] - tim;
          re[j] += tre; im[j] += tim;
        }
      }
    }
  };
}
const hann = (n: number) => Float32Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));
const pow2 = (x: number) => 2 ** Math.round(Math.log2(x));

// ───────────────────────── K-weighting (BS.1770) ─────────────────────────
type Biquad = { b0: number; b1: number; b2: number; a1: number; a2: number };
function kWeighting(fs: number): [Biquad, Biquad] {
  // Stage 1: high shelf (+4 dB above ~1.7 kHz). Stage 2: high-pass (~38 Hz). RBJ forms with BS.1770 parameters.
  let w0 = (2 * Math.PI * 1681.974450955533) / fs;
  const A = 10 ** (3.999843853973347 / 40);
  let alpha = Math.sin(w0) / (2 * 0.7071752369554196);
  const c = Math.cos(w0), sA = Math.sqrt(A);
  let a0 = A + 1 - (A - 1) * c + 2 * sA * alpha;
  const shelf: Biquad = {
    b0: (A * (A + 1 + (A - 1) * c + 2 * sA * alpha)) / a0,
    b1: (-2 * A * (A - 1 + (A + 1) * c)) / a0,
    b2: (A * (A + 1 + (A - 1) * c - 2 * sA * alpha)) / a0,
    a1: (2 * (A - 1 - (A + 1) * c)) / a0,
    a2: (A + 1 - (A - 1) * c - 2 * sA * alpha) / a0,
  };
  w0 = (2 * Math.PI * 38.13547087602444) / fs;
  alpha = Math.sin(w0) / (2 * 0.5003270373238773);
  const c2 = Math.cos(w0);
  a0 = 1 + alpha;
  const hp: Biquad = { b0: (1 + c2) / 2 / a0, b1: -(1 + c2) / a0, b2: (1 + c2) / 2 / a0, a1: (-2 * c2) / a0, a2: (1 - alpha) / a0 };
  return [shelf, hp];
}

// ───────────────────────── key profiles / Camelot ─────────────────────────
const NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
// Camelot numbers indexed by pitch class (C=0)
const CAMELOT_MAJOR = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1];
const CAMELOT_MINOR = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10];

function pearson(a: number[], b: number[]) {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, dbb = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; dbb += (b[i] - mb) ** 2; }
  return da && dbb ? num / Math.sqrt(da * dbb) : 0;
}
export function estimateKey(chroma: number[]): { camelot: string; name: string; r: number; margin: number } | null {
  if (chroma.every((x) => x === 0)) return null;
  const scores: { pc: number; minor: boolean; r: number }[] = [];
  for (let pc = 0; pc < 12; pc++) {
    const rot = (p: number[]) => p.map((_, i) => p[(i - pc + 12) % 12]);
    scores.push({ pc, minor: false, r: pearson(chroma, rot(MAJOR)) });
    scores.push({ pc, minor: true, r: pearson(chroma, rot(MINOR)) });
  }
  scores.sort((a, b) => b.r - a.r);
  const best = scores[0];
  return {
    camelot: `${(best.minor ? CAMELOT_MINOR : CAMELOT_MAJOR)[best.pc]}${best.minor ? "A" : "B"}`,
    name: `${NOTES[best.pc]}${best.minor ? "m" : ""}`,
    r: best.r,
    margin: best.r - scores[1].r,
  };
}

/** Camelot compatibility: same, ±1 on the wheel, or A↔B at the same number. */
export function camelotCompatible(a: string, b: string): "same" | "adjacent" | "relative" | "boost" | "clash" {
  const pa = /^(\d+)([AB])$/.exec(a), pb = /^(\d+)([AB])$/.exec(b);
  if (!pa || !pb) return "clash";
  const na = +pa[1], nb = +pb[1];
  const d = Math.min((na - nb + 12) % 12, (nb - na + 12) % 12);
  if (pa[2] === pb[2]) return d === 0 ? "same" : d === 1 ? "adjacent" : d === 2 ? "boost" : "clash";
  return d === 0 ? "relative" : "clash";
}

// ───────────────────────── tempo ─────────────────────────
function tempoFromEnvelope(env: Float32Array, fr: number): { bpm: number; c: number } | null {
  const n = env.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += env[i];
  mean /= n;
  const x = Float32Array.from(env, (v) => v - mean);
  let ac0 = 0;
  for (let i = 0; i < n; i++) ac0 += x[i] * x[i];
  if (ac0 <= 1e-9) return null;
  const minLag = Math.floor((fr * 60) / 185), maxLag = Math.ceil((fr * 60) / 68);
  const ac = new Float32Array(maxLag + 2);
  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += x[i] * x[i + lag];
    ac[lag] = s / ac0;
  }
  let best = -1, bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (60 * fr) / lag;
    const prior = Math.exp(-0.5 * (Math.log2(bpm / 120) / 1.0) ** 2); // log-gaussian prior around 120 BPM (1 octave)
    const sc = ac[lag] * prior;
    if (ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1] && sc > bestScore) { bestScore = sc; best = lag; }
  }
  if (best < 0) return null;
  const y0 = ac[best - 1], y1 = ac[best], y2 = ac[best + 1];
  const den = y0 - 2 * y1 + y2;
  const shift = den !== 0 ? (0.5 * (y0 - y2)) / den : 0;
  return { bpm: (60 * fr) / (best + Math.max(-0.5, Math.min(0.5, shift))), c: Math.max(0, Math.min(1, y1)) };
}

// ───────────────────────── main ─────────────────────────
export async function analyze(channels: Float32Array[], sr: number, onProgress: Progress = () => {}): Promise<Analysis> {
  const nch = Math.min(2, channels.length);
  const L = channels[0], R = nch > 1 ? channels[1] : channels[0];
  const N = L.length;
  const duration = N / sr;
  const STEP = 3; // seconds per curve point

  // 1) peak, clipping, stereo correlation, K-weighted energy per 100 ms
  onProgress("loudness", 0);
  let peak = 0, sLL = 0, sRR = 0, sLR = 0;
  const clipTimes: number[] = [];
  let clipEvents = 0;
  let run = 0; // consecutive samples where any channel is at full scale
  const [f1, f2] = kWeighting(sr);
  const z = Array.from({ length: nch }, () => [0, 0, 0, 0]); // biquad states per channel
  const sub = Math.round(sr * 0.1);
  const nSub = Math.floor(N / sub);
  const subE = new Float64Array(nSub);
  const CH = 1 << 20;
  for (let start = 0; start < N; start += CH) {
    const end = Math.min(N, start + CH);
    for (let c = 0; c < nch; c++) {
      const x = channels[c];
      const st = z[c];
      for (let i = start; i < end; i++) {
        const v = x[i];
        const a = v < 0 ? -v : v;
        if (a > peak) peak = a;
        // stage 1
        const y1 = f1.b0 * v + st[0];
        st[0] = f1.b1 * v - f1.a1 * y1 + st[1];
        st[1] = f1.b2 * v - f1.a2 * y1;
        // stage 2
        const y2 = f2.b0 * y1 + st[2];
        st[2] = f2.b1 * y1 - f2.a1 * y2 + st[3];
        st[3] = f2.b2 * y1 - f2.a2 * y2;
        const k = (i / sub) | 0;
        if (k < nSub) subE[k] += (y2 * y2) / sub;
      }
    }
    for (let i = start; i < end; i++) {
      const l = L[i], r = R[i];
      if (nch > 1) { sLL += l * l; sRR += r * r; sLR += l * r; }
      if ((l < 0 ? -l : l) >= 0.999 || (r < 0 ? -r : r) >= 0.999) {
        run++;
        if (run === 3) { clipEvents++; if (clipTimes.length < 200) clipTimes.push(r1(i / sr)); }
      } else run = 0;
    }
    onProgress("loudness", (end / N) * 100);
    await tick();
  }

  // gated loudness (momentary 400 ms blocks, 75 % overlap)
  const blocks: number[] = [];
  for (let k = 0; k + 4 <= nSub; k++) blocks.push((subE[k] + subE[k + 1] + subE[k + 2] + subE[k + 3]) / 4);
  const lufs = (ms: number) => -0.691 + db(ms);
  const absGated = blocks.filter((b) => lufs(b) > -70);
  let integrated: number | null = null;
  if (absGated.length) {
    const rel = lufs(absGated.reduce((s, b) => s + b, 0) / absGated.length) - 10;
    const g = absGated.filter((b) => lufs(b) > rel);
    if (g.length) integrated = r1(lufs(g.reduce((s, b) => s + b, 0) / g.length));
  }
  // short-term (3 s) every 1 s → LRA; curve every STEP s
  const st1: number[] = [];
  for (let k = 0; k + 30 <= nSub; k += 10) {
    let s = 0;
    for (let j = k; j < k + 30; j++) s += subE[j];
    st1.push(lufs(s / 30));
  }
  let lra: number | null = null;
  const stAbs = st1.filter((v) => v > -70);
  if (stAbs.length > 10) {
    const relGate = lufs(stAbs.reduce((s, v) => s + 10 ** ((v + 0.691) / 10), 0) / stAbs.length) - 20;
    const g = stAbs.filter((v) => v > relGate).sort((a, b) => a - b);
    if (g.length > 10) lra = r1(g[Math.floor(0.95 * (g.length - 1))] - g[Math.floor(0.1 * (g.length - 1))]);
  }
  const shortTerm: (number | null)[] = [];
  for (let t = 0; t + 3 <= duration; t += STEP) {
    const v = st1[Math.round(t)];
    shortTerm.push(v === undefined || v < -70 ? null : r1(v));
  }
  // gaps: ≥ 2 s of 100 ms blocks below -50 LUFS, ignoring the first/last 10 s
  const gaps: { t: number; dur: number }[] = [];
  let gStart = -1;
  for (let k = 0; k <= nSub; k++) {
    const quiet = k < nSub && lufs(subE[k]) < -50 && k >= 100 && k < nSub - 100;
    if (quiet && gStart < 0) gStart = k;
    if (!quiet && gStart >= 0) { if (k - gStart >= 20) gaps.push({ t: r1(gStart / 10), dur: r1((k - gStart) / 10) }); gStart = -1; }
  }

  // 2) spectral pass A — onset envelope (~11 ms hop) for tempo
  onProgress("tempo", 0);
  const n1 = pow2(sr * 0.046), hop1 = n1 / 4;
  const fft1 = makeFft(n1), w1 = hann(n1);
  const re1 = new Float32Array(n1), im1 = new Float32Array(n1);
  const frames1 = Math.max(0, Math.floor((N - n1) / hop1));
  const env = new Float32Array(frames1);
  let prev = new Float32Array(n1 / 2), cur = new Float32Array(n1 / 2);
  const maxBin1 = Math.min(n1 / 2, Math.round((8000 / sr) * n1));
  for (let f = 0; f < frames1; f++) {
    const o = f * hop1;
    for (let i = 0; i < n1; i++) { re1[i] = ((L[o + i] + R[o + i]) / 2) * w1[i]; im1[i] = 0; }
    fft1(re1, im1);
    let flux = 0;
    for (let b = 1; b < maxBin1; b++) {
      const m = Math.log1p(10 * Math.hypot(re1[b], im1[b]));
      cur[b] = m;
      const d = m - prev[b];
      if (d > 0) flux += d;
    }
    env[f] = flux;
    [prev, cur] = [cur, prev];
    if ((f & 4095) === 0) { onProgress("tempo", (f / frames1) * 100); await tick(); }
  }
  const fr = sr / hop1;
  const curve: { t: number; bpm: number; c: number }[] = [];
  const win = Math.round(20 * fr), wHop = Math.round(10 * fr);
  for (let s = 0; s + win <= env.length; s += wHop) {
    const est = tempoFromEnvelope(env.subarray(s, s + win), fr);
    if (est) curve.push({ t: Math.round(s / fr), bpm: r1(est.bpm), c: r2(est.c) });
  }
  if (!curve.length && env.length > fr * 4) {
    const est = tempoFromEnvelope(env, fr);
    if (est) curve.push({ t: 0, bpm: r1(est.bpm), c: r2(est.c) });
  }
  const good = curve.filter((p) => p.c >= 0.15).map((p) => p.bpm).sort((a, b) => a - b);
  const median = (a: number[]) => (a.length ? a[Math.floor(a.length / 2)] : null);
  const bpmVal = median(good) ?? median(curve.map((p) => p.bpm).sort((a, b) => a - b));
  const bpmConf = curve.length ? r2(curve.reduce((s, p) => s + p.c, 0) / curve.length) : 0;

  // 3) spectral pass B — bands + chroma (~0.37–0.5 s frames)
  onProgress("tonal", 0);
  const n2 = pow2(sr * 0.37), hop2 = n2 / 2;
  const fft2 = makeFft(n2), w2 = hann(n2);
  const re2 = new Float32Array(n2), im2 = new Float32Array(n2);
  const frames2 = Math.max(0, Math.floor((N - n2) / hop2));
  const binHz = sr / n2;
  const lowEnd = Math.round(150 / binHz), midEnd = Math.round(4000 / binHz), nyq = n2 / 2;
  const highBandValid = sr / 2 >= 8000;
  const pcOfBin = new Int8Array(nyq).fill(-1);
  for (let b = 1; b < nyq; b++) {
    const hz = b * binHz;
    if (hz >= 55 && hz <= 2000) pcOfBin[b] = ((Math.round(12 * Math.log2(hz / 440)) % 12) + 12 + 9) % 12;
  }
  const curvePts = shortTerm.length;
  const bandAcc = { low: new Float64Array(curvePts), mid: new Float64Array(curvePts), high: new Float64Array(curvePts), n: new Float64Array(curvePts) };
  const KEYWIN = 30;
  const keyWins = Math.max(1, Math.ceil(duration / KEYWIN));
  const chromaWin = Array.from({ length: keyWins }, () => new Array(12).fill(0));
  const chromaAll = new Array(12).fill(0);
  const TEXWIN = 10;
  const texWins = Math.max(1, Math.ceil(duration / TEXWIN));
  const tex = Array.from({ length: texWins }, () => new Array(15).fill(0));
  for (let f = 0; f < frames2; f++) {
    const o = f * hop2;
    for (let i = 0; i < n2; i++) { re2[i] = ((L[o + i] + R[o + i]) / 2) * w2[i]; im2[i] = 0; }
    fft2(re2, im2);
    let lo = 0, mi = 0, hi = 0;
    const ch = new Array(12).fill(0);
    for (let b = 1; b < nyq; b++) {
      const p = re2[b] * re2[b] + im2[b] * im2[b];
      if (b < lowEnd) lo += p; else if (b < midEnd) mi += p; else hi += p;
      const pc = pcOfBin[b];
      if (pc >= 0) ch[pc] += Math.sqrt(p);
    }
    const t = (o + n2 / 2) / sr;
    const ci = Math.min(curvePts - 1, Math.floor(t / STEP));
    if (ci >= 0) { bandAcc.low[ci] += lo; bandAcc.mid[ci] += mi; bandAcc.high[ci] += hi; bandAcc.n[ci]++; }
    const kw = Math.min(keyWins - 1, Math.floor(t / KEYWIN));
    const tw = Math.min(texWins - 1, Math.floor(t / TEXWIN));
    const tot = lo + mi + hi || 1;
    for (let k = 0; k < 12; k++) { chromaWin[kw][k] += ch[k]; chromaAll[k] += ch[k]; tex[tw][k] += ch[k]; }
    tex[tw][12] += lo / tot; tex[tw][13] += mi / tot; tex[tw][14] += hi / tot;
    if ((f & 1023) === 0) { onProgress("tonal", (f / frames2) * 100); await tick(); }
  }
  const norm = n2 * n2;
  const band = (a: Float64Array) => Array.from(a, (v, i) => (bandAcc.n[i] ? r1(db(v / bandAcc.n[i] / norm)) : -120));
  const globalKey = estimateKey(chromaAll);
  const segments = chromaWin
    .map((c, i) => ({ k: estimateKey(c), t: i * KEYWIN }))
    .filter((x) => x.k)
    .map((x) => ({ t: x.t, camelot: x.k!.camelot, c: r2(Math.max(0, x.k!.r)) }));

  // 4) possible transitions (estimated): tempo jumps, confident key changes, texture novelty peaks
  onProgress("transitions", 0);
  const cand = new Map<number, Set<"tempo" | "key" | "texture">>();
  const add = (t: number, why: "tempo" | "key" | "texture") => {
    const k = Math.round(t / 10) * 10;
    const near = [...cand.keys()].find((x) => Math.abs(x - k) <= 20);
    const key = near ?? k;
    if (!cand.has(key)) cand.set(key, new Set());
    cand.get(key)!.add(why);
  };
  for (let i = 1; i < curve.length; i++) {
    if (curve[i].c >= 0.15 && curve[i - 1].c >= 0.15 && Math.abs(curve[i].bpm - curve[i - 1].bpm) > 1.2) add(curve[i].t, "tempo");
  }
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].c >= 0.6 && segments[i - 1].c >= 0.6 && segments[i].camelot !== segments[i - 1].camelot) add(segments[i].t, "key");
  }
  const unit = (v: number[]) => { const s = Math.hypot(...v) || 1; return v.map((x) => x / s); };
  const texN = tex.map(unit);
  const nov: number[] = [];
  for (let i = 3; i + 3 <= texN.length; i++) {
    const a = new Array(15).fill(0), b = new Array(15).fill(0);
    for (let j = i - 3; j < i; j++) texN[j].forEach((v, k) => (a[k] += v));
    for (let j = i; j < i + 3; j++) texN[j].forEach((v, k) => (b[k] += v));
    const ua = unit(a), ub = unit(b);
    nov.push(1 - ua.reduce((s, v, k) => s + v * ub[k], 0));
  }
  if (nov.length > 5) {
    const m = nov.reduce((s, v) => s + v, 0) / nov.length;
    const sd = Math.sqrt(nov.reduce((s, v) => s + (v - m) ** 2, 0) / nov.length);
    let last = -1e9;
    nov.forEach((v, i) => {
      const t = (i + 3) * TEXWIN;
      if (v > m + 1.5 * sd && v >= (nov[i - 1] ?? 0) && v >= (nov[i + 1] ?? 0) && t - last >= 60) { add(t, "texture"); last = t; }
    });
  }
  const transitions = [...cand.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, rs]) => ({ t, reasons: [...rs], c: r2(Math.min(1, 0.3 * rs.size + (rs.has("key") || rs.has("tempo") ? 0.2 : 0))) }));
  onProgress("done", 100);

  return {
    version: ANALYZER_VERSION,
    durationSec: Math.round(duration),
    sampleRate: sr,
    channels: nch,
    measured: {
      peakDbfs: r1(20 * Math.log10(peak || 1e-6)),
      clipEvents,
      clipTimes,
      integratedLufs: integrated,
      lra,
      stereoCorrelation: nch > 1 && sLL > 0 && sRR > 0 ? r2(sLR / Math.sqrt(sLL * sRR)) : null,
      curveStep: STEP,
      shortTerm,
      bands: { low: band(bandAcc.low), mid: band(bandAcc.mid), high: band(bandAcc.high) },
      highBandValid,
      gaps,
    },
    estimated: {
      bpm: { value: bpmVal, confidence: bpmConf, min: good.length ? good[0] : null, max: good.length ? good[good.length - 1] : null, curve },
      key: { camelot: globalKey?.camelot ?? null, name: globalKey?.name ?? null, confidence: globalKey ? r2(Math.max(0, globalKey.r)) : 0, segments },
      transitions,
    },
  };
}
