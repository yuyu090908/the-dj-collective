"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type JourneyRec = { kind: string; title: string; href: string; note?: string };

export function Journey({
  options, recs, labels,
}: {
  options: { key: string; label: string }[];
  recs: Record<string, JourneyRec[]>;
  labels: { recommended: string };
}) {
  const [sel, setSel] = useState(options[0].key);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div role="radiogroup" aria-label="Journey" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {options.map((o, i) => {
          const active = o.key === sel;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSel(o.key)}
              className={`group flex min-h-14 items-center gap-4 rounded-[6px] border px-4 text-left transition-colors ${
                active ? "border-lime bg-lime/[0.06]" : "border-line hover:border-stone"
              }`}
            >
              <span className={`kicker w-6 ${active ? "!text-lime" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-base font-medium">{o.label}</span>
              <span className={`ml-auto h-2.5 w-2.5 rounded-full border ${active ? "border-lime bg-lime" : "border-stone"}`} />
            </button>
          );
        })}
      </div>
      <div className="rounded-[8px] border border-line bg-ink-2 p-5 md:p-7" aria-live="polite">
        <p className="kicker mb-5">{labels.recommended}</p>
        <ul className="divide-y divide-line">
          {recs[sel].map((r) => (
            <li key={r.href + r.title}>
              <Link href={r.href} className="group flex min-h-16 items-center gap-4 py-3">
                <span className="w-20 shrink-0 font-display text-[0.6875rem] uppercase tracking-[0.12em] text-stone">{r.kind}</span>
                <span className="font-display text-lg font-medium leading-tight group-hover:text-lime">
                  {r.title}
                  {r.note && <span className="ml-2 align-middle text-xs font-normal text-stone">{r.note}</span>}
                </span>
                <ArrowUpRight size={18} className="ml-auto shrink-0 text-stone group-hover:text-lime" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Background video that never plays when the user prefers reduced motion. Always muted. */
export function HeroVideo({ src, mobileSrc, poster }: { src: string; mobileSrc?: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) v.pause();
    else v.play().catch(() => {});
  }, []);
  if (!ok) return null;
  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster || undefined}
      onError={() => setOk(false)}
      aria-hidden="true"
    >
      {mobileSrc && <source src={mobileSrc} media="(max-width: 767px)" />}
      <source src={src} />
    </video>
  );
}
