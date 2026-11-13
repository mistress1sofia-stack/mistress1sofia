import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { saveSubmission } from "@/lib/submit";
import { Confirmation, ConsentCheckbox, Field, Honeypot, NavButtons, PaymentPicker, PrivacyNote, SensitiveConsentCheckbox, Steps, SubmitError, type PayMethod } from "@/components/site/FormKit";
import { sessionPrice, CUSTOM_HOURLY } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/book")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Book a Session — Mistress Sofia" },
      { name: "description", content: "Request a private in-person or online session with Mistress Sofia. 50% deposit arranged privately. 18+ only." },
      { property: "og:title", content: "Book a Session — Mistress Sofia" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Private sessions from £140. Requests are tentative until the deposit is arranged privately." },
      // The link-preview image (og:image) comes from the root route.
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/book" }],
  }),
  component: Book,
});

const STEPS = ["Protocol", "Client Profile", "Session", "Venue & Logistics", "Limits", "Deposit", "Review"];
const DRAFT_KEY = "ms-book-draft";
const ACTIVITIES = ["Bondage & restraint", "Foot, shoe & boot worship", "Flogging & caning", "Humiliation", "Chastity & orgasm control", "Feminization", "Wax & ice play", "Electric stimulation", "Sensory deprivation", "CBT", "Trampling", "Role play"];
type F = Partial<Record<"name"|"pet"|"email"|"phone"|"age"|"location"|"pay"|"type"|"duration"|"customHours"|"venue"|"travel"|"dates"|"platform"|"handle"|"timezone"|"setup"|"experience"|"dungeon"|"hard"|"soft"|"medical"|"consent"|"sensitiveConsent", string>>;
type K = keyof F;

// Questions that only apply to one kind of session. Answers for the other kind are never shown or sent.
const IN_PERSON_ONLY: K[] = ["venue", "travel"];
const ONLINE_ONLY: K[] = ["platform", "handle", "timezone", "setup"];
function relevantOnly(f: F): F {
  const skip = f.type === "Online" ? IN_PERSON_ONLY : ONLINE_ONLY;
  return Object.fromEntries(Object.entries(f).filter(([k]) => !skip.includes(k as K))) as F;
}

const REVIEW_GROUPS: { step: number; title: string; fields: [K, string][] }[] = [
  { step: 1, title: "Client Profile", fields: [["name", "Full Name"], ["pet", "Pet Name"], ["email", "Email"], ["phone", "Contact Number"], ["age", "Age"], ["location", "Location"]] },
  { step: 2, title: "Session", fields: [["type", "Session Type"], ["duration", "Duration"], ["customHours", "Custom Hours"]] },
  { step: 3, title: "Venue & Logistics", fields: [["venue", "Preferred Venue"], ["travel", "Travel Details"], ["platform", "Platform"], ["handle", "Your Username on that Platform"], ["timezone", "Your Time Zone"], ["setup", "Device & Connection"], ["dates", "Preferred Dates & Times"]] },
  { step: 4, title: "Limits", fields: [["experience", "Experience Level"], ["dungeon", "Previous Dungeon Experience"], ["hard", "Hard Limits"], ["soft", "Soft Limits"], ["medical", "Medical / Health Alerts"]] },
];

function Book() {
  const { t, money, currency, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({ type: "In-Person", duration: "1h" });
  const [acts, setActs] = useState<string[]>([]);
  const [pay, setPay] = useState<PayMethod | "">("");
  const [consent, setConsent] = useState(false);
  const [sensitive, setSensitive] = useState(false);
  const [err, setErr] = useState<F>({});
  const [refId, setRefId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [startedAt, setStartedAt] = useState(0);

  const price = sessionPrice(f.duration as never, Number(f.customHours) || 0);
  const deposit = Math.round(price / 2);

  // Overnight is not offered online: if Online is chosen while Overnight is selected, fall back to 1 hour.
  useEffect(() => {
    if (f.type === "Online" && f.duration === "overnight") setF((prev) => ({ ...prev, duration: "1h" }));
  }, [f.type, f.duration]);

  // Restore draft progress (this tab only) and start the submission timer.
  useEffect(() => {
    setStartedAt(Date.now());
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { f?: F; acts?: string[]; pay?: PayMethod | ""; consent?: boolean; sensitive?: boolean; step?: number };
        setF({ type: "In-Person", duration: "1h", ...d.f }); setActs(d.acts ?? []); setPay(d.pay ?? "");
        setConsent(Boolean(d.consent)); setSensitive(Boolean(d.sensitive)); setStep(d.step ?? 0);
      }
    } catch { /* ignore corrupt drafts */ }
  }, []);

  // Save progress while typing — sessionStorage only, cleared on submit or tab close.
  useEffect(() => {
    if (refId) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ f, acts, pay, consent, sensitive, step })); } catch { /* storage full/blocked */ }
  }, [f, acts, pay, consent, sensitive, step, refId]);

  const set = (k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const inp = (k: K, label: string, type = "text") => (
    <Field label={label} error={err[k]}><input type={type} className="field" value={f[k] ?? ""} onChange={set(k)} data-invalid={err[k] ? true : undefined} aria-invalid={err[k] ? true : undefined} /></Field>
  );
  const area = (k: K, label: string) => (
    <Field label={label} error={err[k]}><textarea rows={3} className="field" value={f[k] ?? ""} onChange={set(k)} data-invalid={err[k] ? true : undefined} aria-invalid={err[k] ? true : undefined} /></Field>
  );
  const choice = (k: K, opts: string[], translate = true) => (
    <div className="flex flex-wrap gap-3">
      {opts.map((o) => (
        <button type="button" key={o} aria-pressed={f[k] === o} onClick={() => setF({ ...f, [k]: o })}
          className={`border px-4 py-2 text-sm transition ${f[k] === o ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"}`}>
          {translate ? t(o) : o}
        </button>
      ))}
    </div>
  );

  function validate() {
    const e: F = {};
    const req = (k: K) => { if (!f[k]?.trim()) e[k] = t("Required"); };
    if (step === 1) {
      (["name", "email", "phone", "age", "location"] as K[]).forEach(req);
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = t("Enter a valid email");
      if (f.age && Number(f.age) < 18) e.age = t("You must be 18 or older");
    }
    if (step === 2 && f.duration === "custom" && !(Number(f.customHours) > 0)) e.customHours = t("Enter number of hours");
    if (step === 3) {
      if (f.type === "In-Person") req("venue");
      if (f.type === "Online") { req("platform"); req("handle"); req("timezone"); }
    }
    if (step === 4) req("experience");
    if (step === 5) { if (!pay) e.pay = t("Select a payment method"); }
    if (step === 6) {
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
    saveSubmission("booking_requests", { ...relevantOnly(f), pay, currency, lang, activities: acts, consent, sensitiveConsent: sensitive }, { website: honeypot, elapsedMs: Date.now() - startedAt })
      .then((result) => {
        try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        setRefId(result.reference); window.scrollTo(0, 0);
      })
      .catch((error) => setSubmitError(error instanceof Error && error.message ? error.message : t("Your request could not be sent. Your answers are still here — please try again.")))
      .finally(() => setSending(false));
  }

  function next() {
    if (!validate()) return;
    if (step === STEPS.length - 1) { submit(); return; }
    setStep(step + 1); window.scrollTo(0, 0);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">{t("Private Sessions")}</p>
      <h1 className="mt-4 text-5xl">{t("Book a Session")}</h1>
      <div className="gold-rule my-10" />
      {refId ? (
        <Confirmation title="Your Request Has Been Received" refId={refId}>
          {t("Session total {price} · 50% deposit {deposit}. This confirms receipt only — your booking is not yet confirmed. If accepted, you will be contacted privately to arrange the deposit and final details.", { price: money(price), deposit: money(deposit) })}
        </Confirmation>
      ) : (
        <div className="relative glass p-6 sm:p-10">
          <Honeypot value={honeypot} onChange={setHoneypot} />
          <Steps steps={STEPS} current={step} />
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-5 font-serif text-lg leading-relaxed">
                <p>{t("A private session is time spent entirely under My control. Arrive punctual, clean, and honest.")}</p>
                <p>{t("Limits are discussed before we begin and respected absolutely. Everything else is Mine to decide.")}</p>
                <p className="text-muted-foreground">{t("Rates: 1 hour {a} · 1.5 hours {b} · Overnight (in person only) {c}. A 50% deposit secures your booking, arranged privately once your request is accepted — nothing is paid through this site.", { a: money(140), b: money(200), c: money(600) })}</p>
                <p className="text-sm text-muted-foreground">{t("Your progress is kept only in this browser tab.")}</p>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("name", "Full Name")}{inp("pet", "Pet Name")}{inp("email", "Email", "email")}{inp("phone", "Contact Number", "tel")}{inp("age", "Age", "number")}{inp("location", "Location")}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-8">
                <div><span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Session Type")}</span>{choice("type", ["In-Person", "Online"])}</div>
                <div>
                  <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Duration")}</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[["1h", "1 Hour", money(140)], ["1.5h", "1.5 Hours", money(200)], ["overnight", "Overnight", money(600)], ["custom", "Custom Hours", t("{p}/hr", { p: money(CUSTOM_HOURLY) })]].filter(([id]) => !(f.type === "Online" && id === "overnight")).map(([id, l, p]) => (
                      <button type="button" key={id} aria-pressed={f.duration === id} onClick={() => setF({ ...f, duration: id ?? "1h" })}
                        className={`flex justify-between border px-4 py-3 text-sm transition ${f.duration === id ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"}`}>
                        <span>{t(l ?? "")}</span><span className="text-gold">{p}</span>
                      </button>
                    ))}
                  </div>
                  {f.duration === "custom" && <div className="mt-4">{inp("customHours", "Number of Hours", "number")}</div>}
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-6">
                  <span className="eyebrow">{t("Session Total")}</span>
                  <span className="font-serif text-4xl text-gold">{money(price)}</span>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                {f.type === "In-Person" && (
                  <Field label="Preferred Venue" error={err.venue}>
                    <select className="field" value={f.venue ?? ""} onChange={set("venue")} data-invalid={err.venue ? true : undefined} aria-invalid={err.venue ? true : undefined}>
                      <option value="">{t("Select…")}</option><option value="Private dungeon">{t("Private dungeon")}</option><option value="Vetted hotel">{t("Vetted hotel")}</option>
                    </select>
                  </Field>
                )}
                {f.type === "In-Person" && area("travel", "Travel details — how far will you travel, and from where?")}
                {f.type === "Online" && (
                  <>
                    <div>
                      <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Platform Preference")}</span>
                      {choice("platform", ["Skype", "Telegram", "Session"], false)}
                      {err.platform && <p role="alert" className="mt-1 text-xs text-danger">{err.platform}</p>}
                    </div>
                    {inp("handle", "Your username or ID on that platform")}
                    {inp("timezone", "Your time zone (for example GMT+1 or New York)")}
                    {area("setup", "Device & connection — camera, microphone, and a private space (optional)")}
                  </>
                )}
                {inp("dates", "Preferred Dates & Times")}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <Field label="Experience Level" error={err.experience}>
                  <select className="field" value={f.experience ?? ""} onChange={set("experience")} data-invalid={err.experience ? true : undefined} aria-invalid={err.experience ? true : undefined}>
                    <option value="">{t("Select…")}</option>{["Complete beginner", "Some experience", "Experienced", "Highly experienced"].map((o) => <option key={o} value={o}>{t(o)}</option>)}
                  </select>
                </Field>
                {area("dungeon", "Previous professional dungeon experience (optional)")}
                <div>
                  <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Activities Wishlist")}</span>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITIES.map((a) => (
                      <button type="button" key={a} aria-pressed={acts.includes(a)} onClick={() => setActs(acts.includes(a) ? acts.filter((x) => x !== a) : [...acts, a])}
                        className={`border px-3 py-1.5 text-xs transition ${acts.includes(a) ? "border-crimson bg-oxblood/40 text-foreground" : "border-input text-muted-foreground hover:border-gold-soft"}`}>
                        {t(a)}
                      </button>
                    ))}
                  </div>
                </div>
                {area("hard", "Hard Limits")}{area("soft", "Soft Limits")}{area("medical", "Medical / Health Alerts (optional — share only what affects safety)")}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <div className="grid gap-px bg-border sm:grid-cols-2">
                  <div className="bg-background p-5"><p className="eyebrow">{t("Session Total")}</p><p className="mt-2 font-serif text-3xl">{money(price)}</p></div>
                  <div className="bg-background p-5"><p className="eyebrow">{t("50% Deposit")}</p><p className="mt-2 font-serif text-3xl text-gold">{money(deposit)}</p></div>
                </div>
                <div className="border border-crimson bg-oxblood/40 p-4 text-sm shadow-[var(--glow-crimson)]">
                  {t("Bookings are strictly tentative until the 50% deposit has been arranged and confirmed privately.")}
                </div>
                <PaymentPicker value={pay} onChange={setPay} error={err.pay} />
              </div>
            )}
            {step === 6 && (
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
                          const value = relevantOnly(f)[key];
                          if (!value) return null;
                          return (
                            <div key={key} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                              <dt className="text-muted-foreground">{t(label)}</dt>
                              <dd className="break-words whitespace-pre-wrap">{key === "platform" ? value : t(value)}</dd>
                            </div>
                          );
                        })}
                        {group.step === 4 && acts.length > 0 && <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">{t("Activities Wishlist")}</dt><dd>{acts.map((a) => t(a)).join(", ")}</dd></div>}
                      </dl>
                    </div>
                  ))}
                  <div className="border border-border p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-gold">{t("Deposit")}</p>
                      <button type="button" className="text-xs text-gold underline" onClick={() => { setStep(5); window.scrollTo(0, 0); }}>{t("Edit")}</button>
                    </div>
                    <dl className="space-y-2 text-sm">
                      <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">{t("Session Total")}</dt><dd>{money(price)}</dd></div>
                      <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">{t("50% Deposit")}</dt><dd>{money(deposit)}</dd></div>
                      <div className="grid gap-1 sm:grid-cols-[160px_1fr]"><dt className="text-muted-foreground">{t("Payment Method")}</dt><dd>{pay ? t(({ giftcard: "Gift Card", bitcoin: "Bitcoin", paypal: "PayPal" } as Record<string, string>)[pay] ?? pay) : "—"}</dd></div>
                    </dl>
                  </div>
                </div>
                <PrivacyNote />
                <ConsentCheckbox checked={consent} onChange={setConsent} error={err.consent} />
                <SensitiveConsentCheckbox checked={sensitive} onChange={setSensitive} error={err.sensitiveConsent} />
              </div>
            )}
          </div>
          {submitError && <SubmitError message={submitError} onRetry={submit} />}
          <NavButtons step={step} last={step === STEPS.length - 1} onBack={() => setStep(step - 1)} onNext={next} sending={sending} nextLabel={step === 0 ? "Begin" : step === STEPS.length - 1 ? "Submit Request" : undefined} />
        </div>
      )}
    </section>
  );
}
