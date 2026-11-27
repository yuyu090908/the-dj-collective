/**
 * Rule-based mix scores. Every score is a published formula over MEASURED / ESTIMATED values —
 * there is no model judgement here. A score is `null` when the input is not reliable enough.
 * The formulas are shown to the user next to each score (see FORMULA keys in the mix-lab dictionary).
 */
import { camelotCompatible, type Analysis } from "./analyze";

export type ScoreKey = "clipping" | "loudness" | "tempo" | "harmonic" | "flow";
export type Scores = { [K in ScoreKey]: number | null } & { overall: number | null; inputs: Record<string, number> };
/** Advice is stored as keys + params; the wording lives in the dictionary so it is translated, not generated. */
export type Advice = { key: string; params: Record<string, string | number>; at?: number[]; module?: { level: number; order: number } };

const clamp = (x: number) => Math.max(0, Math.min(100, Math.round(x)));

export function scoreAnalysis(a: Analysis): { scores: Scores; advice: Advice[] } {
  const minutes = Math.max(1, a.durationSec / 60);
  const m = a.measured, e = a.estimated;

  // 1) clipping: −10 per clip event per 10 minutes
  const clipsPer10 = (m.clipEvents / minutes) * 10;
  const clipping = clamp(100 - 10 * clipsPer10);

  // 2) loudness consistency: full marks up to LRA 6 LU, −8 per LU above
  const loudness = m.lra == null ? null : clamp(100 - 8 * Math.max(0, m.lra - 6));

  // 3) tempo stability: count jumps > 3 % between neighbouring confident windows; −15 each
  const conf = e.bpm.curve.filter((p) => p.c >= 0.15);
  let jumps = 0;
  const jumpTimes: number[] = [];
  for (let i = 1; i < conf.length; i++) {
    const a1 = conf[i - 1].bpm, b1 = conf[i].bpm;
    // a half/double-time reading is not a jump
    const ratio = Math.max(a1, b1) / Math.min(a1, b1);
    if (Math.abs(ratio - 2) < 0.06) continue;
    if (ratio > 1.03) { jumps++; jumpTimes.push(conf[i].t); }
  }
  const tempo = e.bpm.confidence < 0.3 || conf.length < 3 ? null : clamp(100 - 15 * jumps);

  // 4) harmonic flow: share of key changes (confidence ≥ 0.5) that are Camelot-compatible
  const segs = e.key.segments.filter((s) => s.c >= 0.5);
  let changes = 0, clashes = 0;
  const clashTimes: number[] = [];
  for (let i = 1; i < segs.length; i++) {
    if (segs[i].camelot === segs[i - 1].camelot) continue;
    changes++;
    if (camelotCompatible(segs[i - 1].camelot, segs[i].camelot) === "clash") { clashes++; clashTimes.push(segs[i].t); }
  }
  const harmonic = changes < 2 ? null : clamp(100 * (1 - clashes / changes));

  // 5) flow: −25 per silent gap (≥ 2 s) inside the mix
  const flow = clamp(100 - 25 * m.gaps.length);

  const parts = [clipping, loudness, tempo, harmonic, flow].filter((x): x is number => x != null);
  const overall = parts.length ? Math.round(parts.reduce((s, x) => s + x, 0) / parts.length) : null;

  const advice: Advice[] = [];
  if (m.clipEvents > 0) advice.push({ key: "clip", params: { n: m.clipEvents }, at: m.clipTimes.slice(0, 10), module: { level: 2, order: 3 } });
  if (m.peakDbfs > -0.3 && m.clipEvents === 0) advice.push({ key: "nearPeak", params: { p: m.peakDbfs }, module: { level: 2, order: 3 } });
  if (m.lra != null && m.lra > 8) advice.push({ key: "lraHigh", params: { lra: m.lra }, module: { level: 2, order: 2 } });
  if (m.integratedLufs != null && m.integratedLufs < -20) advice.push({ key: "quiet", params: { l: m.integratedLufs }, module: { level: 2, order: 3 } });
  if (jumps > 0) advice.push({ key: "tempoJump", params: { n: jumps }, at: jumpTimes.slice(0, 10), module: { level: 1, order: 5 } });
  if (clashes > 0) advice.push({ key: "keyClash", params: { n: clashes, of: changes }, at: clashTimes.slice(0, 10), module: { level: 3, order: 0 } });
  if (m.gaps.length) advice.push({ key: "gap", params: { n: m.gaps.length }, at: m.gaps.map((g) => g.t).slice(0, 10), module: { level: 2, order: 6 } });
  if (m.stereoCorrelation != null && m.stereoCorrelation < 0.2) advice.push({ key: "phase", params: { c: m.stereoCorrelation } });
  if (e.bpm.confidence < 0.3) advice.push({ key: "lowTempoConf", params: {} });
  if (!advice.some((x) => ["clip", "lraHigh", "tempoJump", "keyClash", "gap"].includes(x.key))) advice.push({ key: "clean", params: {}, module: { level: 3, order: 2 } });

  return {
    scores: { clipping, loudness, tempo, harmonic, flow, overall, inputs: { clipsPer10: Math.round(clipsPer10 * 10) / 10, jumps, changes, clashes, gaps: m.gaps.length } },
    advice,
  };
}
