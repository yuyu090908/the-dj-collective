import { memberPage } from "@/lib/page-guards";
import { getCourses } from "@/lib/data";
import { PageTitle } from "@/components/app/shell";
import { PhasePanel } from "@/components/phase";
import { L } from "@/components/ui";
import { tr } from "@/lib/i18n/config";

export default async function Learning({ params }: PageProps<"/[locale]/app/learning">) {
  const { locale, t, user } = await memberPage(params);
  const courses = await getCourses();
  const lv = user.experience === "advanced" ? 4 : user.experience === "intermediate" ? 2 : 1;
  return (
    <>
      <PageTitle kicker={t.app.items.learning} title={t.pages.courses.title} />
      <ol className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {courses.map((c) => (
          <li key={c.id}>
            <L locale={locale} href={`/courses#level-${c.level}`} className={`block h-full rounded-[8px] border p-4 ${c.level === lv ? "border-lime" : "border-line"} hover:border-stone`}>
              <p className="kicker tnum">LV {String(c.level).padStart(2, "0")}</p>
              <p className="mt-6 font-display text-sm font-semibold uppercase">{tr(c.title, locale)}</p>
              <p className="mt-1 text-xs text-stone tnum">{c.modules.length} {t.pages.courses.modules}</p>
            </L>
          </li>
        ))}
      </ol>
      <PhasePanel feature="learning" locale={locale} t={t} available={[{ href: "/courses", label: t.nav.courses }]} />
    </>
  );
}
