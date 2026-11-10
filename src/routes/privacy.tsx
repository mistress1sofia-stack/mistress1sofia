import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/config";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Notice — Mistress Sofia" },
      { name: "description", content: "How applications and booking requests are stored, who reads them, how long they are kept, and how to request deletion." },
      { property: "og:title", content: "Privacy Notice — Mistress Sofia" },
      { property: "og:description", content: "How your submissions are stored, reviewed and deleted." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">Your Privacy</p>
      <h1 className="mt-4 text-5xl">Privacy Notice</h1>
      <div className="gold-rule my-10" />
      <div className="space-y-10 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 className="text-2xl text-gold">What is collected</h2>
          <p className="mt-4">
            When you complete the application or booking form, the answers you type are stored: your name, contact
            details, age, and your answers about experience, preferences and tribute or session choices. The booking
            form also asks about health, limits and preferences. These sensitive details are requested only because
            they affect your safety and the planning of any session — share only what genuinely matters. Both forms
            ask for your explicit consent before anything is stored.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-gold">Who reads it</h2>
          <p className="mt-4">
            Your submission goes to a private inbox that only Mistress Sofia can access. It is never published, sold,
            or shared with anyone else.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-gold">How long it is kept</h2>
          <ul className="mt-4 list-none space-y-3">
            <li className="flex items-start gap-4"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" />Declined requests are deleted straight after the decision.</li>
            <li className="flex items-start gap-4"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" />Undecided requests are deleted automatically after 90 days.</li>
            <li className="flex items-start gap-4"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" />Accepted requests are kept until Mistress Sofia deletes them or you ask for deletion.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl text-gold">How to request deletion</h2>
          <p className="mt-4">
            Email {CONTACT_EMAIL} with the reference ID shown on your confirmation screen, and your submission will
            be deleted. You may do this at any time, whatever the status of your request.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-gold">Adults only</h2>
          <p className="mt-4">
            This site is strictly for adults aged 18 or over (or of legal age in your jurisdiction). No information is
            knowingly collected from anyone under 18.
          </p>
        </div>
      </div>
    </section>
  );
}
