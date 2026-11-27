import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { pageCtx } from "@/lib/i18n/server";
import { AuthShell } from "@/components/site/auth-shell";
import { MfaForm } from "@/components/forms";
import { mfaAction } from "@/lib/auth/actions";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/guards";
import { lp } from "@/lib/i18n/config";
import { q, q1 } from "@/lib/db";
import { newTotpSecret, otpauthUrl } from "@/lib/auth/totp";

export const metadata = { robots: { index: false } };

export default async function Mfa({ params, searchParams }: PageProps<"/[locale]/mfa">) {
  const { locale, t } = await pageCtx(params);
  const sp = await searchParams;
  const next = safeNext(sp.next, "/admin/dashboard");
  const user = await getSessionUser();
  if (!user) redirect(lp(locale, `/login?next=${encodeURIComponent(`/mfa?next=${next}`)}`));
  if (user.role !== "admin") redirect(lp(locale, "/forbidden"));
  if (user.mfaVerified) redirect(lp(locale, next));

  let enroll: { secret: string; svg: string } | null = null;
  if (!user.totpEnabled) {
    let row = await q1<{ totp_secret: string | null }>(`select totp_secret from users where id=$1`, [user.id]);
    if (!row?.totp_secret) {
      const s = newTotpSecret();
      await q(`update users set totp_secret=$2 where id=$1 and totp_enabled=false`, [user.id, s]);
      row = { totp_secret: s };
    }
    const url = otpauthUrl(row.totp_secret!, user.email);
    enroll = { secret: row.totp_secret!, svg: await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#101010", light: "#F0EDE5" } }) };
  }
  const a = t.auth;
  return (
    <AuthShell title={a.mfaTitle} lead={enroll ? a.mfaEnroll : a.mfaVerify}>
      {enroll && (
        <div className="mb-6 flex flex-col items-start gap-3">
          <div className="w-44 overflow-hidden rounded-[6px]" dangerouslySetInnerHTML={{ __html: enroll.svg }} />
          <code className="break-all rounded-[4px] border border-line px-2 py-1 font-mono text-xs" data-testid="totp-secret">{enroll.secret}</code>
        </div>
      )}
      <MfaForm action={mfaAction} locale={locale} next={next} labels={{ code: a.mfaCode, verify: a.verify }} msgs={{ ...a, ...t.errors }} />
    </AuthShell>
  );
}
