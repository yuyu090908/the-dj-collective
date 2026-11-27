"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileAudio } from "lucide-react";
import { analyze } from "@/lib/audio/analyze";
import { saveAnalysisAction } from "@/lib/mixlab-actions";
import { lp, type Locale } from "@/lib/i18n/config";
import { fmt } from "@/lib/i18n/format";
import type { MixT } from "@/lib/i18n/p2/mix";
import { Alert, btn, cx, inputCls } from "../ui";

const EXT_MIME: Record<string, string> = { mp3: "audio/mpeg", wav: "audio/wav", aif: "audio/aiff", aiff: "audio/aiff", m4a: "audio/mp4", mp4: "audio/mp4" };
export const ACCEPT = ".mp3,.wav,.aif,.aiff,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/mp4,audio/x-m4a";

export function mimeOf(f: File): string | null {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const known = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/aiff", "audio/x-aiff", "audio/mp4", "audio/x-m4a"];
  if (known.includes(f.type)) return f.type;
  return EXT_MIME[ext] ?? null;
}

export async function sha256(buf: ArrayBuffer) {
  const d = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Duration from metadata without decoding the whole file. */
function probeDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const a = new Audio();
    const done = (v: number | null) => { URL.revokeObjectURL(url); resolve(v); };
    a.preload = "metadata";
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? a.duration : null);
    a.onerror = () => done(null);
    a.src = url;
    setTimeout(() => done(null), 8000);
  });
}

/** Pick an analysis sample rate so the decoded audio fits in memory (≈ 50 M samples per channel). */
export const pickRate = (sec: number) => Math.max(8000, Math.min(22050, Math.floor(50e6 / Math.max(1, sec))));

export function MixAnalyzer({ locale, s, limits }: {
  locale: Locale; s: MixT;
  limits: { maxMb: number; maxMin: number; left: number; total: number; browserMaxMin: number };
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<{ k: string; pct: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const cancelled = useRef(false);
  const busy = stage !== null;
  const maxMin = Math.min(limits.maxMin, limits.browserMaxMin);

  const choose = (f: File | null) => {
    setErr(null);
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 120));
  };

  const run = async () => {
    if (!file) return;
    setErr(null);
    cancelled.current = false;
    const mime = mimeOf(file);
    if (!mime) return setErr("unsupported");
    if (limits.left <= 0) return setErr("quota");
    if (file.size > limits.maxMb * 1024 * 1024) return setErr("tooLarge");
    try {
      setStage({ k: "reading", pct: 0 });
      const dur = await probeDuration(file);
      if (dur != null && dur > limits.browserMaxMin * 60 + 30) return void (setStage(null), setErr("browserLimit"));
      if (dur != null && dur > limits.maxMin * 60 + 30) return void (setStage(null), setErr("tooLong"));
      const buf = await file.arrayBuffer();
      const hash = await sha256(buf);
      setStage({ k: "decoding", pct: 0 });
      const sr = pickRate(dur ?? 60 * 60);
      let audio: AudioBuffer;
      try {
        audio = await new OfflineAudioContext(2, 1, sr).decodeAudioData(buf);
      } catch {
        setStage(null);
        return setErr("decode");
      }
      if (audio.duration > limits.browserMaxMin * 60 + 30) return void (setStage(null), setErr("browserLimit"));
      if (audio.duration > limits.maxMin * 60 + 30) return void (setStage(null), setErr("tooLong"));
      const chans = Array.from({ length: Math.min(2, audio.numberOfChannels) }, (_, i) => audio.getChannelData(i));
      const result = await analyze(chans, audio.sampleRate, (k, pct) => {
        if (cancelled.current) throw new Error("cancelled");
        setStage({ k, pct });
      });
      setStage({ k: "saving", pct: 100 });
      const r = await saveAnalysisAction({ name: file.name, size: file.size, mime, sha256: hash, title: title.trim() || file.name }, result);
      if (!r.ok) { setStage(null); return setErr(r.error); }
      setStage({ k: "done", pct: 100 });
      router.push(lp(locale, `/app/mix-lab/${r.id}`));
    } catch (e) {
      setStage(null);
      if ((e as Error).message !== "cancelled") setErr("generic");
    }
  };

  return (
    <div className="space-y-4" data-testid="mix-analyzer">
      <label className={cx("flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-line px-4 py-6 text-center hover:border-ivory/40", busy && "pointer-events-none opacity-60")}>
        <FileAudio aria-hidden className="size-6 text-stone" />
        <span className="font-medium">{file ? file.name : s.pickFile}</span>
        <span className="text-xs text-stone">{file ? `${(file.size / 1048576).toFixed(1)} MB` : s.accepts}</span>
        <input type="file" accept={ACCEPT} className="sr-only" data-testid="mix-file" disabled={busy} onChange={(e) => choose(e.target.files?.[0] ?? null)} />
      </label>
      <p className="text-xs text-stone tnum">{fmt(s.limits, { mb: limits.maxMb, min: maxMin, left: Math.max(0, limits.left), total: limits.total })}</p>
      <label className="block">
        <span className="mb-1.5 block text-sm">{s.titleLabel}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={s.titlePh} className={inputCls} disabled={busy} name="title" />
      </label>
      {err && <Alert kind="error">{s.errors[err] ?? s.errors.generic}</Alert>}
      {stage && (
        <div aria-live="polite" data-testid="mix-progress">
          <div className="flex justify-between text-sm"><span>{s.stages[stage.k] ?? stage.k}</span><span className="tnum text-stone">{Math.round(stage.pct)}%</span></div>
          <div className="mt-2 h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-lime transition-[width] motion-reduce:transition-none" style={{ width: `${stage.pct}%` }} /></div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn("primary", "min-h-12")} disabled={!file || busy || limits.left <= 0} onClick={run} data-testid="mix-analyze">{s.analyze}</button>
        {busy && stage?.k !== "saving" && <button type="button" className={btn("secondary", "min-h-12")} onClick={() => (cancelled.current = true)}>{s.cancel}</button>}
      </div>
    </div>
  );
}
