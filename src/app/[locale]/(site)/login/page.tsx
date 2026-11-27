import { redirect } from "next/navigation";
import { pageCtx, seo } from "@/lib/i18n/server";
import { AuthShell } from "@/components/site/auth-shell";
import { AuthForm } from "@/components/forms";
import { loginAction } from "@/lib/auth/actions";
import { L, Tag } from "@/components/ui";
import { services } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { homeFor, safeNext } from "@/lib/guards";
import { lp } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const { locale, t } = await pageCtx(params);
  return { ...seo(locale, "/login", t.nav.login), robots: { index: false } };
}

export default async function Login({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? safeNext(sp.next, "") : "";
  const user = await getSessionUser().catch(() => null);
  if (user) redirect(lp(locale, next || homeFor(user.role)));
  const a = t.auth;
  return (
    <AuthShell
      title={a.loginTitle}
      aside={
        <div className="space-y-4 text-sm">
          <p className="text-stone">
            {a.noAccount}{" "}
            <L locale={locale} href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ivory underline underline-offset-4 hover:text-lime">{a.register}</L>
          </p>
          {!services.supabaseAuth && <Tag kind="demo">{a.localAuthNote}</Tag>}
        </div>
      }
    >
      <AuthForm
        mode="login"
        action={loginAction}
        locale={locale}
        next={next}
        labels={{ ...a, levels: t.booking.levels, goals: t.home.journey.options }}
        msgs={{ ...a, ...t.errors }}
      />
    </AuthShell>
  );
}
