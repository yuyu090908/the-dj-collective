import { Clock, MapPin, Video } from "lucide-react";
import type { Lesson, Studio } from "@/lib/data";
import type { Dict } from "@/lib/i18n";
import { tr, type Locale } from "@/lib/i18n/config";
import { money } from "@/lib/i18n/format";
import { LinkButton, Tag } from "../ui";

export function LessonCards({ lessons, locale, t }: { lessons: Lesson[]; locale: Locale; t: Dict }) {
  const p = t.pages.lessons;
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {lessons.map((l) => (
        <li key={l.id} className="flex flex-col rounded-[8px] border border-line bg-ink-2 p-5 md:p-6">
          <div className="flex items-center gap-2 text-stone">
            {l.mode === "online" ? <Video size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}
            <span className="kicker">{l.mode === "online" ? p.online : p.inPerson}</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold uppercase leading-tight tracking-tight">{tr(l.title, locale)}</h3>
          <p className="mt-2 text-sm text-stone">{tr(l.description, locale)}</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="kicker">{p.duration}</dt>
              <dd className="mt-1 flex items-center gap-1 tnum"><Clock size={13} aria-hidden="true" /> {l.duration_min} {t.common.minutes}</dd>
            </div>
            <div>
              <dt className="kicker">{p.price}</dt>
              <dd className="mt-1 tnum font-display text-lg font-semibold">{money(l.price_satang, locale, l.currency)}</dd>
            </div>
            <div>
              <dt className="kicker">{p.levels}</dt>
              <dd className="mt-1">{l.levels.map((x) => t.booking.levels[x as "beginner"]).join(" / ")}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {l.is_provisional ? <Tag kind="provisional">{t.status.provisional} — {t.booking.priceProvisional}</Tag> : <span />}
            <LinkButton locale={locale} href={`/booking?lesson=${l.slug}`}>{p.book}</LinkButton>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StudioBlock({ studio, locale, t }: { studio: Studio | null; locale: Locale; t: Dict }) {
  const p = t.pages.lessons;
  const q = studio?.map_query || studio?.address;
  return (
    <div className="grid overflow-hidden rounded-[8px] border border-line md:grid-cols-2">
      <div className="p-5 md:p-8">
        <p className="kicker">{p.studioInfo}</p>
        <h3 className="mt-3 font-display text-2xl font-semibold uppercase">{studio?.name ?? "Bangkok Studio"}</h3>
        {studio?.is_placeholder && <Tag kind="placeholder" className="mt-3">{t.status.placeholder}</Tag>}
        <p className="mt-4 text-sm text-ivory/85">{studio?.address || p.addressPending}</p>
        {tr(studio?.access_notes, locale) && <p className="mt-2 text-sm text-stone">{tr(studio?.access_notes, locale)}</p>}
        {studio?.equipment?.length ? <p className="mt-4 text-sm">{studio.equipment.join(" · ")}</p> : null}
      </div>
      <div className="relative min-h-64 border-t border-line bg-ink md:border-l md:border-t-0">
        {q ? (
          <iframe
            title={t.booking.studioMap}
            className="absolute inset-0 h-full w-full grayscale invert-[0.9]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}
          />
        ) : (
          <div className="gridlines absolute inset-0 grid place-items-center p-6 text-center">
            <p className="max-w-xs text-sm text-stone">{p.mapPending}</p>
          </div>
        )}
      </div>
    </div>
  );
}
