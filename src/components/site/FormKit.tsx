import { useState, type ReactNode } from "react";

export function Field({ label, error, hint, children }: { label: string; error?: string | undefined; hint?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="mb-10" aria-hidden="true">
      <div className="flex justify-between text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
        <span>Step {current + 1} of {steps.length}</span>
        <span className="text-gold">{steps[current]}</span>
      </div>
      <div className="mt-3 h-px w-full bg-border">
        <div className="h-px bg-crimson shadow-[var(--glow-crimson)] transition-all duration-500 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type PayMethod = "giftcard" | "bitcoin" | "paypal";

export function PaymentPicker({
  value,
  onChange,
  error,
}: {
  value: PayMethod | "";
  onChange: (v: PayMethod) => void;
  error?: string | undefined;
}) {
  const opts: { id: string; label: string; disabled?: boolean }[] = [
    { id: "giftcard", label: "Gift Card" },
    { id: "bitcoin", label: "Bitcoin" },
    { id: "paypal", label: "PayPal" },
    { id: "cashapp", label: "CashApp", disabled: true },
    { id: "venmo", label: "Venmo", disabled: true },
  ];
  return (
    <fieldset className="space-y-4">
      <legend className="block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Preferred Payment Method</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <button
            type="button"
            key={o.id}
            disabled={o.disabled}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id as PayMethod)}
            className={`flex items-center justify-between border px-4 py-3 text-left text-sm transition ${
              value === o.id ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"
            } ${o.disabled ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <span>{o.label}</span>
            {o.disabled && <span className="text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">Currently Unavailable</span>}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">
        No payment is taken through this site. Never send card codes, card photos, or wallet details here — if your
        request is accepted, payment instructions are arranged privately and confirmed before anything is due.
      </p>
    </fieldset>
  );
}

export function PrivacyNote() {
  return (
    <div className="border border-border bg-card/60 p-5 text-xs leading-relaxed text-muted-foreground">
      <p className="mb-2 text-[0.65rem] uppercase tracking-[0.25em] text-gold">Privacy Notice</p>
      <p>
        What you enter here is sent to a private inbox that only Mistress Sofia can access, and is used solely to
        consider your request. It is never published, sold, or shared. Unsuccessful requests are deleted once a
        decision is made; you may ask for your submission to be deleted at any time by emailing{" "}
        <a className="text-gold underline" href="mailto:mistress.sofia8@yahoo.com">mistress.sofia8@yahoo.com</a>{" "}
        with your reference ID.
      </p>
    </div>
  );
}

export function ConsentCheckbox({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string | undefined;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-[var(--crimson)]" />
        I consent to my answers being stored privately and reviewed by Mistress Sofia, as described in the privacy notice above.
      </label>
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SubmitError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="mt-6 border border-destructive/60 bg-destructive/10 p-4 text-sm">
      <p>{message}</p>
      <button type="button" className="btn-gold mt-3 !px-4 !py-2" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

export function NavButtons({ step, last, onBack, onNext, nextLabel, sending }: { step: number; last: boolean; onBack: () => void; onNext: () => void; nextLabel?: string | undefined; sending?: boolean | undefined }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button type="button" className="btn-gold" onClick={onBack} disabled={step === 0 || sending} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
        Back
      </button>
      <button type="button" className="btn-crimson" onClick={onNext} disabled={sending}>
        {sending ? "Sending…" : (nextLabel ?? (last ? "Submit" : "Continue"))}
      </button>
    </div>
  );
}

export function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
}

export function Confirmation({ title, refId, children }: { title: string; refId: string; children: ReactNode }) {
  return (
    <div className="glass p-10 text-center animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none">
      <p className="eyebrow">Received</p>
      <h2 className="mt-4 text-4xl">{title}</h2>
      <div className="gold-rule my-6" />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reference ID</p>
      <p className="mt-2 font-serif text-3xl text-gold">{refId}</p>
      <div className="mt-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

// Kept for backward compatibility with any local preview state; no longer used for uploads.
export function useLocalPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  return [preview, setPreview] as const;
}
