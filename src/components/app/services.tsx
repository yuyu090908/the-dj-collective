import { services } from "@/lib/env";
import type { Dict } from "@/lib/i18n";
import { Tag } from "../ui";

const LIST: { key: keyof typeof services | "db"; name: string; env: string }[] = [
  { key: "db", name: "PostgreSQL / Supabase DB", env: "DATABASE_URL" },
  { key: "supabaseAuth", name: "Supabase Auth", env: "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY" },
  { key: "stripe", name: "Stripe (card / PromptPay)", env: "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET" },
  { key: "daily", name: "Daily (video calls)", env: "DAILY_API_KEY" },
  { key: "email", name: "Resend (email)", env: "RESEND_API_KEY, EMAIL_FROM" },
  { key: "llm", name: "LLM (AI Coach, Phase 02)", env: "ANTHROPIC_API_KEY" },
];

export function ServiceStatus({ t }: { t: Dict }) {
  return (
    <ul className="divide-y divide-line text-sm">
      {LIST.map((s) => {
        const on = s.key === "db" ? true : services[s.key];
        return (
          <li key={s.key} className="flex flex-wrap items-center gap-2 py-2.5">
            <span className="min-w-48">{s.name}</span>
            {on ? <Tag kind="live">{t.status.live}</Tag> : <Tag kind="notConnected">{t.status.notConnected}</Tag>}
            {!on && <code className="font-mono text-xs text-stone">{s.env}</code>}
          </li>
        );
      })}
      {services.demoPayments && (
        <li className="flex items-center gap-2 py-2.5"><span className="min-w-48">DEMO_PAYMENTS</span><Tag kind="demo">{t.status.demo}</Tag></li>
      )}
    </ul>
  );
}
