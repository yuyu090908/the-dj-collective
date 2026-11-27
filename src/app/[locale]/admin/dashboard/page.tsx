import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { Empty, Stat } from "@/components/ui";
import { ServiceStatus } from "@/components/app/services";
import { dateTime, money } from "@/lib/i18n/format";
import { markContactAction } from "@/lib/admin-actions";

export default async function AdminDashboard({ params }: PageProps<"/[locale]/admin/dashboard">) {
  const { locale, t, user } = await adminPage(params);
  const [k] = await q<{ members: number; bookings30: number; revenue30: number; started30: number; confirmed30: number; returning_students: number; students: number; contacts: number }>(`
    select
      (select count(*) from users where role='member' and status='active') members,
      (select count(*) from bookings where status in ('confirmed','completed') and created_at > now() - interval '30 days') bookings30,
      (select coalesce(sum(amount_satang - refunded_satang),0) from payments where status in ('succeeded','refunded') and created_at > now() - interval '30 days') revenue30,
      (select count(*) from bookings where created_at > now() - interval '30 days') started30,
      (select count(*) from bookings where created_at > now() - interval '30 days' and status in ('confirmed','completed','refunded')) confirmed30,
      (select count(*) from (select user_id from bookings where status in ('confirmed','completed') group by user_id having count(*) >= 2) x) as returning_students,
      (select count(distinct user_id) from bookings where status in ('confirmed','completed')) students,
      (select count(*) from contact_messages where status='new') contacts`);
  const [contacts, logs] = await Promise.all([
    q<{ id: string; name: string; email: string; topic: string; body: string; created_at: string }>(`select * from contact_messages where status='new' order by created_at desc limit 10`),
    q<{ id: number; action: string; target_type: string | null; target_id: string | null; created_at: string; email: string | null }>(
      `select a.id, a.action, a.target_type, a.target_id, a.created_at, u.email from audit_logs a left join users u on u.id=a.actor_id order by a.created_at desc limit 15`,
    ),
  ]);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
  const kp = t.admin.kpi;
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.dashboard} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label={kp.members} value={k.members} />
        <Stat label={kp.bookings30} value={k.bookings30} accent />
        <Stat label={kp.revenue30} value={money(k.revenue30, locale)} />
        <Stat label={kp.bookingRate} value={pct(k.confirmed30, k.started30)} note={`${k.confirmed30}/${k.started30}`} />
        <Stat label={kp.retention} value={pct(k.returning_students, k.students)} note={`${k.returning_students}/${k.students}`} />
        <Stat label={kp.messages} value={k.contacts} />
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-3">{t.admin.services}</h2>
          <ServiceStatus t={t} />
        </section>
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-3">{t.pages.contact.title}</h2>
          {contacts.length ? (
            <ul className="divide-y divide-line text-sm">
              {contacts.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p><b>{c.name}</b> <a className="text-stone underline" href={`mailto:${c.email}`}>{c.email}</a> · {c.topic}</p>
                    <form action={markContactAction}><input type="hidden" name="id" value={c.id} /><button className="min-h-9 rounded-[4px] border border-line px-2 text-xs">✓</button></form>
                  </div>
                  <p className="mt-1 line-clamp-3 text-stone">{c.body}</p>
                </li>
              ))}
            </ul>
          ) : <Empty title={t.common.none} />}
        </section>
      </div>
      <section className="mt-6 rounded-[8px] border border-line p-5">
        <h2 className="kicker mb-3">{t.admin.audit}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <tbody className="divide-y divide-line">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 pr-4 tnum text-stone">{dateTime(l.created_at, locale, user.timezone)}</td>
                  <td className="py-2 pr-4">{l.email ?? "system"}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{l.action}</td>
                  <td className="py-2 font-mono text-xs text-stone">{l.target_type} {l.target_id?.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
