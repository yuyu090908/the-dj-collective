import { pageCtx, seo } from "@/lib/i18n/server";
import { Alert, Container, LinkButton, PageHero } from "@/components/ui";
import { getCourses } from "@/lib/data";
import { tr } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[locale]/courses">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/courses", `${t.pages.courses.title} — DJ Course`, t.pages.courses.lead);
}

export default async function Courses({ params }: PageProps<"/[locale]/courses">) {
  const { locale, t } = await pageCtx(params);
  const c = t.pages.courses;
  const courses = await getCourses().catch(() => []);
  const kinds = Object.entries(c.kinds);
  return (
    <>
      <PageHero kicker="Curriculum" title={c.title} lead={c.lead} />
      <Container className="pt-10">
        <Alert>{c.phaseNote}</Alert>
        <div className="mt-6 flex flex-wrap gap-2" aria-label={c.materials}>
          <span className="kicker mr-2 self-center">{c.materials}</span>
          {kinds.map(([k, v]) => <span key={k} className="rounded-[4px] border border-line px-2 py-1 text-xs">{v}</span>)}
        </div>
        <ol className="mt-10 space-y-3">
          {courses.map((course) => (
            <li key={course.id} id={`level-${course.level}`} className="scroll-mt-24 grid overflow-hidden rounded-[8px] border border-line md:grid-cols-[280px_1fr]">
              <div className="border-b border-line bg-ink-2 p-5 md:border-b-0 md:border-r md:p-6">
                <p className="kicker tnum">{c.level} {String(course.level).padStart(2, "0")}</p>
                <h2 className="mt-3 font-display text-2xl font-bold uppercase leading-none tracking-tight">{tr(course.title, locale)}</h2>
                <p className="mt-3 text-sm text-stone">{tr(course.description, locale)}</p>
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-ink">
                  <div className="h-full bg-lime" style={{ width: `${(course.level / 6) * 100}%` }} />
                </div>
                <p className="kicker mt-2 tnum">{course.modules.length} {c.modules}</p>
              </div>
              <ol className="grid sm:grid-cols-2">
                {course.modules.map((m, i) => (
                  <li key={m.id} className="flex min-h-14 items-center gap-4 border-b border-line px-5 py-3 sm:odd:border-r">
                    <span className="kicker tnum w-8">{course.level}.{i + 1}</span>
                    <span className="text-sm">{tr(m.title, locale)}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex justify-center">
          <LinkButton locale={locale} href="/booking">{t.nav.book}</LinkButton>
        </div>
      </Container>
    </>
  );
}
