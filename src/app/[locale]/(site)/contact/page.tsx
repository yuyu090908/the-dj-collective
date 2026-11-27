import { pageCtx, seo } from "@/lib/i18n/server";
import { Container, PageHero, Tag } from "@/components/ui";
import { ContactForm } from "@/components/forms";
import { contactAction } from "@/lib/site-actions";
import { services } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/contact", t.pages.contact.title, t.pages.contact.lead);
}

export default async function Contact({ params }: PageProps<"/[locale]/contact">) {
  const { locale, t } = await pageCtx(params);
  const c = t.pages.contact;
  return (
    <>
      <PageHero kicker="Contact" title={c.title} lead={c.lead} />
      <Container className="grid gap-10 pt-12 lg:grid-cols-[2fr_1fr]">
        <ContactForm
          action={contactAction}
          locale={locale}
          labels={{ name: t.common.name, email: t.common.email, topic: c.topic, message: c.message, send: c.send, topics: c.topics }}
          msgs={{ ok: c.sent, generic: t.errors.generic, invalidInput: t.errors.invalidInput, rateLimited: t.errors.rateLimited }}
        />
        <aside className="space-y-3 text-sm text-stone">
          {!services.email && <Tag kind="notConnected">Email — {t.status.notConnected}</Tag>}
          {!services.email && <p>{c.emailNote}</p>}
        </aside>
      </Container>
    </>
  );
}
