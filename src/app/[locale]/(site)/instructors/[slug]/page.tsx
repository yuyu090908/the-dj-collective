import { notFound } from "next/navigation";
import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, L } from "@/components/ui";
import { getInstructorBySlug } from "@/lib/data";
import { InstructorFeature } from "@/components/site/instructor";
import { tr } from "@/lib/i18n/config";
import { env } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/instructors/[slug]">) {
  const { locale } = await pageCtx(params);
  const { slug } = await params;
  const ins = await getInstructorBySlug(slug);
  if (!ins) return {};
  const meta = seo(locale, `/instructors/${slug}`, ins.dj_name, tr(ins.bio, locale));
  return ins.is_placeholder ? { ...meta, robots: { index: false } } : meta;
}

export default async function InstructorPage({ params }: PageProps<"/[locale]/instructors/[slug]">) {
  const { locale, t } = await pageCtx(params);
  const { slug } = await params;
  const ins = await getInstructorBySlug(slug);
  if (!ins) notFound();
  // Structured data only for real (non-placeholder) instructors.
  const ld = ins.is_placeholder
    ? null
    : { "@context": "https://schema.org", "@type": "Person", name: ins.dj_name, jobTitle: "DJ Instructor", url: `${env.siteUrl}/instructors/${ins.slug}`, homeLocation: ins.base_city };
  return (
    <Container className="pt-8">
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <nav aria-label="Breadcrumb" className="kicker mb-6">
        <L locale={locale} href="/instructors" className="hover:text-ivory">{t.pages.instructors.title}</L> / {ins.dj_name}
      </nav>
      <InstructorFeature locale={locale} t={t} ins={ins} full />
    </Container>
  );
}
