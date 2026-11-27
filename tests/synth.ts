/** Deterministic test signals for the analyzer (no randomness except a seeded LCG). */
export function synthMix(opts: { sr: number; seconds: number; bpm: number; bpm2?: number; switchAt?: number; clipAt?: number[]; gapAt?: number }) {
  const { sr, seconds } = opts;
  const n = Math.floor(sr * seconds);
  const L = new Float32Array(n), R = new Float32Array(n);
  // A minor triad (A3, C4, E4) as a pad, and kick clicks on each beat
  const pad = [220, 261.63, 329.63];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  let beatPhase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const bpm = opts.switchAt && t >= opts.switchAt ? opts.bpm2 ?? opts.bpm : opts.bpm;
    const prev = beatPhase;
    beatPhase += bpm / 60 / sr;
    if (Math.floor(beatPhase) !== Math.floor(prev)) beatPhase = Math.floor(beatPhase); // new beat
    const sinceBeat = (beatPhase - Math.floor(beatPhase)) * (60 / bpm);
    const kick = Math.exp(-sinceBeat * 30) * Math.sin(2 * Math.PI * 60 * sinceBeat) * 0.6;
    const hat = sinceBeat > 0.24 && sinceBeat < 0.26 ? rnd() * 0.15 : 0;
    let p = 0;
    for (const f of pad) p += Math.sin(2 * Math.PI * f * t) * 0.07;
    const v = kick + hat + p;
    L[i] = v; R[i] = v * 0.95;
  }
  if (opts.gapAt != null) for (let i = Math.floor(opts.gapAt * sr); i < Math.floor((opts.gapAt + 4) * sr) && i < n; i++) { L[i] = 0; R[i] = 0; }
  for (const c of opts.clipAt ?? []) for (let i = Math.floor(c * sr); i < Math.floor(c * sr) + 20; i++) { L[i] = 1; R[i] = 1; }
  return [L, R];
}
