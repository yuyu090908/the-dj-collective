/** Analyzer sanity checks on synthesized audio.  npx tsx tests/analyzer.test.ts */
import assert from "node:assert/strict";
import { analyze, camelotCompatible, estimateKey } from "../src/lib/audio/analyze";
import { synthMix } from "./synth";

(async () => {
  let passed = 0;
  const ok = (n: string) => { passed++; console.log("  ✓", n); };
  const sr = 11025;
  const t0 = Date.now();
  const a = await analyze(synthMix({ sr, seconds: 180, bpm: 124, clipAt: [30, 100, 150], gapAt: 60 }), sr);
  console.log("  (analysis of 180 s took", Date.now() - t0, "ms)");
  console.log("  bpm", a.estimated.bpm.value, "conf", a.estimated.bpm.confidence, "key", a.estimated.key.camelot, a.estimated.key.name, a.estimated.key.confidence,
    "lufs", a.measured.integratedLufs, "lra", a.measured.lra, "clips", a.measured.clipEvents, "gaps", JSON.stringify(a.measured.gaps), "corr", a.measured.stereoCorrelation);
  assert.ok(a.estimated.bpm.value && Math.abs(a.estimated.bpm.value - 124) < 1, `bpm ≈124 (got ${a.estimated.bpm.value})`); ok("tempo ≈ 124 BPM");
  assert.equal(a.measured.clipEvents, 3); ok("3 clipping runs detected");
  assert.ok(a.measured.clipTimes.every((t, i) => Math.abs(t - [30, 100, 150][i]) < 0.1)); ok("clip timestamps");
  assert.ok(a.measured.gaps.some((g) => Math.abs(g.t - 60) < 1.5 && g.dur >= 3)); ok("silent gap at 60 s");
  assert.ok(a.measured.integratedLufs != null && a.measured.integratedLufs < -5 && a.measured.integratedLufs > -30); ok("integrated loudness in a plausible range");
  assert.ok(a.measured.stereoCorrelation != null && a.measured.stereoCorrelation > 0.95); ok("stereo correlation ≈ 1 for near-mono");
  assert.equal(a.estimated.key.camelot, "8A"); ok("A minor → 8A");

  const b = await analyze(synthMix({ sr, seconds: 240, bpm: 122, bpm2: 128, switchAt: 120 }), sr);
  console.log("  tempo curve", b.estimated.bpm.curve.map((p) => p.bpm).join(","), "transitions", JSON.stringify(b.estimated.transitions));
  assert.ok(b.estimated.bpm.min! < 123 && b.estimated.bpm.max! > 127); ok("tempo change 122 → 128 visible in curve");
  assert.ok(b.estimated.transitions.some((x) => x.reasons.includes("tempo") && Math.abs(x.t - 120) <= 20)); ok("transition candidate near 120 s");

  // pure sine 1 kHz at -6 dBFS mono: BS.1770 gives ≈ -6.0 LUFS-ish (K-weighting ≈ +0.7 dB at 1 kHz, -0.691 offset)
  const s = new Float32Array(sr * 20).map((_, i) => 0.5 * Math.sin((2 * Math.PI * 1000 * i) / sr));
  const c = await analyze([s], sr);
  console.log("  1 kHz sine -6 dBFS →", c.measured.integratedLufs, "LUFS, peak", c.measured.peakDbfs);
  assert.ok(Math.abs(c.measured.integratedLufs! - -9.0) < 1.2); ok("1 kHz sine loudness matches BS.1770 reference (≈ -9 LUFS mono)");
  assert.equal(c.measured.stereoCorrelation, null); ok("mono → no stereo correlation");

  assert.equal(camelotCompatible("8A", "8A"), "same");
  assert.equal(camelotCompatible("8A", "9A"), "adjacent");
  assert.equal(camelotCompatible("12A", "1A"), "adjacent");
  assert.equal(camelotCompatible("8A", "8B"), "relative");
  assert.equal(camelotCompatible("8A", "3B"), "clash"); ok("camelot compatibility rules");
  const cMaj = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0].map((x, i) => x + ([0, 2, 5, 9, 11].includes(i) ? 0.3 : 0));
  assert.equal(estimateKey(cMaj)?.camelot, "8B"); ok("C major chroma → 8B");
  console.log(`analyzer: ${passed} checks passed`);
})().catch((e) => { console.error(e); process.exit(1); });
