import { Suspense } from "react";
import { CalendarPlus } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n";
import type { SessionUser } from "@/lib/auth/session";
import { homeFor } from "@/lib/guards";
import { getSiteMedia } from "@/lib/data";
import { Logo } from "../visuals";
import { L, LinkButton, Tag } from "../ui";
import { LangSwitch, MobileMenu } from "./client";

export function SiteHeader({ locale, t, user }: { locale: Locale; t: Dict; user: SessionUser | null }) {
  const main = [
    { href: "/academy", label: t.nav.academy },
    { href: "/#ai-lab", label: t.nav.aiLab },
    { href: "/community", label: t.nav.community },
    { href: "/events", label: t.nav.events },
  ];
  const mobile = [
    ...main,
    { href: "/lessons", label: t.nav.lessons },
    { href: "/instructors", label: t.nav.instructors },
    { href: "/courses", label: t.nav.courses },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];
  const dash = user ? homeFor(user.role) : "/app/dashboard";
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/92 backdrop-blur-md" style={{ paddingTop: "var(--safe-t)" }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-3 focus:py-2 focus:text-ink">
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-5 md:px-10">
        <L locale={locale} href="/" aria-label="THE DJ COLLECTIVE — home" className="inline-flex min-h-11 shrink-0 items-center">
          <Logo />
        </L>
        <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
          {main.map((it) => (
            <L
              key={it.href}
              locale={locale}
              href={it.href}
              className="rounded-[4px] px-4 py-2 font-display text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-ivory/80 hover:text-ivory"
            >
              {it.label}
            </L>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <Suspense>
            <LangSwitch locale={locale} label={t.nav.language} className="hidden md:flex" />
          </Suspense>
          {user ? (
            <span className="hidden md:block">
              <LinkButton locale={locale} href={dash} variant="secondary">
                {t.nav.dashboard}
              </LinkButton>
            </span>
          ) : (
            <L locale={locale} href="/login" className="hidden min-h-11 items-center px-3 font-display text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ivory/80 hover:text-ivory md:inline-flex">
              {t.nav.login}
            </L>
          )}
          {!user && (
            <span className="hidden sm:block">
              <LinkButton locale={locale} href="/register">{t.nav.join}</LinkButton>
            </span>
          )}
          {/* mobile: booking always reachable */}
          <span className="sm:hidden">
            <LinkButton locale={locale} href="/booking" className="!px-3" aria-label={t.nav.book}>
              <CalendarPlus size={18} aria-hidden="true" />
              <span className="text-[0.75rem] max-[399px]:hidden">{t.nav.book.split(" ")[0]}</span>
            </LinkButton>
          </span>
          <Suspense>
            <MobileMenu
              locale={locale}
              items={mobile}
              signedIn={Boolean(user)}
              dashHref={dash}
              labels={{ menu: t.nav.menu, close: t.nav.close, login: t.nav.login, join: t.nav.join, book: t.nav.book, language: t.nav.language, dashboard: t.nav.dashboard }}
            />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter({ locale, t }: { locale: Locale; t: Dict }) {
  const media = await getSiteMedia().catch(() => null);
  const social = Object.entries(media?.social ?? {});
  const col = (title: string, links: [string, string][]) => (
    <div>
      <p className="kicker mb-4">{title}</p>
      <ul className="space-y-1">
        {links.map(([href, label]) => (
          <li key={href}>
            <L locale={locale} href={href} className="inline-flex min-h-9 items-center text-sm text-ivory/80 hover:text-lime">
              {label}
            </L>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="mt-24 border-t border-line bg-ink" style={{ paddingBottom: "var(--safe-b)" }}>
      <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm text-stone">{t.footer.school}</p>
            <p className="mt-6 font-display text-2xl font-semibold uppercase leading-none tracking-tight">
              Learn. Connect.
              <br />
              <span className="text-lime">Perform.</span>
            </p>
          </div>
          {col(t.footer.explore, [
            ["/academy", t.nav.academy],
            ["/lessons", t.nav.lessons],
            ["/instructors", t.nav.instructors],
            ["/courses", t.nav.courses],
            ["/pricing", t.nav.pricing],
            ["/booking", t.nav.book],
          ])}
          {col(t.footer.platform, [
            ["/community", t.nav.community],
            ["/events", t.nav.events],
            ["/artists", t.nav.artists],
            ["/about", t.nav.about],
            ["/contact", t.footer.contact],
          ])}
          {col(t.footer.legal, [
            ["/legal/terms", t.footer.terms],
            ["/legal/privacy", t.footer.privacy],
            ["/legal/refund", t.footer.refund],
            ["/legal/copyright", t.footer.copyright],
          ])}
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="kicker">{t.footer.social}</p>
            {social.length ? (
              social.map(([k, v]) => (
                <a key={k} href={v} rel="noopener noreferrer" target="_blank" className="inline-flex min-h-9 items-center text-sm capitalize text-ivory/80 hover:text-lime">
                  {k}
                </a>
              ))
            ) : (
              <Tag kind="placeholder">{t.footer.socialPending}</Tag>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="kicker">{t.footer.languages}</p>
            <Suspense>
              <LangSwitch locale={locale} label={t.nav.language} />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-xs text-stone">© {new Date().getFullYear()} THE DJ COLLECTIVE. {t.footer.rights}</p>
      </div>
    </footer>
  );
}
