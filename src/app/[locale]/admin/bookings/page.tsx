import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { L, Tag } from "@/components/ui";
import { adminCancelBookingAction, adminRefundAction } from "@/lib/admin-actions";
import { tr } from "@/lib/i18n/config";
import { dateTime, money } from "@/lib/i18n/format";

const STATUSES = ["all", "confirmed", "pending_payment", "held", "completed", "cancelled", "refunded", "expired", "payment_failed"];

export default async function AdminBookings({ params, searchParams }: PageProps<"/[locale]/admin/bookings">) {
  const { locale, t } = await adminPage(params);
  const sp = await searchParams;
  const st = typeof sp.status === "string" && STATUSES.includes(sp.status) ? sp.status : "all";
  const rows = await q<{ id: string; starts_at: string; status: string; mode: string; title: Record<string, string>; email: string; dj_name: string; price_satang: number; discount_satang: number; currency: string; paid: boolean }>(
    `select b.id, b.starts_at, b.status, b.mode, l.title, u.email, i.dj_name, b.price_satang, b.discount_satang, b.currency,
            exists (select 1 from payments p where p.booking_id=b.id and p.status='succeeded') paid
       from bookings b join lessons l on l.id=b.lesson_id join users u on u.id=b.user_id join instructors i on i.id=b.instructor_id
      where ($1='all' or b.status=$1) order by b.starts_at desc limit 300`,
    [st],
  );
  const bk = t.booking;
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.bookings} />
      <nav className="mb-4 flex gap-1 overflow-x-auto pb-1" aria-label="Filter">
        {STATUSES.map((s) => (
          <L key={s} locale={locale} href={`/admin/bookings?status=${s}`} className={`inline-flex min-h-10 shrink-0 items-center rounded-[4px] border px-3 text-xs uppercase tracking-[0.08em] ${s === st ? "border-lime text-lime" : "border-line text-stone"}`}>
            {s === "all" ? t.common.viewAll : bk.statuses[s as "held"]}
          </L>
        ))}
      </nav>
      <div className="overflow-x-auto rounded-[8px] border border-line">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="kicker text-left"><tr className="border-b border-line">{[t.common.date, t.common.status, bk.chooseLesson, t.common.email, bk.instructor, bk.total, t.common.actions].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 tnum">{dateTime(r.starts_at, locale, "Asia/Bangkok")}</td>
                <td className="px-4 py-3"><Tag kind={r.status === "confirmed" ? "live" : r.status.includes("pending") || r.status === "held" ? "provisional" : "neutral"}>{bk.statuses[r.status as "held"]}</Tag></td>
                <td className="px-4 py-3">{tr(r.title, locale)}</td>
                <td className="px-4 py-3 text-stone">{r.email}</td>
                <td className="px-4 py-3">{r.dj_name}</td>
                <td className="px-4 py-3 tnum">{money(r.price_satang - r.discount_satang, locale, r.currency)} {r.paid && <Tag kind="live">paid</Tag>}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    {["confirmed", "held", "pending_payment"].includes(r.status) && (
                      <ActionForm action={adminCancelBookingAction} submit={t.admin.cancelBooking} variant="danger" msgs={{ ok: "✓", generic: t.errors.generic }}><input type="hidden" name="bookingId" value={r.id} /></ActionForm>
                    )}
                    {r.status === "cancelled" && r.paid && (
                      <ActionForm action={adminRefundAction} submit={t.admin.refund} variant="secondary" msgs={{ ok: "✓", generic: t.errors.generic }}><input type="hidden" name="bookingId" value={r.id} /></ActionForm>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
