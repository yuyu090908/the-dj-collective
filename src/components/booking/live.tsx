"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function HoldCountdown({ until, label }: { until: string; label: string }) {
  const [left, setLeft] = useState(() => Math.max(0, new Date(until).getTime() - Date.now()));
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      const l = Math.max(0, new Date(until).getTime() - Date.now());
      setLeft(l);
      if (l === 0) {
        clearInterval(id);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [until, router]);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <p className="flex items-center gap-3 text-sm" role="timer" aria-live="off">
      <span className="tnum font-display text-2xl font-semibold text-lime">{m}:{String(s).padStart(2, "0")}</span>
      <span className="text-stone">{label}</span>
    </p>
  );
}

/** Re-renders the server page every few seconds while waiting for a webhook. */
export function AutoRefresh({ every = 3000, max = 60 }: { every?: number; max?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= max) clearInterval(id);
    }, every);
    return () => clearInterval(id);
  }, [router, every, max]);
  return null;
}
