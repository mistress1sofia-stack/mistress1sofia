import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { saveSubmission } from "@/lib/submit";
import { Confirmation, Field, makeRef, NavButtons, PaymentPicker, Steps, type PayMethod } from "@/components/site/FormKit";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for Consideration — Mistress Sofia" },
      { name: "description", content: "Apply for long-term service under Mistress Sofia. Highly selective. 18+ only." },
      { property: "og:title", content: "Apply for Consideration — Mistress Sofia" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "A selective application for long-term service and training." },
    ],
  }),
  component: Apply,
});

const STEPS = ["Introduction", "Personal Details", "Physical", "Background", "Tribute", "Commitment"];
type F = Partial<Record<"name"|"pet"|"email"|"phone"|"age"|"location"|"city"|"sex"|"marital"|"orientation"|"height"|"weight"|"chest"|"waist"|"hips"|"children"|"education"|"occupation"|"religion"|"convDetail"|"amount"|"code"|"why"|"obey"|"ack"|"pay"|"type"|"duration"|"customHours"|"venue"|"travel"|"dates"|"platform"|"experience"|"dungeon"|"hard"|"soft"|"medical", string>>;
type K = keyof F;

function Apply() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<F>({});
  const [conv, setConv] = useState(false);
  const [pay, setPay] = useState<PayMethod | "">("");
  const [obey, setObey] = useState(false);
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState<F>({});
  const [refId, setRefId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const set = (k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const inp = (k: K, label: string, type = "text") => (
    <Field label={label} error={err[k]}><input type={type} className="field" value={f[k] ?? ""} onChange={set(k)} /></Field>
  );
  const sel = (k: K, label: string, opts: string[]) => (
    <Field label={label} error={err[k]}>
      <select className="field" value={f[k] ?? ""} onChange={set(k)}>
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
    if (step === 2) (["height", "weight"] as K[]).forEach(req);
    if (step === 3) { (["occupation"] as K[]).forEach(req); if (conv && !f.convDetail?.trim()) e.convDetail = "Please provide details"; }
    if (step === 4) {
      if (!f.amount || Number(f.amount) < 100) e.amount = "Minimum tribute is £100";
      if (!pay) e.pay = "Select a payment method";
      if (pay === "giftcard" && !f.code?.trim()) e.code = "Enter the card code";
    }
    if (step === 5) {
      if (!obey) e.obey = "Required";
      if (!f.why || f.why.trim().length < 30) e.why = "Please write at least a few sentences";
      if (!ack) e.ack = "Required";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step === STEPS.length - 1) {
      const ref = makeRef("MS-APP");
      setSending(true);
      saveSubmission("applications", ref, { ...f, convicted: conv, pay, obey, ack })
        .then(() => { setRefId(ref); window.scrollTo(0, 0); })
        .catch(() => alert("Submission failed. Please try again."))
        .finally(() => setSending(false));
      return;
    }
    setStep(step + 1); window.scrollTo(0, 0);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Long-Term Service</p>
      <h1 className="mt-4 text-5xl">Apply for Consideration</h1>
      <div className="gold-rule my-10" />
      {refId ? (
        <Confirmation title="Your Application Is Under Review" refId={refId}>
          Keep this reference. Your tribute must clear before your application is considered. If you are found suitable, you will be contacted discreetly. Do not chase.
        </Confirmation>
      ) : (
        <div className="glass p-6 sm:p-10">
          <Steps steps={STEPS} current={step} />
          <div className="space-y-6">
            {step === 0 && (
              <div className="space-y-5 font-serif text-lg leading-relaxed">
                <p>Service to Me is a privilege, not a transaction. I accept very few into long-term training.</p>
                <p>I expect devotion, discipline, and absolute honesty. Every answer you give will be read by Me personally — falsehood ends your consideration immediately.</p>
                <p className="text-muted-foreground">Complete each step in full. A minimum £100 administrative tribute is required for your application to be reviewed.</p>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("name", "Full Name")}{inp("pet", "Pet Name")}{inp("email", "Email", "email")}{inp("phone", "Phone", "tel")}
                {inp("age", "Age", "number")}{inp("city", "City / Country")}
                {sel("sex", "Sex", ["Male", "Female", "Non-binary", "Other"])}
                {sel("marital", "Marital Status", ["Single", "In a relationship", "Married", "Divorced", "Other"])}
                {sel("orientation", "Sexual Orientation", ["Straight", "Gay", "Bisexual", "Other", "Prefer not to say"])}
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {inp("height", "Height")}{inp("weight", "Weight")}{inp("chest", "Chest")}{inp("waist", "Waist")}{inp("hips", "Hips")}{inp("children", "Number of Children", "number")}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">{inp("education", "Education")}{inp("occupation", "Occupation")}{inp("religion", "Religion")}</div>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={conv} onChange={(e) => setConv(e.target.checked)} className="accent-[var(--crimson)]" />
                  I have a criminal conviction
                </label>
                {conv && <Field label="Conviction Details" error={err.convDetail}><textarea rows={3} className="field" value={f.convDetail ?? ""} onChange={set("convDetail")} /></Field>}
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <Field label="Tribute Amount (£, minimum 100)" error={err.amount}>
                  <input type="number" min={100} className="field" value={f.amount ?? ""} onChange={set("amount")} />
                </Field>
                <PaymentPicker value={pay} onChange={setPay} code={f.code ?? ""} onCode={(v) => setF({ ...f, code: v })} error={err.pay ?? err.code} />
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={obey} onChange={(e) => setObey(e.target.checked)} className="mt-1 accent-[var(--crimson)]" />
                  I am willing to offer 100% obedience to Mistress Sofia within negotiated limits.
                </label>
                {err.obey && <p className="text-xs text-destructive">{err.obey}</p>}
                <Field label="Why do you seek to serve Mistress Sofia?" error={err.why}>
                  <textarea rows={7} className="field" value={f.why ?? ""} onChange={set("why")} />
                </Field>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1 accent-[var(--crimson)]" />
                  I formally acknowledge that all information provided is true, that I am over 18, and that submission does not guarantee acceptance.
                </label>
                {err.ack && <p className="text-xs text-destructive">{err.ack}</p>}
              </div>
            )}
          </div>
          <NavButtons step={step} last={step === STEPS.length - 1} onBack={() => setStep(step - 1)} onNext={sending ? () => {} : next} nextLabel={step === 0 ? "Begin" : undefined} />
        </div>
      )}
    </section>
  );
}
