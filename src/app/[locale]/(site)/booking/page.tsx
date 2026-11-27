import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, Empty, Kicker } from "@/components/ui";
import { BookingWizard } from "@/components/booking/wizard";
import { getLessons, getPublishedInstructors } from "@/lib/data";
import { intlLocale, lp, tr } from "@/lib/i18n/config";
import { money } from "@/lib/i18n/format";
import { getSessionUser } from "@/lib/auth/session";

export async function generateMetadata({ params }: PageProps<"/[locale]/booking">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/booking", t.booking.title, t.pages.lessons.lead);
}

export default async function Booking({ params, searchParams }: PageProps<"/[locale]/booking">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const [lessons, instructors, user] = await Promise.all([getLessons().catch(() => []), getPublishedInstructors().catch(() => []), getSessionUser().catch(() => null)]);
  const b = t.booking;
  return (
    <Container className="max-w-5xl pt-10 md:pt-14">
      <Kicker>Booking</Kicker>
      <h1 className="mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.035em]">{b.title}</h1>
      <p className="mt-3 text-sm text-stone">{b.cancelPolicy}</p>
      <div className="mt-10">
        {!lessons.length || !instructors.length ? (
          <Empty title={b.noSlots} />
        ) : (
          <BookingWizard
            lessons={lessons.map((l) => ({ id: l.id, slug: l.slug, mode: l.mode, title: tr(l.title, locale), desc: tr(l.description, locale), duration: l.duration_min, price: money(l.price_satang, locale, l.currency), provisional: l.is_provisional }))}
            instructors={instructors.map((i) => ({ id: i.id, slug: i.slug, name: i.dj_name, genres: i.genres, languages: i.languages, placeholder: i.is_placeholder }))}
            locale={locale}
            intl={intlLocale[locale]}
            signedIn={Boolean(user)}
            initialLesson={typeof sp.lesson === "string" ? sp.lesson : undefined}
            initialInstructor={typeof sp.instructor === "string" ? sp.instructor : undefined}
            defaultLevel={user?.experience}
            loginHref={lp(locale, "/login")}
            registerHref={lp(locale, "/register")}
            reviewBase={lp(locale, "/booking/review")}
            labels={{
              steps: b.steps, chooseLesson: b.chooseLesson, inPerson: b.inPerson, online: b.online, instructor: b.instructor,
              chooseTime: b.chooseTime, genre: b.genre, level: b.level, levels: b.levels, equipment: b.equipment,
              equipmentOptions: b.equipmentOptions, language: b.language, notes: b.notes, continue: t.common.continue,
              back: t.common.back, loginRequired: b.loginRequired, login: t.nav.login, register: t.auth.register,
              slotTaken: b.slotTaken, generic: t.errors.generic, minutes: t.common.minutes, provisional: t.status.provisional,
              placeholder: t.status.placeholder, selected: b.chooseTime, noSlots: b.noSlots, timezone: b.timezone,
              detected: b.detected, bangkokTime: t.common.bangkokTime, yourTime: t.common.yourTime, loading: t.common.loading,
              tooMany: t.errors.rateLimited,
            }}
          />
        )}
      </div>
    </Container>
  );
}
