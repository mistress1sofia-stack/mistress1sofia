import { useState, type ReactNode } from "react";

export function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="mb-10">
      <div className="flex justify-between text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
        <span>Step {current + 1} of {steps.length}</span>
        <span className="text-gold">{steps[current]}</span>
      </div>
      <div className="mt-3 h-px w-full bg-border">
        <div className="h-px bg-crimson shadow-[var(--glow-crimson)] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type PayMethod = "giftcard" | "bitcoin" | "paypal";

export function PaymentPicker({
  value,
  onChange,
  code,
  onCode,
  error,
}: {
  value: PayMethod | "";
  onChange: (v: PayMethod) => void;
  code: string;
  onCode: (v: string) => void;
  error?: string | undefined;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const opts: { id: string; label: string; disabled?: boolean }[] = [
    { id: "giftcard", label: "Gift Card" },
    { id: "bitcoin", label: "Bitcoin" },
    { id: "paypal", label: "PayPal" },
    { id: "cashapp", label: "CashApp", disabled: true },
    { id: "venmo", label: "Venmo", disabled: true },
  ];
  return (
    <div className="space-y-4">
      <span className="block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Payment Method</span>
      <div className="grid gap-3 sm:grid-cols-2">
        {opts.map((o) => (
          <button
            type="button"
            key={o.id}
            disabled={o.disabled}
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
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value === "giftcard" && (
        <div className="space-y-4 border border-border p-4">
          <Field label="Gift Card Code">
            <input className="field" value={code} onChange={(e) => onCode(e.target.value)} />
          </Field>
          <Field label="Upload Card Image">
            <input
              type="file"
              accept="image/*"
              className="field text-xs file:mr-3 file:border-0 file:bg-crimson file:px-3 file:py-1 file:text-primary-foreground"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </Field>
          {preview && <img src={preview} alt="Gift card preview" className="max-h-48 border border-border object-contain" />}
        </div>
      )}
      {value === "bitcoin" && <p className="text-xs text-muted-foreground">The wallet address will be sent privately once your submission is received.</p>}
      {value === "paypal" && <p className="text-xs text-muted-foreground">Payment instructions will be sent privately once your submission is received.</p>}
    </div>
  );
}

export function NavButtons({ step, last, onBack, onNext, nextLabel }: { step: number; last: boolean; onBack: () => void; onNext: () => void; nextLabel?: string | undefined }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      <button type="button" className="btn-gold" onClick={onBack} disabled={step === 0} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
        Back
      </button>
      <button type="button" className="btn-crimson" onClick={onNext}>
        {nextLabel ?? (last ? "Submit" : "Continue")}
      </button>
    </div>
  );
}

export function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
}

export function Confirmation({ title, refId, children }: { title: string; refId: string; children: ReactNode }) {
  return (
    <div className="glass p-10 text-center animate-in fade-in zoom-in-95 duration-700">
      <p className="eyebrow">Received</p>
      <h2 className="mt-4 text-4xl">{title}</h2>
      <div className="gold-rule my-6" />
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reference ID</p>
      <p className="mt-2 font-serif text-3xl text-gold">{refId}</p>
      <div className="mt-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
