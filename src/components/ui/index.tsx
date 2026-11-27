import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { lp, type Locale } from "@/lib/i18n/config";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
const base =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-[6px] font-display text-[0.8125rem] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 select-none disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-lime text-ink hover:bg-[#d4ff63] active:bg-[#b5e43e]",
  secondary: "border border-ivory/80 text-ivory hover:bg-ivory hover:text-ink",
  ghost: "text-ivory hover:bg-ink-3",
  danger: "border border-err/70 text-err hover:bg-err hover:text-ink",
};

export function btn(variant: Variant = "primary", extra?: string) {
  return cx(base, variants[variant], extra);
}

export function Button({ variant = "primary", className, ...p }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={btn(variant, className)} {...p} />;
}

export function L({ locale, href, ...p }: Omit<ComponentProps<typeof Link>, "href"> & { locale: Locale; href: string }) {
  const external = /^https?:/.test(href);
  return <Link href={external ? href : lp(locale, href)} {...p} />;
}

export function LinkButton({
  locale, href, variant = "primary", className, children, ...p
}: { locale: Locale; href: string; variant?: Variant; className?: string; children: ReactNode } & Omit<ComponentProps<"a">, "href">) {
  return (
    <L locale={locale} href={href} className={btn(variant, className)} {...p}>
      {children}
    </L>
  );
}

type TagKind = "provisional" | "placeholder" | "notConnected" | "phase" | "sample" | "live" | "demo" | "neutral" | "lime";
const tagStyles: Record<TagKind, string> = {
  provisional: "border-warn/60 text-warn",
  placeholder: "border-warn/60 text-warn border-dashed",
  notConnected: "border-err/60 text-err",
  phase: "border-ivory/40 text-ivory/80",
  sample: "border-stone/60 text-stone border-dashed",
  live: "border-ok/60 text-ok",
  demo: "border-warn/60 text-warn",
  neutral: "border-line text-stone",
  lime: "border-lime/70 text-lime",
};

export function Tag({ kind = "neutral", children, className }: { kind?: TagKind; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 font-display text-[0.6875rem] font-medium uppercase leading-[1.25] tracking-[0.1em] max-w-full",
        tagStyles[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("kicker", className)}>{children}</p>;
}

export function SectionHead({ kicker, title, sub, action }: { kicker?: string; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-t border-line pt-6 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
        <h2 className="font-display text-[clamp(1.75rem,4.2vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{title}</h2>
        {sub && <p className="mt-3 max-w-2xl text-[0.98rem] text-stone">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ kicker, title, lead, children }: { kicker?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-12 md:px-10 md:pb-14 md:pt-20">
        {kicker && <Kicker className="mb-4">{kicker}</Kicker>}
        <h1 className="font-display text-[clamp(2.5rem,7.5vw,6.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em]">
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-2xl text-lg text-ivory/80">{lead}</p>}
        {children}
      </div>
    </header>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-[1440px] px-5 md:px-10", className)}>{children}</div>;
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-[8px] border border-line bg-ink-2", className)}>{children}</div>;
}

export function Field({ label, hint, children, error }: { label: string; hint?: string; children: ReactNode; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-display text-xs font-medium uppercase tracking-[0.1em] text-stone">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-stone">{hint}</span>}
      {error && <span className="text-xs text-err">{error}</span>}
    </label>
  );
}

export const inputCls =
  "min-h-11 w-full rounded-[6px] border border-line bg-ink px-3 py-2 text-ivory placeholder:text-stone/70 focus:border-lime focus:outline-none";

export function Input(p: ComponentProps<"input">) {
  return <input {...p} className={cx(inputCls, p.className)} />;
}
export function Select(p: ComponentProps<"select">) {
  return <select {...p} className={cx(inputCls, "appearance-none bg-[length:12px] pr-8", p.className)} />;
}
export function Textarea(p: ComponentProps<"textarea">) {
  return <textarea {...p} className={cx(inputCls, "min-h-28", p.className)} />;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-dashed border-line px-6 py-10 text-center">
      <p className="font-display text-sm uppercase tracking-[0.1em] text-stone">{title}</p>
      {children && <div className="mt-4 flex justify-center gap-3">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, accent, note }: { label: string; value: ReactNode; accent?: boolean; note?: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-line bg-ink-2 p-4">
      <p className="kicker">{label}</p>
      <p className={cx("tnum mt-2 font-display text-3xl font-semibold tracking-tight", accent && "text-lime")}>{value}</p>
      {note && <div className="mt-1 text-xs text-stone">{note}</div>}
    </div>
  );
}

export function Alert({ kind = "info", children }: { kind?: "info" | "error" | "ok" | "warn"; children: ReactNode }) {
  const s = {
    info: "border-line bg-ink-2 text-ivory/85",
    error: "border-err/50 bg-err/10 text-ivory",
    ok: "border-ok/50 bg-ok/10 text-ivory",
    warn: "border-warn/50 bg-warn/10 text-ivory",
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cx("rounded-[6px] border px-4 py-3 text-sm", s)}>
      {children}
    </div>
  );
}
