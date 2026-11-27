/* eslint-disable @next/next/no-img-element */
import { MapPin, Play } from "lucide-react";
import type { Instructor } from "@/lib/data";
import type { Dict } from "@/lib/i18n";
import { tr, type Locale } from "@/lib/i18n/config";
import { LinkButton, Tag } from "../ui";
import { LogoMark } from "../visuals";

export function InstructorFeature({ locale, t, ins, full = false }: { locale: Locale; t: Dict; ins: Instructor; full?: boolean }) {
  const h = t.home.instructor;
  const verified = (ins.achievements ?? []).filter((a) => a.verified);
  const pending = <span className="text-stone">{h.pending}</span>;
  const row = (label: string, body: React.ReactNode) => (
    <div className="grid gap-1 border-t border-line py-3 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="kicker pt-0.5">{label}</dt>
      <dd className="text-sm">{body}</dd>
    </div>
  );
  return (
    <article className="grid overflow-hidden rounded-[8px] border border-line bg-ink-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative aspect-[4/5] border-b border-line bg-ink lg:aspect-auto lg:min-h-[560px] lg:border-b-0 lg:border-r">
        {ins.photo_url ? (
          <img src={ins.photo_url} alt={ins.dj_name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="gridlines absolute inset-0 grid place-items-center text-ivory/30">
            <div className="flex flex-col items-center gap-3">
              <LogoMark size={72} />
              <span className="kicker">Photo — {h.pending}</span>
            </div>
          </div>
        )}
        {ins.intro_video_url && (
          <a href={ins.intro_video_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-ink/85 px-4 text-sm backdrop-blur">
            <Play size={14} aria-hidden="true" /> {h.video}
          </a>
        )}
      </div>
      <div className="flex flex-col p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {ins.is_placeholder && <Tag kind="placeholder">{t.status.placeholder}</Tag>}
          <span className="inline-flex items-center gap-1 text-sm text-stone">
            <MapPin size={14} aria-hidden="true" /> {h.base} {ins.base_city || "—"}
          </span>
        </div>
        <h3 className="mt-3 font-display text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-[0.92] tracking-[-0.035em]">{ins.dj_name}</h3>
        <p className="mt-4 max-w-xl text-ivory/85">{tr(ins.bio, locale)}</p>
        {ins.is_placeholder && <p className="mt-3 max-w-xl rounded-[6px] border border-dashed border-warn/50 px-3 py-2 text-xs text-warn">{h.placeholderNote}</p>}
        <dl className="mt-6">
          {row(h.genres, (
            <ul className="flex flex-wrap gap-1.5">
              {ins.genres.map((g) => <li key={g} className="rounded-[4px] border border-line px-2 py-1 text-xs">{g}</li>)}
            </ul>
          ))}
          {row(h.languages, ins.languages.length ? ins.languages.join(" · ") : pending)}
          {row(h.credits, verified.length ? (
            <ul className="space-y-1">{verified.map((a, i) => <li key={i}>{a.title}{a.venue ? ` — ${a.venue}` : ""}{a.year ? ` (${a.year})` : ""}</li>)}</ul>
          ) : pending)}
          {row(h.equipment, ins.equipment.length ? ins.equipment.join(" · ") : pending)}
          {row(h.mixes, ins.mix_urls.length ? (
            <ul className="space-y-1">{ins.mix_urls.map((u) => <li key={u}><a className="underline decoration-line underline-offset-4 hover:text-lime" href={u} target="_blank" rel="noopener noreferrer">{u.replace(/^https?:\/\//, "")}</a></li>)}</ul>
          ) : pending)}
          {row(h.social, Object.keys(ins.social ?? {}).length ? (
            <ul className="flex flex-wrap gap-3">{Object.entries(ins.social).filter(([, v]) => v).map(([k, v]) => <li key={k}><a className="capitalize hover:text-lime" href={v} target="_blank" rel="noopener noreferrer">{k}</a></li>)}</ul>
          ) : pending)}
        </dl>
        <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
          <LinkButton locale={locale} href={`/booking?instructor=${ins.slug}`}>{h.book}</LinkButton>
          {!full && <LinkButton locale={locale} href={`/instructors/${ins.slug}`} variant="secondary">{h.profile}</LinkButton>}
        </div>
      </div>
    </article>
  );
}
