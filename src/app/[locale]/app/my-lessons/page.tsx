import { nowMs } from "@/lib/time";
import { MapPin, Video } from "lucide-react";
import { memberPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { Empty, L, LinkButton, Tag } from "@/components/ui";
import { tr } from "@/lib/i18n/config";
import { dateTime } from "@/lib/i18n/format";
import { ActionForm } from "@/components/forms";
import { cancelBookingAction } from "@/lib/booking/actions";
import { Reschedule } from "@/components/booking/reschedule";
import { intlLocale } from "@/lib/i18n/config";
import { FREE_CANCEL_HOURS } from "@/lib/booking/slots";

type Row = {
  id: string; starts_at: string; ends_at: string; mode: string; status: string; title: Record<string, string>; dj_name: string;
  meeting_url: string | null; user_timezone: string | null; instructor_id: string; lesson_id: string; studio_name: string | null; studio_address: string | null;
};

export default async function MyLessons({ params }: PageProps<"/[locale]/app/my-lessons">) {
  const { locale, t, user } = await memberPage(params);
  const rows = await q<Row>(
    `select b.id, b.starts_at, b.ends_at, b.mode, b.status, l.title, i.dj_name, b.meeting_url, b.user_timezone, b.instructor_id, b.lesson_id,
            s.name studio_name, s.address studio_address
       from bookings b join lessons l on l.id=b.lesson_id join instructors i on i.id=b.instructor_id left join studios s on s.id=b.studio_id
      where b.user_id=$1 and b.status not in ('expired','held') order by b.starts_at desc limit 100`,
    [user.id],
  );
  const now = nowMs();
  const upcoming = rows.filter((r) => new Date(r.ends_at).getTime() > now && ["confirmed", "pending_payment"].includes(r.status)).reverse();
  const past = rows.filter((r) => !upcoming.includes(r));
  const a = t.app;
  const bk = t.booking;
  const statusKind = (s: string) => (s === "confirmed" ? "live" : s === "pending_payment" ? "provisional" : "neutral") as "live";

  const Item = ({ r, actions }: { r: Row; actions: boolean }) => {
    const tz = r.user_timezone || user.timezone;
    const canChange = actions && r.status === "confirmed" && new Date(r.starts_at).getTime() - now >= FREE_CANCEL_HOURS * 3600_000;
    return (
      <li className="rounded-[8px] border border-line bg-ink-2 p-5" data-testid="lesson-item">
        <div className="flex flex-wrap items-center gap-2">
          <Tag kind={statusKind(r.status)}>{bk.statuses[r.status as "confirmed"]}</Tag>
          <span className="flex items-center gap-1 text-xs text-stone">{r.mode === "online" ? <Video size={13} /> : <MapPin size={13} />}{r.mode === "online" ? bk.online : r.studio_name}</span>
        </div>
        <p className="mt-3 tnum font-display text-2xl font-semibold">{dateTime(r.starts_at, locale, tz)}</p>
        {tz !== "Asia/Bangkok" && <p className="text-xs text-stone tnum">{t.common.bangkokTime}: {dateTime(r.starts_at, locale, "Asia/Bangkok")}</p>}
        <p className="mt-1 text-sm text-ivory/80">{tr(r.title, locale)} · {r.dj_name}</p>
        {actions && r.mode === "online" && r.status === "confirmed" && (
          <div className="mt-4 flex flex-wrap gap-3">
            {r.meeting_url ? (
              <a href={r.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-[6px] bg-lime px-4 font-display text-sm font-semibold uppercase text-ink">{a.joinCall}</a>
            ) : (
              <Tag kind="notConnected">{a.callNotConnected}</Tag>
            )}
            <LinkButton locale={locale} href="/device-check" variant="secondary">{a.deviceCheck}</LinkButton>
          </div>
        )}
        {actions && r.mode === "in_person" && r.studio_address && (
          <a className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.studio_address)}`}>{bk.studioMap}</a>
        )}
        {canChange && (
          <div className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-2">
            <Reschedule
              bookingId={r.id} instructorId={r.instructor_id} lessonId={r.lesson_id} locale={locale} intl={intlLocale[locale]}
              labels={{ reschedule: bk.reschedule, confirm: t.common.save, cancel: t.common.cancel, slotTaken: bk.slotTaken, generic: t.errors.generic, noSlots: bk.noSlots, timezone: bk.timezone, detected: bk.detected, bangkokTime: t.common.bangkokTime, yourTime: t.common.yourTime, loading: t.common.loading }}
            />
            <ActionForm action={cancelBookingAction} submit={bk.cancel} variant="danger" msgs={{ ok: bk.cancelled, generic: t.errors.generic, forbidden: t.errors.generic }}>
              <input type="hidden" name="bookingId" value={r.id} />
            </ActionForm>
          </div>
        )}
        {actions && r.status === "confirmed" && !canChange && <p className="mt-3 text-xs text-stone">{bk.cancelPolicy}</p>}
      </li>
    );
  };

  return (
    <>
      <PageTitle kicker={a.items.myLessons} title={a.items.myLessons} action={<LinkButton locale={locale} href="/booking">{a.bookNow}</LinkButton>} />
      <section>
        <h2 className="kicker mb-3">{a.upcoming}</h2>
        {upcoming.length ? <ul className="grid gap-3 lg:grid-cols-2">{upcoming.map((r) => <Item key={r.id} r={r} actions />)}</ul> : <Empty title={a.noLessons}><LinkButton locale={locale} href="/booking" variant="secondary">{a.bookNow}</LinkButton></Empty>}
      </section>
      <section className="mt-10">
        <h2 className="kicker mb-3">{a.past}</h2>
        {past.length ? <ul className="grid gap-3 lg:grid-cols-2">{past.map((r) => <Item key={r.id} r={r} actions={false} />)}</ul> : <p className="text-sm text-stone">{a.noLessons}</p>}
      </section>
      <section className="mt-10 rounded-[8px] border border-line p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-sm font-semibold tracking-[0.12em]">{a.assignments.toUpperCase()} / {a.feedback.toUpperCase()}</h2><Tag kind="phase">Phase 03</Tag></div>
        <p className="mt-2 text-sm text-stone">{t.instructor.humanVsAi} <L locale={locale} href="/courses" className="underline underline-offset-4">{t.nav.courses}</L></p>
      </section>
    </>
  );
}
