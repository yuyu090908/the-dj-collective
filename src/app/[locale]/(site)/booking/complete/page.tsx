import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { pageCtx } from "@/lib/i18n/server";
import { requireUser } from "@/lib/guards";
import { expireStaleHolds, getBookingForUser } from "@/lib/booking/service";
import { demoPayAction } from "@/lib/booking/actions";
import { Alert, Button, Container, LinkButton } from "@/components/ui";
import { Steps } from "@/components/booking/wizard";
import { AutoRefresh } from "@/components/booking/live";
import { tr } from "@/lib/i18n/config";
import { dateTime } from "@/lib/i18n/format";
import { services } from "@/lib/env";

export const metadata = { robots: { index: false } };

export default async function Complete({ params, searchParams }: PageProps<"/[locale]/booking/complete">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const id = typeof sp.b === "string" ? sp.b : "";
  const user = await requireUser(locale, `/booking/complete?b=${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  await expireStaleHolds();
  const b = await getBookingForUser(id, user.id);
  if (!b) notFound();
  const bk = t.booking;
  const tz = b.user_timezone || user.timezone;
  const confirmed = b.status === "confirmed" || b.status === "completed";
  const pending = b.status === "pending_payment" || b.status === "held";
  const demo = sp.demo === "1" && services.demoPayments && b.status === "pending_payment";

  return (
    <Container className="max-w-3xl pt-10 md:pt-14">
      <Steps steps={bk.steps} current={confirmed ? 4 : 3} />
      <div className="mt-12" data-testid="booking-status" data-status={b.status}>
        {confirmed ? (
          <>
            <CheckCircle2 size={40} className="text-lime" aria-hidden="true" />
            <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight">{bk.confirmed}</h1>
            <p className="mt-3 text-ivory/85">{b.mode === "online" ? bk.confirmedOnlineLead : bk.confirmedLead}</p>
          </>
        ) : pending ? (
          <>
            <Clock size={40} className="text-warn" aria-hidden="true" />
            <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight">{bk.pendingTitle}</h1>
            <p className="mt-3 text-ivory/85">{bk.pendingLead}</p>
            {!demo && b.status === "pending_payment" && <AutoRefresh />}
          </>
        ) : (
          <>
            <XCircle size={40} className="text-err" aria-hidden="true" />
            <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight">{bk.statuses[b.status as "expired"] ?? bk.failed}</h1>
            <p className="mt-3 text-ivory/85">{bk.failedLead}</p>
          </>
        )}
      </div>

      <dl className="mt-8 rounded-[8px] border border-line p-5 text-sm">
        <div className="flex justify-between py-1"><dt className="text-stone">{bk.chooseLesson}</dt><dd>{tr(b.lesson_title, locale)}</dd></div>
        <div className="flex justify-between py-1"><dt className="text-stone">{t.common.yourTime}</dt><dd className="tnum">{dateTime(b.starts_at, locale, tz)}</dd></div>
        <div className="flex justify-between py-1"><dt className="text-stone">{t.common.bangkokTime}</dt><dd className="tnum">{dateTime(b.starts_at, locale, "Asia/Bangkok")}</dd></div>
        <div className="flex justify-between py-1"><dt className="text-stone">{t.common.status}</dt><dd>{bk.statuses[b.status as "held"]}</dd></div>
      </dl>

      {demo && (
        <form action={demoPayAction} className="mt-6 space-y-3">
          <Alert kind="warn">{bk.demoNote}</Alert>
          <input type="hidden" name="bookingId" value={b.id} />
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" data-testid="demo-pay">{bk.payDemo}</Button>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {confirmed ? (
          <LinkButton locale={locale} href="/app/my-lessons">{bk.myLessons}</LinkButton>
        ) : !pending ? (
          <LinkButton locale={locale} href="/booking">{bk.title}</LinkButton>
        ) : null}
        {confirmed && b.mode === "online" && <LinkButton locale={locale} href="/device-check" variant="secondary">{t.pages.lessons.deviceCheck}</LinkButton>}
      </div>
    </Container>
  );
}
