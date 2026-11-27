"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/auth/actions";
import { Alert, btn, cx, Field, inputCls } from "./ui";

export function Submit({ children, variant = "primary", className }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={btn(variant, cx("min-h-12", className))}>
      {pending ? "…" : children}
    </button>
  );
}

type Msgs = Record<string, string>;

function Feedback({ state, msgs }: { state: FormState; msgs: Msgs }) {
  if (!state) return null;
  if (state.error) return <Alert kind="error">{msgs[state.error] ?? msgs.generic}</Alert>;
  if (state.message) return <Alert kind="ok">{msgs[state.message] ?? state.message}</Alert>;
  if (state.ok && msgs.ok) return <Alert kind="ok">{msgs.ok}</Alert>;
  return null;
}

export function AuthForm({
  mode, action, locale, next, labels, msgs,
}: {
  mode: "login" | "register";
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  locale: string;
  next?: string;
  labels: { [k: string]: string | Record<string, string>; levels: Record<string, string>; goals: Record<string, string> };
  msgs: Msgs;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "register" && (
        <Field label={labels.displayName as string}>
          <input name="displayName" required maxLength={60} autoComplete="nickname" className={inputCls} />
        </Field>
      )}
      <Field label={labels.email as string}>
        <input name="email" type="email" required autoComplete="email" inputMode="email" className={inputCls} />
      </Field>
      <Field label={labels.password as string} hint={mode === "register" ? (labels.passwordHint as string) : undefined}>
        <input name="password" type="password" required minLength={mode === "register" ? 10 : 1} autoComplete={mode === "register" ? "new-password" : "current-password"} className={inputCls} />
      </Field>
      {mode === "register" && (
        <>
          <Field label={labels.experience as string}>
            <select name="experience" className={inputCls} defaultValue="beginner">
              {Object.entries(labels.levels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label={labels.goal as string}>
            <select name="goal" className={inputCls} defaultValue="start">
              {Object.entries(labels.goals).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" name="terms" required className="mt-1 h-5 w-5 accent-[#C4F34D]" />
            <span>{labels.acceptTerms as string}</span>
          </label>
        </>
      )}
      <Feedback state={state} msgs={msgs} />
      <Submit>{String(mode === "login" ? labels.login : labels.register)}</Submit>
    </form>
  );
}

export function MfaForm({ action, locale, next, labels, msgs }: { action: (s: FormState, fd: FormData) => Promise<FormState>; locale: string; next: string; labels: { code: string; verify: string }; msgs: Msgs }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />
      <Field label={labels.code}>
        <input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" className={cx(inputCls, "tnum tracking-[0.4em] text-xl")} />
      </Field>
      <Feedback state={state} msgs={msgs} />
      <Submit>{labels.verify}</Submit>
    </form>
  );
}

export function ContactForm({ action, locale, labels, msgs }: { action: (s: FormState, fd: FormData) => Promise<FormState>; locale: string; labels: { [k: string]: string | Record<string, string>; topics: Record<string, string> }; msgs: Msgs }) {
  const [state, formAction] = useActionState(action, undefined);
  if (state?.ok) return <Alert kind="ok">{msgs.ok}</Alert>;
  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <Field label={labels.name as string}><input name="name" required maxLength={100} autoComplete="name" className={inputCls} /></Field>
      <Field label={labels.email as string}><input name="email" type="email" required autoComplete="email" className={inputCls} /></Field>
      <div className="md:col-span-2">
        <Field label={labels.topic as string}>
          <select name="topic" className={inputCls}>
            {Object.entries(labels.topics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label={labels.message as string}><textarea name="body" required minLength={5} maxLength={5000} rows={6} className={inputCls} /></Field>
      </div>
      <div className="md:col-span-2 flex flex-col gap-3">
        <Feedback state={state} msgs={msgs} />
        <Submit className="self-start">{labels.send as string}</Submit>
      </div>
    </form>
  );
}

/** Generic form bound to a server action with a single submit button. */
export function ActionForm({
  action, children, submit, msgs, variant = "primary", className,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  children?: React.ReactNode;
  submit: string;
  msgs: Msgs;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={cx("flex flex-col gap-4", className)}>
      {children}
      <Feedback state={state} msgs={msgs} />
      <Submit variant={variant} className="self-start">{submit}</Submit>
    </form>
  );
}
