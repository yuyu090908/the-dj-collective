import { notFound } from "next/navigation";
import { pageCtx, seo } from "@/lib/i18n/server";
import { Alert, Container, PageHero } from "@/components/ui";
import { legal } from "@/lib/legal";

const DOCS = ["terms", "privacy", "refund", "copyright"] as const;
type DocKey = (typeof DOCS)[number];
const isDoc = (d: string): d is DocKey => (DOCS as readonly string[]).includes(d);

export async function generateMetadata({ params }: PageProps<"/[locale]/legal/[doc]">) {
  const { locale } = await pageCtx(params);
  const { doc } = await params;
  if (!isDoc(doc)) return {};
  return seo(locale, `/legal/${doc}`, legal[doc][locale].title);
}

export default async function LegalPage({ params }: PageProps<"/[locale]/legal/[doc]">) {
  const { locale, t } = await pageCtx(params);
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const d = legal[doc][locale];
  return (
    <>
      <PageHero kicker="Legal" title={d.title} />
      <Container className="max-w-3xl pt-10">
        <Alert kind="warn">{t.pages.legal.draft}</Alert>
        <ol className="mt-8 space-y-8">
          {d.sections.map(([h, b], i) => (
            <li key={h}>
              <h2 className="font-display text-lg font-semibold"><span className="kicker mr-3 tnum">{String(i + 1).padStart(2, "0")}</span>{h}</h2>
              <p className="mt-2 text-ivory/85">{b}</p>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
