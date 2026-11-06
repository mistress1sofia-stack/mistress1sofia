import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { saveSubmission } from "@/lib/submit";
import { Confirmation, ConsentCheckbox, Field, makeRef, NavButtons, PaymentPicker, PrivacyNote, Steps, SubmitError, type PayMethod } from "@/components/site/FormKit";
import { sessionPrice, CUSTOM_HOURLY } from "@/lib/pricing";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Session — Mistress Sofia" },
      { name: "description", content: "Request a private in-person or online session with Mistress Sofia. 50% deposit arranged privately. 18+ only." },
      { property: "og:title", content: "Book a Session — Mistress Sofia" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Private sessions from £140. Requests are tentative until the deposit is arranged privately." },
    ],
  }),
  component: Book,
});

const STEPS = ["Protocol", "Client Profile", "Session", "Venue & Logistics", "Limits", "Deposit"];
const ACTIVITIES = ["Bondage & restraint", "Foot, shoe & boot worship", "Flogging & caning", "Humiliation", "Chastity & orgasm control", "Feminization", "Wax & ice play", "Electric stimulation", "Sensory deprivation", "CBT", "Trampling", "Role play"];
type F = Partial<Record<"name"|"pet"|"email"|"phone"|"age"|"location"|"pay"|"type"|"duration"|"customHours"|"venue"|"travel"|"dates"|"platform"|"experience"|"dungeon"|"hard"|"soft"|"medical"|"consent", string>>;
type K = keyof F;

function Book() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({ type: "In-Person", duration: "1h" });
  const [acts, setActs] = useState<string[]>([]);
  const [pay, setPay] = useState<PayMethod | "">("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<F>({});
  const [refId, setRefId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const price = sessionPrice(f.duration as never, Number(f.customHours) || 0);
  const deposit = Math.round(price / 2);

  const set = (k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const inp = (k: K, label: string, type = "text") => (
    <Field label={label} error={err[k]}><input type={type} className="field" value={f[k] ?? ""} onChange={set(k)} /></Field>
  );
  const area = (k: K, label: string) => (
    <Field label={label} error={err[k]}><textarea rows={3} className="field" value={f[k] ?? ""} onChange={set(k)} /></Field>
  );
  const choice = (k: K, opts: string[]) => (
    <div className="flex flex-wrap gap-3">
      {opts.map((o) => (
        <button type="button" key={o} aria-pressed={f[k] === o} onClick={() => setF({ ...f, [k]: o })}
          className={`border px-4 py-2 text-sm transition ${f[k] === o ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"}`}>
          {o}
        </button>
      ))}
    </div>
  );

  function validate() {
    const e: F = {};
    const req = (k: K) => { if (!f[k]?.trim()) e[k] = "Required"; };
    if (step === 1) {
      (["name", "email", "phone", "age", "location"] as K[]).forEach(req);
      if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
      if (f.age && Number(f.age) < 18) e.age = "You must be 18 or older";
    }
    if (step === 2 && f.duration === "custom" && !(Number(f.customHours) > 0)) e.customHours = "Enter number of hours";
    if (step === 3) { if (f.type === "In-Person") req("venue"); if (f.type === "Online") req("platform"); }
    if (step === 4) req("experience");
    if (step === 5) { if (!pay) e.pay = "Select a payment method"; if (!consent) e.consent = "Consent is required to submit"; }
    setErr(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    const ref = makeRef("MS-BKG");
    setSending(true);
    setSubmitError("");
    saveSubmission("booking_requests", ref, { ...f, pay, activities: acts, consent })
      .then(() => { setRefId(ref); window.scrollTo(0, 0); })
      .catch(() => setSubmitError("Your request could not be sent. Your answers are still here — please try again."))
      .finally(() => setSending(false));
  }

  function next() {
    if (!validate()) return;
    if (step === STEPS.length - 1) { submit(); return; }
    setStep(step + 1); window.scrollTo(0, 0);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Private Sessions</p>
      <h1 className="mt-4 text-5xl">Book a Session</h1>
      <div className="gold-rule my-10" />
      {refId ? (
        <Confirmation title="Your Request Has Been Received" refId={refId}>
          Session total £{price} · 50% deposit £{deposit}. This confirms receipt only — your booking is not yet
          confirmed. If accepted, you will be contacted privately to arrange the deposit and final details.
        </Confirmation>
      ) : (
        <div className="glass p-6 sm:p-10">
          <Steps steps={STEPS} current={step} />
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-5 font-serif text-lg leading-relaxed">
                <p>A private session is time spent entirely under My control. Arrive punctual, clean, and honest.</p>
                <p>Limits are discussed before we begin and respected absolutely. Everything else is Mine to decide.</p>
                <p className="text-muted-foreground">Rates: 1 hour £140 · 1.5 hours £200 · Overnight £600. A 50% deposit secures your booking, arranged privately once your request is accepted — nothing is paid through this site.</p>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("name", "Full Name")}{inp("pet", "Pet Name")}{inp("email", "Email", "email")}{inp("phone", "Contact Number", "tel")}{inp("age", "Age", "number")}{inp("location", "Location")}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-8">
                <div><span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Session Type</span>{choice("type", ["In-Person", "Online"])}</div>
                <div>
                  <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Duration</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[["1h", "1 Hour", "£140"], ["1.5h", "1.5 Hours", "£200"], ["overnight", "Overnight", "£600"], ["custom", "Custom Hours", `£${CUSTOM_HOURLY}/hr`]].map(([id, l, p]) => (
                      <button type="button" key={id} aria-pressed={f.duration === id} onClick={() => setF({ ...f, duration: id ?? "1h" })}
                        className={`flex justify-between border px-4 py-3 text-sm transition ${f.duration === id ? "border-crimson bg-oxblood/40 shadow-[var(--glow-crimson)]" : "border-input hover:border-gold-soft"}`}>
                        <span>{l}</span><span className="text-gold">{p}</span>
                      </button>
                    ))}
                  </div>
                  {f.duration === "custom" && <div className="mt-4">{inp("customHours", "Number of Hours", "number")}</div>}
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-6">
                  <span className="eyebrow">Session Total</span>
                  <span className="font-serif text-4xl text-gold">£{price}</span>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                {f.type === "In-Person" && (
                  <Field label="Preferred Venue" error={err.venue}>
                    <select className="field" value={f.venue ?? ""} onChange={set("venue")}>
                      <option value="">Select…</option><option>Private dungeon</option><option>Vetted hotel</option>
                    </select>
                  </Field>
                )}
                {area("travel", "Travel details — how far will you travel, and from where?")}
                {inp("dates", "Preferred Dates & Times")}
                {f.type === "Online" && (
                  <div>
                    <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Platform Preference</span>
                    {choice("platform", ["Skype", "Telegram", "Session"])}
                    {err.platform && <p role="alert" className="mt-1 text-xs text-destructive">{err.platform}</p>}
                  </div>
                )}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <Field label="Experience Level" error={err.experience}>
                  <select className="field" value={f.experience ?? ""} onChange={set("experience")}>
                    <option value="">Select…</option><option>Complete beginner</option><option>Some experience</option><option>Experienced</option><option>Highly experienced</option>
                  </select>
                </Field>
                {area("dungeon", "Previous professional dungeon experience (optional)")}
                <div>
                  <span className="mb-3 block text-[0.65rem] uppercase tracking-[0.25em] text-gold">Activities Wishlist</span>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITIES.map((a) => (
                      <button type="button" key={a} aria-pressed={acts.includes(a)} onClick={() => setActs(acts.includes(a) ? acts.filter((x) => x !== a) : [...acts, a])}
                        className={`border px-3 py-1.5 text-xs transition ${acts.includes(a) ? "border-crimson bg-oxblood/40 text-foreground" : "border-input text-muted-foreground hover:border-gold-soft"}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                {area("hard", "Hard Limits")}{area("soft", "Soft Limits")}{area("medical", "Medical / Health Alerts (optional — share only what affects safety)")}
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="bg-background p-5"><p className="eyebrow">Session Total</p><p className="mt-2 font-serif text-3xl">£{price}</p></div>
                  <div className="bg-background p-5"><p className="eyebrow">50% Deposit</p><p className="mt-2 font-serif text-3xl text-gold">£{deposit}</p></div>
                </div>
                <div className="border border-crimson bg-oxblood/40 p-4 text-sm shadow-[var(--glow-crimson)]">
                  Bookings are strictly tentative until the 50% deposit has been arranged and confirmed privately.
                </div>
                <PaymentPicker value={pay} onChange={setPay} error={err.pay} />
                <PrivacyNote />
                <ConsentCheckbox checked={consent} onChange={setConsent} error={err.consent} />
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
