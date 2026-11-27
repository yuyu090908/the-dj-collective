import { redirect } from "next/navigation";
import { pageCtx, seo } from "@/lib/i18n/server";
import { AuthShell } from "@/components/site/auth-shell";
import { AuthForm } from "@/components/forms";
import { registerAction } from "@/lib/auth/actions";
import { L, Tag } from "@/components/ui";
import { services } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/guards";
import { lp } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[locale]/register">) {
  const { locale, t } = await pageCtx(params);
  return seo(locale, "/register", t.auth.registerTitle, t.auth.registerLead);
}

export default async function Register({ params, searchParams }: PageProps<"/[locale]/register">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? safeNext(sp.next, "") : "";
  if (await getSessionUser().catch(() => null)) redirect(lp(locale, next || "/app/dashboard"));
  const a = t.auth;
  return (
    <AuthShell
      title={a.registerTitle}
      lead={a.registerLead}
      aside={
        <div className="space-y-4 text-sm">
          <p className="text-stone">
            {a.haveAccount}{" "}
            <L locale={locale} href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ivory underline underline-offset-4 hover:text-lime">{a.login}</L>
          </p>
          <p className="text-xs text-stone">
            <L locale={locale} href="/legal/terms" className="underline underline-offset-4">{t.footer.terms}</L> ·{" "}
            <L locale={locale} href="/legal/privacy" className="underline underline-offset-4">{t.footer.privacy}</L>
          </p>
          {!services.supabaseAuth && <Tag kind="demo">{a.localAuthNote}</Tag>}
        </div>
      }
    >
      <AuthForm
        mode="register"
        action={registerAction}
        locale={locale}
        next={next}
        labels={{ ...a, levels: t.booking.levels, goals: t.home.journey.options }}
        msgs={{ ...a, ...t.errors }}
      />
    </AuthShell>
  );
}
