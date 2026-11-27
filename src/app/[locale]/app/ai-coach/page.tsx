import { memberPage } from "@/lib/page-guards";
import { services } from "@/lib/env";
import { q } from "@/lib/db";
import { getConversation, listConversations } from "@/lib/coach";
import { deleteConversationAction } from "@/lib/coach-actions";
import { listMixes } from "@/lib/mixlab";
import { getUsage, getUserPlan } from "@/lib/plan";
import { dateTime } from "@/lib/i18n/format";
import { coachT } from "@/lib/i18n/p2/coach";
import { PageTitle } from "@/components/app/shell";
import { CoachChat } from "@/components/coach/chat";
import { ActionForm } from "@/components/forms";
import { L, LinkButton, Tag, cx } from "@/components/ui";

export default async function AiCoach({ params, searchParams }: PageProps<"/[locale]/app/ai-coach">) {
  const { locale, t, user } = await memberPage(params);
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const s = coachT(locale);
  const [plan, usage, convs, mixes, sets] = await Promise.all([
    getUserPlan(user.id), getUsage(user.id), listConversations(user.id), listMixes(user.id, 30),
    q<{ id: string; title: string }>(`select id, title from dj_sets where user_id=$1 order by updated_at desc limit 30`, [user.id]),
  ]);
  const cId = one(sp.c);
  const conv = cId ? await getConversation(user.id, cId) : null;
  const connected = services.llm;
  const outOfQuota = usage.coach >= plan.quotas.ai_coach_messages;

  return (
    <>
      <PageTitle kicker={t.app.groups.ai} title={s.title}
        action={<LinkButton locale={locale} href="/app/ai-coach" variant="secondary">{s.newChat}</LinkButton>} />
      <p className="-mt-4 mb-6 max-w-3xl text-stone">{s.lead}</p>

      {!connected && (
        <div className="mb-6 rounded-[8px] border border-line p-5" data-testid="coach-not-connected">
          <div className="mb-2 flex flex-wrap items-center gap-3"><Tag kind="notConnected">{t.status.notConnected}</Tag><h2 className="font-medium">{s.notConnectedTitle}</h2></div>
          <p className="text-sm text-stone">{s.notConnectedBody}</p>
        </div>
      )}
      {connected && outOfQuota && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[8px] border border-line p-4 text-sm">
          <span>{s.errors.quota}</span><LinkButton locale={locale} href="/app/subscription" variant="secondary">{s.upgrade}</LinkButton>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="order-2 lg:order-1">
          <h2 className="kicker mb-3">{s.history}</h2>
          {convs.length ? (
            <ul className="divide-y divide-line rounded-[8px] border border-line text-sm">
              {convs.map((c) => (
                <li key={c.id}>
                  <L locale={locale} href={`/app/ai-coach?c=${c.id}`} className={cx("block min-h-11 px-4 py-2.5 hover:bg-ink-2", c.id === conv?.id && "bg-ink-2")}>
                    <span className="line-clamp-2">{c.title || "—"}</span>
                    <span className="text-xs text-stone tnum">{dateTime(c.updated_at, locale, user.timezone)}</span>
                  </L>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone">{s.noHistory}</p>}
          {conv && (
            <ActionForm action={deleteConversationAction} submit={s.deleteChat} msgs={{ notFound: s.errors.notFound, generic: s.errors.generic }} variant="danger" className="mt-4">
              <input type="hidden" name="id" value={conv.id} />
              <input type="hidden" name="locale" value={locale} />
            </ActionForm>
          )}
        </aside>
        <div className="order-1 lg:order-2">
          <CoachChat key={conv?.id ?? "new"} locale={locale} s={s} connected={connected} conversationId={conv?.id}
            initial={(conv?.messages ?? []).map((m) => ({ role: m.role, content: m.content }))}
            mixes={mixes.map((m) => ({ id: m.id, label: m.title }))} sets={sets.map((x) => ({ id: x.id, label: x.title }))}
            ctx={{ mixId: one(sp.mix) ?? conv?.context.mixId, setId: one(sp.set) ?? conv?.context.setId, useLearning: conv?.uses_learning_context ?? false }}
            usage={{ n: usage.coach, m: plan.quotas.ai_coach_messages }} />
          <p className="mt-2 text-xs text-stone">{s.model}</p>
        </div>
      </div>
    </>
  );
}
