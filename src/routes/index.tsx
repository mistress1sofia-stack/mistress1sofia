import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { TRIBUTE_MIN } from "@/lib/pricing";
// Compressed hero portrait (WebP, 1080x1543, about 70 KB). To swap the photo, replace this file.
import portrait from "@/assets/hero-portrait.webp";

export const Route = createFileRoute("/")({
  // Every route must make an explicit sitemap decision.
  staticData: { sitemap: true },
  head: () => ({
    // Title, description, link-preview image and the adult-content label come from the root route.
    links: [
      { rel: "canonical", href: "https://mistresssofia.site/" },
      // Start loading the hero photo straight away: it is the largest thing on the page.
      { rel: "preload", as: "image", href: portrait, type: "image/webp", fetchPriority: "high" },
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

type Faq = { q: string; a: string; vars?: Record<string, string | number> };
const faqKeys: Faq[] = [
  { q: "What is the difference between applying to serve and booking a session?", a: "A session is a single, paid private appointment. Applying to serve is a request for long-term ownership and training — highly selective, screened carefully, and never guaranteed." },
  { q: "What are the session rates?", a: "1 hour: {a}  ·  1.5 hours: {b}  ·  Overnight (in person): {c}. Custom durations may be arranged." },
  { q: "Is a deposit or tribute required?", a: "Yes. A mandatory 50% deposit secures any session. Applications for consideration include an administrative tribute, a demonstration of your seriousness and respect. The more generous and respectful the offering, the more seriously your application will be considered." },
  { q: "How does the screening / application process work?", a: "Complete the relevant form honestly and in full. I review every submission personally. If you are deemed suitable, you will be contacted discreetly with next steps." },
  { q: "Do you accept beginners?", a: "Yes. New submissives will find My maturity guiding — but never soft. Honesty about your experience is required." },
  { q: "Where do sessions take place?", a: "In a private, discreet dungeon, a vetted hotel, or online via an agreed platform." },
  { q: "What protocol is expected from a submissive?", a: "Punctuality, cleanliness, respect, complete honesty about limits and health, and obedience. Address Me as Mistress at all times." },
];

function Index() {
  const { t, money } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqs = faqKeys.map((f) => ({ q: t(f.q), a: t(f.a, { a: money(140), b: money(200), c: money(600), min: money(TRIBUTE_MIN) }) }));
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-28">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">{t("Professional Dominatrix")}</p>
            <h1 className="mt-6 text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
              Mistress<br /><em className="text-gold">Sofia</em>
            </h1>
            <p className="mt-8 font-serif text-2xl italic text-muted-foreground">{t("Mature. Sensual. Sadistic.")}</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/book" className="btn-crimson">{t("Book a Session")}</Link>
              <Link to="/apply" className="btn-gold">{t("Apply to Serve")}</Link>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-3 border border-gold-soft/40" />
            <div className="relative aspect-[7/10] overflow-hidden">
              <img src={portrait} alt={t("Portrait of Mistress Sofia in a black gown and cap, holding a wooden cane")} width={1080} height={1543} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
              <div className="vignette absolute inset-0" />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 px-6 py-24">
        <div className="glass relative mx-auto max-w-3xl px-8 py-16 sm:px-16">
          <p className="eyebrow text-center">{t("About")}</p>
          <h2 className="mt-4 text-center text-4xl sm:text-5xl">{t("I Do Not Suffer Fools")}</h2>
          <div className="gold-rule my-8" />
          <div className="space-y-6 font-serif text-xl leading-relaxed text-foreground/90">
            <p>{t("I am Mistress Sofia — a mature, sensual, yet deeply Sadistic Dominatrix. I have spent many years training and controlling devoted slaves. Some arrived resistant. None remained so.")}</p>
            <p>{t("I can be cold, demanding, and unrelenting — and still you will find yourself devoted to Me. I do not suffer fools. I expect obedience, discipline, and complete honesty.")}</p>
            <p>{t("I am at My best with a cane in My hand or a slave beneath My boots. I will push limits, enforce standards, and demand excellence.")}</p>
            <p>{t("New submissives may find My maturity guiding, but never soft. I expect those who serve Me to be tested and refined.")}</p>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">{t("What I Offer")}</p>
          <h2 className="mt-4 text-5xl">{t("Disciplines & Offerings")}</h2>
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o, i) => (
              <div key={o} className="group flex items-start gap-4 bg-background p-6 transition hover:bg-card">
                <span className="font-serif text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm tracking-wide text-foreground/90 group-hover:text-foreground">{t(o)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boundaries */}
      <section id="boundaries" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-4xl border border-crimson bg-oxblood/30 p-10 shadow-[var(--glow-crimson)] sm:p-14">
          <p className="eyebrow">{t("What I Do Not Offer")}</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">{t("Strict Non-Negotiable Boundaries")}</h2>
          <ul className="mt-10 space-y-4">
            {limits.map((l) => (
              <li key={l} className="flex items-start gap-4 border-b border-crimson/40 pb-4 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" />
                {t(l)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="protocol" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{t("Protocol, Rates & Screening")}</p>
          <h2 className="mt-4 text-5xl">{t("Before You Approach")}</h2>
          <div className="mt-12 border-t border-border">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b border-border">
                <button className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={openFaq === i} aria-controls={`faq-${i}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-serif text-xl">{f.q}</span>
                  <span className={`text-gold transition-transform motion-reduce:transition-none ${openFaq === i ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                </button>
                {openFaq === i && <p id={`faq-${i}`} className="pb-6 text-sm leading-relaxed text-muted-foreground animate-in fade-in motion-reduce:animate-none">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-28 pt-8 text-center">
        <h2 className="text-4xl sm:text-5xl">{t("Kneel, or Leave.")}</h2>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/book" className="btn-crimson">{t("Book a Session")}</Link>
          <Link to="/apply" className="btn-gold">{t("Apply to Serve")}</Link>
        </div>
      </section>
    </>
  );
}
