"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Mic, MonitorUp } from "lucide-react";

type Labels = { start: string; stop: string; camera: string; mic: string; screen: string; ok: string; denied: string; level: string; tip: string };

export function DeviceCheck({ labels }: { labels: Labels }) {
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [level, setLevel] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!stream) return;
    if (video.current) video.current.srcObject = stream;
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Uint8Array(an.fftSize);
    let raf = 0;
    const tick = () => {
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      setLevel(Math.min(1, peak / 100));
      raf = requestAnimationFrame(tick);
    };
    tick();
    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => {});
    return () => {
      cancelAnimationFrame(raf);
      ctx.close();
    };
  }, [stream]);

  async function start() {
    setErr(null);
    try {
      // Music-friendly capture: no echo cancellation / noise suppression / AGC
      const s = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      setStream(s);
    } catch {
      setErr(labels.denied);
    }
  }
  function stop() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setLevel(0);
  }
  async function share() {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (screen.current) screen.current.srcObject = s;
      setShared(true);
      s.getVideoTracks()[0].addEventListener("ended", () => setShared(false));
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[8px] border border-line bg-ink-2 p-5">
        <div className="relative aspect-video overflow-hidden rounded-[6px] border border-line bg-ink">
          <video ref={video} autoPlay playsInline muted className="h-full w-full object-cover" />
          {!stream && <Camera className="absolute inset-0 m-auto text-stone" size={32} aria-hidden="true" />}
        </div>
        <div className="mt-4">
          <p className="kicker mb-2 flex items-center gap-2"><Mic size={13} aria-hidden="true" /> {labels.level}</p>
          <div className="h-3 overflow-hidden rounded-[3px] bg-ink" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)} aria-label={labels.level}>
            <div className="h-full bg-lime transition-[width] duration-75" style={{ width: `${level * 100}%` }} />
          </div>
        </div>
        {err && <p role="alert" className="mt-3 text-sm text-err">{err}</p>}
        {stream && <p className="mt-3 text-sm text-ok">{labels.ok}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          {!stream ? (
            <button onClick={start} className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-lime px-5 font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
              {labels.start}
            </button>
          ) : (
            <button onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-ivory/70 px-5 font-display text-sm font-semibold uppercase tracking-[0.08em]">
              {labels.stop}
            </button>
          )}
          <button onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-line px-5 font-display text-sm font-semibold uppercase tracking-[0.08em]">
            <MonitorUp size={16} aria-hidden="true" /> {labels.screen}
          </button>
        </div>
        {devices.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-stone">
            {devices.filter((d) => d.kind !== "audiooutput").map((d) => <li key={d.deviceId + d.kind}>{d.kind === "videoinput" ? labels.camera : labels.mic}: {d.label || "—"}</li>)}
          </ul>
        )}
      </div>
      <div className="rounded-[8px] border border-line bg-ink-2 p-5">
        <div className="relative aspect-video overflow-hidden rounded-[6px] border border-line bg-ink">
          <video ref={screen} autoPlay playsInline muted className="h-full w-full object-contain" />
          {!shared && <MonitorUp className="absolute inset-0 m-auto text-stone" size={32} aria-hidden="true" />}
        </div>
        <p className="mt-4 text-sm text-stone">{labels.tip}</p>
      </div>
    </div>
  );
}
