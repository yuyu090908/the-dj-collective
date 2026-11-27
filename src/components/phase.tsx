import { ArrowRight, Check, Plug } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n";
import { fmt } from "@/lib/i18n/format";
import { phaseFeature } from "@/lib/phase-content";
import { L, Tag } from "./ui";

export function PhasePanel({
  feature, locale, t, available = [], children, includeBooking = true,
}: {
  feature: string;
  locale: Locale;
  t: Dict;
  available?: { href: string; label: string }[];
  children?: React.ReactNode;
  includeBooking?: boolean;
}) {
  const f = phaseFeature(feature, locale);
  if (!f) return null;
  const phaseName = t.phase.phases[f.phase as 2 | 3 | 4];
  return (
    <section aria-labelledby="phase-title" className="overflow-hidden rounded-[8px] border border-line bg-ink-2">
      <div className="border-b border-line p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag kind="phase">{fmt(t.phase.badge, { n: f.phase })} · {phaseName}</Tag>
        </div>
        <h1 id="phase-title" className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em]">
          {f.title}
        </h1>
        <p className="mt-3 max-w-2xl text-ivory/85">{f.lead}</p>
        <p className="mt-4 max-w-2xl text-sm text-stone">{fmt(t.phase.title, { n: f.phase })}. {t.phase.lead}</p>
      </div>
      {children}
      <div className="grid gap-px bg-line md:grid-cols-2">
        <div className="bg-ink-2 p-5 md:p-8">
          <p className="kicker mb-4">{t.phase.planned}</p>
          <ul className="space-y-3">
            {f.planned.map((p) => (
              <li key={p} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-stone" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          {f.needs.length > 0 && (
            <div className="mt-6 rounded-[6px] border border-err/40 p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-err">
                <Plug size={13} aria-hidden="true" /> {t.status.notConnected}
              </p>
              <ul className="space-y-1 font-mono text-xs text-ivory/80">
                {f.needs.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>
        <div className="bg-ink-2 p-5 md:p-8">
          <p className="kicker mb-4">{t.phase.meanwhile}</p>
          <ul className="divide-y divide-line">
            {[...available, ...(includeBooking ? [{ href: "/booking", label: t.nav.book }] : [])].map((a) => (
              <li key={a.href}>
                <L locale={locale} href={a.href} className="group flex min-h-12 items-center gap-3 text-sm">
                  <Check size={15} className="text-lime" aria-hidden="true" />
                  {a.label}
                  <ArrowRight size={15} className="ml-auto text-stone group-hover:text-lime" aria-hidden="true" />
                </L>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
