import "server-only";

/** Feature flags derived from environment. Nothing pretends to be connected. */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  authSecret: process.env.AUTH_SECRET ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  dailyApiKey: process.env.DAILY_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  llmApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  isProd: process.env.NODE_ENV === "production" && process.env.DJC_ENV !== "test",
};

export const services = {
  supabaseAuth: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  stripe: Boolean(env.stripeSecret && env.stripeWebhookSecret),
  daily: Boolean(env.dailyApiKey),
  email: Boolean(env.resendApiKey && env.emailFrom),
  llm: Boolean(env.llmApiKey),
  /** Simulated payments: only when Stripe is NOT configured and explicitly enabled. */
  demoPayments: !(env.stripeSecret && env.stripeWebhookSecret) && process.env.DEMO_PAYMENTS === "1",
};

export type ServiceKey = keyof typeof services;
