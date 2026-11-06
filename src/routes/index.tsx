import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import portrait from "@/assets/hero-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mistress Sofia — Professional Dominatrix" },
      { name: "description", content: "Mature. Sensual. Sadistic. Private sessions and long-term service with Mistress Sofia. Strictly 18+." },
      { property: "og:title", content: "Mistress Sofia — Professional Dominatrix" },
      { property: "og:description", content: "Mature. Sensual. Sadistic. Private sessions and selective long-term service. 18+ only." },
    ],
  }),
  component: Index,
});

const offerings = [
  "Tie & tease, hogtie", "Sissy training, humiliation & degradation", "Foot, shoe & boot worship", "Bondage & restraint",
  "Nipple torture", "Breath play", "Ball busting & CBT", "Trampling", "Face slapping", "Role play",
  "Flogging, whipping, spanking, paddling & caning", "Chastity keyholding & orgasm control", "Feminization & pet training",
  "Wax play, deep heat, ice play", "Electric stimulation", "Sensory deprivation & solitary confinement",
  "Tickle torture & foot caning", "Needle play & stapling",
];

const limits = [
  "Bodily worship of any kind except My feet", "Face sitting", "Hard sports", "Smoking", "Anal play",
  "Hand relief (Self-touch only under My direct command)",
];

const faqs = [
  { q: "What is the difference between applying to serve and booking a session?", a: "A session is a single, paid private appointment. Applying to serve is a request for long-term ownership and training — highly selective, screened carefully, and never guaranteed." },
  { q: "What are the session rates?", a: "1 hour: £140  ·  1.5 hours: £200  ·  Overnight: £600. Custom durations may be arranged." },
  { q: "Is a deposit or tribute required?", a: "Yes. A mandatory 50% deposit secures any session. Applications for consideration require a £100 minimum administrative tribute." },
  { q: "How does the screening / application process work?", a: "Complete the relevant form honestly and in full. I review every submission personally. If you are deemed suitable, you will be contacted discreetly with next steps." },
  { q: "Do you accept beginners?", a: "Yes. New submissives will find My maturity guiding — but never soft. Honesty about your experience is required." },
  { q: "Where do sessions take place?", a: "In a private, discreet dungeon, a vetted hotel, or online via an agreed platform." },
  { q: "What protocol is expected from a submissive?", a: "Punctuality, cleanliness, respect, complete honesty about limits and health, and obedience. Address Me as Mistress at all times." },
];

function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-28">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">Professional Dominatrix</p>
            <h1 className="mt-6 text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Mistress<br /><em className="text-gold">Sofia</em>
            </h1>
            <p className="mt-8 font-serif text-2xl italic text-muted-foreground">Mature. Sensual. Sadistic.</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/book" className="btn-crimson">Book a Private Session</Link>
              <Link to="/apply" className="btn-gold">Apply for Consideration</Link>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-3 border border-gold-soft/40" />
            <div className="relative aspect-[7/10] overflow-hidden">
              <img src={portrait} alt="Mistress Sofia seated on a velvet throne" width={896} height={1280} className="h-full w-full object-cover" />
              <div className="vignette absolute inset-0" />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 px-6 py-24">
        <div className="glass relative mx-auto max-w-3xl px-8 py-16 sm:px-16">
          <span className="absolute left-6 top-2 font-serif text-8xl text-crimson">“</span>
          <p className="eyebrow text-center">About</p>
          <h2 className="mt-4 text-center text-4xl sm:text-5xl">I Do Not Suffer Fools</h2>
          <div className="gold-rule my-8" />
          <div className="space-y-6 font-serif text-xl leading-relaxed text-foreground/90">
            <p>I am Mistress Sofia — a mature, sensual, yet deeply Sadistic Dominatrix. I have spent many years training and controlling devoted slaves. Some arrived resistant. None remained so.</p>
            <p>I can be cold, demanding, and unrelenting — and still you will find yourself devoted to Me. I do not suffer fools. I expect obedience, discipline, and complete honesty.</p>
            <p>I am at My best with a cane in My hand or a slave beneath My boots. I will push limits, enforce standards, and demand excellence.</p>
            <p>New submissives may find My maturity guiding, but never soft. I expect those who serve Me to be tested and refined.</p>
          </div>
          <span className="absolute bottom-0 right-6 font-serif text-8xl text-crimson">”</span>
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">What I Offer</p>
          <h2 className="mt-4 text-5xl">Disciplines & Offerings</h2>
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o, i) => (
              <div key={o} className="group flex items-start gap-4 bg-background p-6 transition hover:bg-card">
                <span className="font-serif text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm tracking-wide text-foreground/90 group-hover:text-foreground">{o}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boundaries */}
      <section id="boundaries" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-4xl border border-crimson bg-oxblood/30 p-10 shadow-[var(--glow-crimson)] sm:p-14">
          <p className="eyebrow">What I Do Not Offer</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">Strict Non-Negotiable Boundaries</h2>
          <ul className="mt-10 space-y-4">
            {limits.map((l) => (
              <li key={l} className="flex items-start gap-4 border-b border-crimson/40 pb-4 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="protocol" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Protocol, Rates & Screening</p>
          <h2 className="mt-4 text-5xl">Before You Approach</h2>
          <div className="mt-12 border-t border-border">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b border-border">
                <button className="flex w-full items-center justify-between gap-6 py-6 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-serif text-xl">{f.q}</span>
                  <span className={`text-gold transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && <p className="pb-6 text-sm leading-relaxed text-muted-foreground animate-in fade-in">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 pt-8 text-center">
        <h2 className="text-4xl sm:text-5xl">Kneel, or Leave.</h2>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/book" className="btn-crimson">Book a Session</Link>
          <Link to="/apply" className="btn-gold">Apply to Serve</Link>
        </div>
      </section>
    </>
  );
}
