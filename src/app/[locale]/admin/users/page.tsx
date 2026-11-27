import { adminPage } from "@/lib/page-guards";
import { q } from "@/lib/db";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { inputCls, Tag } from "@/components/ui";
import { setRoleAction } from "@/lib/admin-actions";
import { dateTime } from "@/lib/i18n/format";

export default async function Users({ params, searchParams }: PageProps<"/[locale]/admin/users">) {
  const { locale, t, user } = await adminPage(params);
  const sp = await searchParams;
  const s = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const rows = await q<{ id: string; email: string; role: string; status: string; created_at: string; display_name: string | null; experience_level: string | null; bookings: number }>(
    `select u.id, u.email, u.role, u.status, u.created_at, p.display_name, p.experience_level,
            (select count(*) from bookings b where b.user_id=u.id and b.status in ('confirmed','completed')) bookings
       from users u left join profiles p on p.user_id=u.id
      where ($1 = '' or u.email ilike '%'||$1||'%' or p.display_name ilike '%'||$1||'%')
      order by u.created_at desc limit 200`,
    [s],
  );
  return (
    <>
      <PageTitle kicker="Admin" title={t.admin.nav.users} />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={s} placeholder={t.common.search} className={`${inputCls} max-w-sm`} /><button className="min-h-11 rounded-[6px] border border-line px-4 text-sm">{t.common.search}</button></form>
      <div className="overflow-x-auto rounded-[8px] border border-line">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="kicker text-left"><tr className="border-b border-line"><th className="px-4 py-3 font-normal">{t.common.email}</th><th className="px-4 py-3 font-normal">{t.common.name}</th><th className="px-4 py-3 font-normal">{t.booking.level}</th><th className="px-4 py-3 font-normal">{t.nav.lessons}</th><th className="px-4 py-3 font-normal">{t.common.date}</th><th className="px-4 py-3 font-normal">{t.admin.role}</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">{r.email} {r.status !== "active" && <Tag kind="notConnected">{r.status}</Tag>}</td>
                <td className="px-4 py-3">{r.display_name}</td>
                <td className="px-4 py-3 text-stone">{r.experience_level}</td>
                <td className="px-4 py-3 tnum">{r.bookings}</td>
                <td className="px-4 py-3 tnum text-stone">{dateTime(r.created_at, locale, user.timezone, { hour: undefined, minute: undefined })}</td>
                <td className="px-4 py-2">
                  <ActionForm action={setRoleAction} submit={t.common.save} variant="secondary" className="!flex-row !items-center !gap-2" msgs={{ ok: "✓", forbidden: t.auth.forbidden, generic: t.errors.generic }}>
                    <input type="hidden" name="userId" value={r.id} />
                    <select name="role" defaultValue={r.role} aria-label={t.admin.role} className={`${inputCls} !w-32`}><option value="member">member</option><option value="instructor">instructor</option><option value="admin">admin</option></select>
                    <select name="status" defaultValue={r.status === "deleted" ? "suspended" : r.status} aria-label={t.common.status} className={`${inputCls} !w-32`}><option value="active">active</option><option value="suspended">suspended</option></select>
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
