import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveSubmission } from "@/lib/submit";
import { useI18n } from "@/lib/i18n";
import { TRIBUTE_MIN } from "@/lib/pricing";
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

const STEPS = ["Introduction", "Personal Details", "Background", "Tribute", "Commitment", "Review"];
const DRAFT_KEY = "ms-apply-draft";
type F = Partial<Record<"name"|"pet"|"email"|"phone"|"age"|"city"|"sex"|"marital"|"height"|"weight"|"education"|"occupation"|"amount"|"why"|"pay"|"obey"|"ack"|"consent"|"sensitiveConsent", string>>;
type K = keyof F;

const REVIEW_GROUPS: { step: number; title: string; fields: [K, string][] }[] = [
  { step: 1, title: "Personal Details", fields: [["name", "Full Name"], ["pet", "Pet Name"], ["email", "Email"], ["phone", "Phone"], ["age", "Age"], ["city", "City / Country"], ["sex", "Sex"], ["marital", "Marital Status"], ["height", "Height"], ["weight", "Weight"]] },
  { step: 2, title: "Background", fields: [["education", "Education"], ["occupation", "Occupation"]] },
  { step: 3, title: "Tribute", fields: [["amount", "Tribute Amount ({sym})"], ["pay", "Payment Method"]] },
  { step: 4, title: "Commitment", fields: [["why", "Why you seek to serve"]] },
];

function Apply() {
  const { t, money, symbol, currency, lang } = useI18n();
  const tributeWording = t("Nothing is paid through this site. Your offer is a pledge only. If you are found suitable, payment is arranged privately after acceptance.");
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
        <option value="">{t("Select…")}</option>
        {opts.map((o) => <option key={o} value={o}>{t(o)}</option>)}
      </select>
    </Field>
  );

  function validate() {
    const e: F = {};
    const req = (k: K) => { if (!f[k]?.trim()) e[k] = t("Required"); };
    if (step === 1) {
      (["name", "email", "phone", "age", "city", "sex"] as K[]).forEach(req);
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = t("Enter a valid email");
      if (f.age && Number(f.age) < 18) e.age = t("You must be 18 or older");
    }
    if (step === 2) (["occupation"] as K[]).forEach(req);
    if (step === 3) {
      if (!f.amount || Number(f.amount) < TRIBUTE_MIN) e.amount = t("Minimum tribute is {min}", { min: money(TRIBUTE_MIN) });
      if (!pay) e.pay = t("Select a payment method");
    }
    if (step === 4) {
      if (!obey) e.obey = t("Required");
      if (!f.why || f.why.trim().length < 30) e.why = t("Please write at least a few sentences");
      if (!ack) e.ack = t("Required");
    }
    if (step === 5) {
      if (!consent) e.consent = t("Consent is required to submit");
      if (!sensitive) e.sensitiveConsent = t("Consent is required to submit");
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
    saveSubmission("applications", { ...f, currency, lang, pay, obey, ack, consent, sensitiveConsent: sensitive }, { website: honeypot, elapsedMs: Date.now() - startedAt })
      .then((result) => {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setRefId(result.reference); window.scrollTo(0, 0);
      })
      .catch((error) => setSubmitError(error instanceof Error && error.message ? error.message : t("Your application could not be sent. Your answers are still here — please try again.")))
      .finally(() => setSending(false));
  }

  function next() {
    if (!validate()) return;
    if (step === STEPS.length - 1) { submit(); return; }
    setStep(step + 1); window.scrollTo(0, 0);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">{t("Long-Term Service")}</p>
      <h1 className="mt-4 text-5xl">{t("Apply for Consideration")}</h1>
      <div className="gold-rule my-10" />
      {refId ? (
        <Confirmation title="Your Application Has Been Received" refId={refId}>
          {t("Keep this reference. This confirms receipt only — not acceptance. If you are found suitable, you will be contacted privately with next steps, including how your administrative tribute is arranged. Do not chase.")}
        </Confirmation>
      ) : (
        <div className="relative glass p-6 sm:p-10">
          <Honeypot value={honeypot} onChange={setHoneypot} />
          <Steps steps={STEPS} current={step} />
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-5 font-serif text-lg leading-relaxed">
                <p>{t("Service to Me is a privilege, not a transaction. I accept very few into long-term training.")}</p>
                <p>{t("I expect devotion, discipline, and absolute honesty. Every answer you give will be read by Me personally — falsehood ends your consideration immediately.")}</p>
                <p className="text-muted-foreground">{tributeWording}</p>
                <p className="text-sm text-muted-foreground">{t("Your progress is kept only in this browser tab.")}</p>
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
                <div className="space-y-4 border border-crimson bg-oxblood/40 p-5 shadow-[var(--glow-crimson)]">
                  <p className="eyebrow">{t("An Offering of Respect")}</p>
                  <p className="font-serif text-lg leading-relaxed">{t("The administrative tribute is not a fee. It is your first demonstration of seriousness, respect, and an understanding of your place.")}</p>
                  <p className="text-sm leading-relaxed">{t("A serious submissive does not offer the least he can. The higher and more respectful the tribute you offer, the more seriously your application will be considered, and the faster it may be reviewed. Weak offerings are not prioritised.")}</p>
                  <p className="text-sm font-medium leading-relaxed text-gold">{t("A strong offering shows a true understanding of your place and a genuine desire to serve. Choose an amount that proves it.")}</p>
                </div>
                <div>
                  <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Suggested offerings")}</span>
                  <div className="flex flex-wrap gap-3">
                    {[200, 300, 500, 1000].map((n) => (
                      <button type="button" key={n} aria-pressed={f.amount === String(n)} onClick={() => setF({ ...f, amount: String(n) })}
                        className={`border px-4 py-2 text-sm transition ${f.amount === String(n) ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"}`}>
                        {money(n)}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={t("Tribute Amount ({sym})", { sym: symbol })} error={err.amount} hint={tributeWording}>
                  <input type="number" min={TRIBUTE_MIN} className="field" value={f.amount ?? ""} onChange={set("amount")} data-invalid={err.amount ? true : undefined} aria-invalid={err.amount ? true : undefined} />
                </Field>
                <PaymentPicker value={pay} onChange={setPay} error={err.pay} />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={obey} onChange={(e) => setObey(e.target.checked)} className="mt-1 accent-[var(--crimson)]" data-invalid={err.obey ? true : undefined} aria-invalid={err.obey ? true : undefined} />
                  {t("I am willing to offer 100% obedience to Mistress Sofia within negotiated limits.")}
                </label>
                {err.obey && <p role="alert" className="text-xs text-danger">{err.obey}</p>}
                <Field label="Why do you seek to serve Mistress Sofia?" error={err.why}>
                  <textarea rows={7} className="field" value={f.why ?? ""} onChange={set("why")} data-invalid={err.why ? true : undefined} aria-invalid={err.why ? true : undefined} />
                </Field>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 accent-[var(--crimson)]" data-invalid={err.ack ? true : undefined} aria-invalid={err.ack ? true : undefined} />
                  {t("I formally acknowledge that all information provided is true, that I am over 18, and that submission does not guarantee acceptance.")}
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
                        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t(group.title)}</p>
                        <button type="button" className="text-xs text-gold underline" onClick={() => { setStep(group.step); window.scrollTo(0, 0); }}>{t("Edit")}</button>
                      </div>
                      <dl className="space-y-2 text-sm">
                        {group.fields.map(([key, label]) => {
                          const value = key === "pay" ? pay : f[key];
                          if (!value) return null;
                          return (
                            <div key={key} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                              <dt className="text-muted-foreground">{t(label, { sym: symbol })}</dt>
                              <dd className="break-words whitespace-pre-wrap">{key === "pay" ? t(({ giftcard: "Gift Card", bitcoin: "Bitcoin", paypal: "PayPal" } as Record<string, string>)[value] ?? value) : t(value)}</dd>
                            </div>
                          );
                        })}
                        {group.step === 4 && <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">{t("Obedience & honesty")}</dt><dd>{t("Confirmed")}</dd></div>}
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
