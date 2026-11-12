import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveSubmission } from "@/lib/submit";
import { Confirmation, ConsentCheckbox, Field, Honeypot, NavButtons, PaymentPicker, PrivacyNote, SensitiveConsentCheckbox, Steps, SubmitError, type PayMethod } from "@/components/site/FormKit";

export const Route = createFileRoute("/apply")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Apply for Consideration — Mistress Sofia" },
      { name: "description", content: "Apply for long-term service under Mistress Sofia. Highly selective. 18+ only." },
      { property: "og:title", content: "Apply for Consideration — Mistress Sofia" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "A selective application for long-term service and training." },
      // The link-preview image (og:image) comes from the root route.
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/apply" }],
  }),
  component: Apply,
});

const TRIBUTE_WORDING = "A minimum £100 administrative tribute applies only if you are found suitable. Nothing is paid through this site; payment is arranged privately after acceptance.";
const STEPS = ["Introduction", "Personal Details", "Background", "Tribute", "Commitment", "Review"];
const DRAFT_KEY = "ms-apply-draft";
type F = Partial<Record<"name"|"pet"|"email"|"phone"|"age"|"city"|"sex"|"marital"|"height"|"weight"|"education"|"occupation"|"amount"|"why"|"pay"|"obey"|"ack"|"consent"|"sensitiveConsent", string>>;
type K = keyof F;

const REVIEW_GROUPS: { step: number; title: string; fields: [K, string][] }[] = [
  { step: 1, title: "Personal Details", fields: [["name", "Full Name"], ["pet", "Pet Name"], ["email", "Email"], ["phone", "Phone"], ["age", "Age"], ["city", "City / Country"], ["sex", "Sex"], ["marital", "Marital Status"], ["height", "Height"], ["weight", "Weight"]] },
  { step: 2, title: "Background", fields: [["education", "Education"], ["occupation", "Occupation"]] },
  { step: 3, title: "Tribute", fields: [["amount", "Tribute Amount (£)"], ["pay", "Payment Method"]] },
  { step: 4, title: "Commitment", fields: [["why", "Why you seek to serve"]] },
];

function Apply() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({});
  const [pay, setPay] = useState<PayMethod | "">("");
  const [obey, setObey] = useState(false);
  const [ack, setAck] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sensitive, setSensitive] = useState(false);
  const [err, setErr] = useState<F>({});
  const [refId, setRefId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [startedAt, setStartedAt] = useState(0);

  // Restore draft progress (this tab only) and start the submission timer.
  useEffect(() => {
    setStartedAt(Date.now());
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { f?: F; pay?: PayMethod | ""; obey?: boolean; ack?: boolean; consent?: boolean; sensitive?: boolean; step?: number };
        setF(d.f ?? {}); setPay(d.pay ?? ""); setObey(Boolean(d.obey)); setAck(Boolean(d.ack));
        setConsent(Boolean(d.consent)); setSensitive(Boolean(d.sensitive)); setStep(d.step ?? 0);
      }
    } catch { /* ignore corrupt drafts */ }
  }, []);

  // Save progress while typing — sessionStorage only, cleared on submit or tab close.
  useEffect(() => {
    if (refId) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ f, pay, obey, ack, consent, sensitive, step })); } catch { /* storage full/blocked */ }
  }, [f, pay, obey, ack, consent, sensitive, step, refId]);

  const set = (k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const inp = (k: K, label: string, type = "text") => (
    <Field label={label} error={err[k]}><input type={type} className="field" value={f[k] ?? ""} onChange={set(k)} data-invalid={err[k] ? true : undefined} aria-invalid={err[k] ? true : undefined} /></Field>
  );
  const sel = (k: K, label: string, opts: string[]) => (
    <Field label={label} error={err[k]}>
      <select className="field" value={f[k] ?? ""} onChange={set(k)} data-invalid={err[k] ? true : undefined} aria-invalid={err[k] ? true : undefined}>
        <option value="">Select…</option>
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </Field>
  );

  function validate() {
    const e: F = {};
    const req = (k: K) => { if (!f[k]?.trim()) e[k] = "Required"; };
    if (step === 1) {
      (["name", "email", "phone", "age", "city", "sex"] as K[]).forEach(req);
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
      if (f.age && Number(f.age) < 18) e.age = "You must be 18 or older";
    }
    if (step === 2) (["occupation"] as K[]).forEach(req);
    if (step === 3) {
      if (!f.amount || Number(f.amount) < 100) e.amount = "Minimum tribute is £100";
      if (!pay) e.pay = "Select a payment method";
    }
    if (step === 4) {
      if (!obey) e.obey = "Required";
      if (!f.why || f.why.trim().length < 30) e.why = "Please write at least a few sentences";
      if (!ack) e.ack = "Required";
    }
    if (step === 5) {
      if (!consent) e.consent = "Consent is required to submit";
      if (!sensitive) e.sensitiveConsent = "Consent is required to submit";
    }
    setErr(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-invalid='true']")?.focus());
      return false;
    }
    return true;
  }

  function submit() {
    setSending(true);
    setSubmitError("");
    saveSubmission("applications", { ...f, pay, obey, ack, consent, sensitiveConsent: sensitive }, { website: honeypot, elapsedMs: Date.now() - startedAt })
      .then((result) => {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setRefId(result.reference); window.scrollTo(0, 0);
      })
      .catch((error) => setSubmitError(error instanceof Error && error.message ? error.message : "Your application could not be sent. Your answers are still here — please try again."))
      .finally(() => setSending(false));
  }

  function next() {
    if (!validate()) return;
    if (step === STEPS.length - 1) { submit(); return; }
    setStep(step + 1); window.scrollTo(0, 0);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Long-Term Service</p>
      <h1 className="mt-4 text-5xl">Apply for Consideration</h1>
      <div className="gold-rule my-10" />
      {refId ? (
        <Confirmation title="Your Application Has Been Received" refId={refId}>
          Keep this reference. This confirms receipt only — not acceptance. If you are found suitable, you will be
          contacted privately with next steps, including how the £100 administrative tribute is arranged. Do not chase.
        </Confirmation>
      ) : (
        <div className="relative glass p-6 sm:p-10">
          <Honeypot value={honeypot} onChange={setHoneypot} />
          <Steps steps={STEPS} current={step} />
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-5 font-serif text-lg leading-relaxed">
                <p>Service to Me is a privilege, not a transaction. I accept very few into long-term training.</p>
                <p>I expect devotion, discipline, and absolute honesty. Every answer you give will be read by Me personally — falsehood ends your consideration immediately.</p>
                <p className="text-muted-foreground">{TRIBUTE_WORDING}</p>
                <p className="text-sm text-muted-foreground">Your progress is kept only in this browser tab.</p>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("name", "Full Name")}{inp("pet", "Pet Name")}{inp("email", "Email", "email")}{inp("phone", "Phone", "tel")}
                {inp("age", "Age", "number")}{inp("city", "City / Country")}
                {sel("sex", "Sex", ["Male", "Female", "Non-binary", "Other"])}
                {sel("marital", "Marital Status (optional)", ["Single", "In a relationship", "Married", "Divorced", "Other", "Prefer not to say"])}
                {inp("height", "Height (optional)")}{inp("weight", "Weight (optional)")}
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("education", "Education (optional)")}{inp("occupation", "Occupation")}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <Field label="Tribute Amount (£, minimum 100)" error={err.amount} hint={TRIBUTE_WORDING}>
                  <input type="number" min={100} className="field" value={f.amount ?? ""} onChange={set("amount")} data-invalid={err.amount ? true : undefined} aria-invalid={err.amount ? true : undefined} />
                </Field>
                <PaymentPicker value={pay} onChange={setPay} error={err.pay} />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={obey} onChange={(e) => setObey(e.target.checked)} className="mt-1 accent-[var(--crimson)]" data-invalid={err.obey ? true : undefined} aria-invalid={err.obey ? true : undefined} />
                  I am willing to offer 100% obedience to Mistress Sofia within negotiated limits.
                </label>
                {err.obey && <p role="alert" className="text-xs text-danger">{err.obey}</p>}
                <Field label="Why do you seek to serve Mistress Sofia?" error={err.why}>
                  <textarea rows={7} className="field" value={f.why ?? ""} onChange={set("why")} data-invalid={err.why ? true : undefined} aria-invalid={err.why ? true : undefined} />
                </Field>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 accent-[var(--crimson)]" data-invalid={err.ack ? true : undefined} aria-invalid={err.ack ? true : undefined} />
                  I formally acknowledge that all information provided is true, that I am over 18, and that submission does not guarantee acceptance.
                </label>
                {err.ack && <p role="alert" className="text-xs text-danger">{err.ack}</p>}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-8">
                <div className="space-y-6">
                  {REVIEW_GROUPS.map((group) => (
                    <div key={group.step} className="border border-border p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">{group.title}</p>
                        <button type="button" className="text-xs text-gold underline" onClick={() => { setStep(group.step); window.scrollTo(0, 0); }}>Edit</button>
                      </div>
                      <dl className="space-y-2 text-sm">
                        {group.fields.map(([key, label]) => {
                          const value = key === "pay" ? pay : f[key];
                          if (!value) return null;
                          return (
                            <div key={key} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                              <dt className="text-muted-foreground">{label}</dt>
                              <dd className="break-words whitespace-pre-wrap">{value}</dd>
                            </div>
                          );
                        })}
                        {group.step === 4 && <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">Obedience & honesty</dt><dd>Confirmed</dd></div>}
                      </dl>
                    </div>
                  ))}
                </div>
                <PrivacyNote />
                <ConsentCheckbox checked={consent} onChange={setConsent} error={err.consent} />
                <SensitiveConsentCheckbox checked={sensitive} onChange={setSensitive} error={err.sensitiveConsent} />
              </div>
            )}
          </div>
          {submitError && <SubmitError message={submitError} onRetry={submit} />}
          <NavButtons step={step} last={step === STEPS.length - 1} onBack={() => setStep(step - 1)} onNext={next} sending={sending} nextLabel={step === 0 ? "Begin" : step === STEPS.length - 1 ? "Submit Application" : undefined} />
        </div>
      )}
    </section>
  );
}
