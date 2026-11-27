import { memberPage } from "@/lib/page-guards";
import { canUseSetBuilder, listLibrary, listSets } from "@/lib/setbuilder";
import { addTrackAction, clearLibraryAction, createSetAction, deleteTrackAction } from "@/lib/setbuilder-actions";
import { dateTime, fmt } from "@/lib/i18n/format";
import { setT } from "@/lib/i18n/p2/sets";
import { PageTitle } from "@/components/app/shell";
import { ActionForm } from "@/components/forms";
import { LibraryImport } from "@/components/sets/import";
import { mmss } from "@/components/mixlab/fmt";
import { L, LinkButton, inputCls } from "@/components/ui";

export default async function SetBuilder({ params }: PageProps<"/[locale]/app/set-builder">) {
  const { locale, t, user } = await memberPage(params);
  const s = setT(locale);
  if (!(await canUseSetBuilder(user.id))) {
    return (
      <>
        <PageTitle kicker={t.app.groups.ai} title={s.title} />
        <section className="max-w-2xl rounded-[8px] border border-line p-6" data-testid="set-locked">
          <h2 className="mb-2 font-display text-xl font-semibold">{s.lockedTitle}</h2>
          <p className="mb-5 text-stone">{s.lockedBody}</p>
          <LinkButton locale={locale} href="/app/subscription#plan-artist_pro">{s.seePlans}</LinkButton>
        </section>
      </>
    );
  }
  const [sets, lib] = await Promise.all([listSets(user.id), listLibrary(user.id)]);
  const errs = { ...s.errors, trackAdded: s.trackAdded, cleared: s.cleared };

  return (
    <>
      <PageTitle kicker={t.app.groups.ai} title={s.title} />
      <p className="-mt-4 mb-6 max-w-3xl text-stone">{s.lead}</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="kicker mb-3">{s.sets}</h2>
          {sets.length ? (
            <ul className="divide-y divide-line rounded-[8px] border border-line text-sm" data-testid="set-list">
              {sets.map((x) => (
                <li key={x.id}>
                  <L locale={locale} href={`/app/set-builder/${x.id}`} className="flex min-h-14 flex-wrap items-center gap-3 px-5 py-3 hover:bg-ink-2">
                    <span className="flex-1 font-medium">{x.title}</span>
                    <span className="text-stone">{s.slots[x.context.slot] ?? ""} · {x.context.minutes}′</span>
                    <span className="text-stone tnum">{fmt(s.tracksN, { n: x.n })}</span>
                    <span className="text-xs text-stone tnum">{dateTime(x.updated_at, locale, user.timezone)}</span>
                  </L>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-[8px] border border-line px-5 py-6 text-sm text-stone">{s.noSets}</p>}
        </section>
        <section className="rounded-[8px] border border-line p-5">
          <h2 className="kicker mb-4">{s.newSet}</h2>
          <ActionForm action={createSetAction} submit={s.create} msgs={errs}>
            <input type="hidden" name="locale" value={locale} />
            <label className="block"><span className="mb-1.5 block text-sm">{s.setTitle}</span><input name="title" required maxLength={120} placeholder={s.setTitlePh} className={inputCls} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><span className="mb-1.5 block text-sm">{s.minutes}</span><input name="minutes" type="number" min={10} max={600} defaultValue={60} required className={inputCls} /></label>
              <label className="block"><span className="mb-1.5 block text-sm">{s.slot}</span>
                <select name="slot" defaultValue="warmup" className={inputCls}>{Object.entries(s.slots).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
            </div>
            <label className="block"><span className="mb-1.5 block text-sm">{s.genre}</span><input name="genre" maxLength={60} className={inputCls} /></label>
          </ActionForm>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-baseline gap-3"><h2 className="kicker">{s.library}</h2><span className="text-sm text-stone tnum" data-testid="lib-count">{fmt(s.libCount, { n: lib.length })}</span></div>
        <p className="mb-4 text-sm text-stone">{s.libraryNote}</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[8px] border border-line p-5"><h3 className="mb-3 font-medium">{s.importHdr}</h3><LibraryImport s={s} /></div>
          <div className="rounded-[8px] border border-line p-5">
            <h3 className="mb-3 font-medium">{s.addHdr}</h3>
            <ActionForm action={addTrackAction} submit={s.add} msgs={errs} variant="secondary">
              <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 block"><span className="mb-1 block text-xs text-stone">{s.t.title}</span><input name="title" required maxLength={200} className={inputCls} /></label>
                <label className="col-span-2 block"><span className="mb-1 block text-xs text-stone">{s.t.artist}</span><input name="artist" maxLength={200} className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-stone">{s.t.bpm}</span><input name="bpm" inputMode="decimal" className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-stone">{s.t.key}</span><input name="key" placeholder="8A / Am" title={s.keyHint} className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-stone">{s.t.duration}</span><input name="duration" placeholder="6:05" className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-stone">{s.t.energy}</span>
                  <select name="energy" className={inputCls} defaultValue=""><option value="">–</option>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
                <label className="col-span-2 block"><span className="mb-1 block text-xs text-stone">{s.t.genre}</span><input name="genre" maxLength={60} className={inputCls} /></label>
              </div>
            </ActionForm>
          </div>
        </div>
        {lib.length > 0 && (
          <>
            <div className="mt-6 overflow-x-auto rounded-[8px] border border-line">
              <table className="w-full min-w-[640px] text-sm" data-testid="lib-table">
                <thead className="text-left text-xs text-stone"><tr className="border-b border-line">
                  {[s.t.title, s.t.artist, s.t.bpm, s.t.key, s.t.duration, s.t.energy, ""].map((h, i) => <th key={i} className="px-4 py-2.5 font-normal">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-line tnum">
                  {lib.slice(0, 200).map((x) => (
                    <tr key={x.id}>
                      <td className="max-w-64 truncate px-4 py-2">{x.title}</td><td className="max-w-48 truncate px-4 py-2 text-stone">{x.artist}</td>
                      <td className="px-4 py-2">{x.bpm ?? "—"}</td><td className="px-4 py-2">{x.camelot ?? "—"}</td>
                      <td className="px-4 py-2">{x.duration_sec ? mmss(x.duration_sec) : "—"}</td><td className="px-4 py-2">{x.energy ?? "—"}</td>
                      <td className="px-2 py-1 text-right">
                        <form action={deleteTrackAction.bind(null, x.id)}><button className="min-h-11 px-3 text-xs text-stone hover:text-err" aria-label={`${s.remove}: ${x.title}`}>{s.remove}</button></form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 max-w-md">
              <ActionForm action={clearLibraryAction} submit={s.clear} msgs={errs} variant="danger">
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="confirm" className="size-4" />{s.confirmClearLabel}</label>
              </ActionForm>
            </div>
          </>
        )}
      </section>
    </>
  );
}
