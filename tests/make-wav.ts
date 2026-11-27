/** Writes a synthesized 16-bit stereo WAV for e2e tests.  npx tsx tests/make-wav.ts out.wav [seconds] [sr] */
import { writeFileSync } from "node:fs";
import { synthMix } from "./synth";
const [out = "/tmp/test-mix.wav", secs = "150", rate = "22050", bpm2] = process.argv.slice(2);
const sr = Number(rate);
const [L, R] = synthMix({ sr, seconds: Number(secs), bpm: 124, clipAt: [30, 90], gapAt: 60, ...(bpm2 ? { bpm2: Number(bpm2), switchAt: Number(secs) / 2 } : {}) });
const n = L.length, data = Buffer.alloc(n * 4);
for (let i = 0; i < n; i++) {
  data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), i * 4);
  data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), i * 4 + 2);
}
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(sr, 24); h.writeUInt32LE(sr * 4, 28);
h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
writeFileSync(out, Buffer.concat([h, data]));
console.log(out, (data.length / 1e6).toFixed(1), "MB");
