"use client";

import { useEffect, useRef, useState } from "react";
import { FileAudio } from "lucide-react";
import { ACCEPT, sha256 } from "./analyzer";
import { mmss } from "./fmt";
import { Alert, cx } from "../ui";

export type Marker = { t: number; label: string; kind: "clip" | "transition" | "gap" | "advice" };
const dot: Record<Marker["kind"], string> = { clip: "bg-err", transition: "bg-lime", gap: "bg-warn", advice: "bg-ivory" };

/** Plays the user's local copy of the analysed file (never uploaded). Markers seek when a file is loaded. */
export function MixPlayer({ hash, markers, labels }: { hash: string; markers: Marker[]; labels: { hdr: string; body: string; pick: string; mismatch: string } }) {
  const [url, setUrl] = useState<string | null>(null);
  const [bad, setBad] = useState(false);
  const [checking, setChecking] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const open = async (f: File | null) => {
    if (!f) return;
    setBad(false);
    setChecking(true);
    const h = await sha256(await f.arrayBuffer());
    setChecking(false);
    if (h !== hash) return setBad(true);
    setUrl(URL.createObjectURL(f));
  };
  const seek = (t: number) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = Math.max(0, t - 2);
    void a.play().catch(() => {});
  };

  return (
    <section className="rounded-[8px] border border-line p-5" data-testid="mix-player">
      <h2 className="kicker mb-2">{labels.hdr}</h2>
      {!url ? (
        <>
          <p className="mb-3 text-sm text-stone">{labels.body}</p>
          <label className={cx("inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[6px] border border-line px-4 text-sm hover:border-ivory/40", checking && "opacity-60")}>
            <FileAudio aria-hidden className="size-4" />{checking ? "…" : labels.pick}
            <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => open(e.target.files?.[0] ?? null)} />
          </label>
          {bad && <div className="mt-3"><Alert kind="error">{labels.mismatch}</Alert></div>}
        </>
      ) : (
        <audio ref={audio} src={url} controls className="w-full" />
      )}
      {markers.length > 0 && (
        <ul className="mt-4 max-h-72 divide-y divide-line overflow-y-auto text-sm">
          {markers.map((m, i) => (
            <li key={i}>
              <button type="button" disabled={!url} onClick={() => seek(m.t)}
                className="flex min-h-11 w-full items-center gap-3 px-1 text-left enabled:hover:bg-ink-2 disabled:cursor-default">
                <span className={cx("size-2 shrink-0 rounded-full", dot[m.kind])} aria-hidden />
                <span className="w-16 shrink-0 tnum text-stone">{mmss(m.t)}</span>
                <span>{m.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
