import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms, Deposits & Cancellations — Mistress Sofia" },
      { name: "description", content: "Terms for sessions with Mistress Sofia: deposits, cancellations, no-shows, safety and consent. Adults 18+ only." },
      { property: "og:title", content: "Terms, Deposits & Cancellations — Mistress Sofia" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/terms" }],
  }),
  component: Terms,
});

type Tx = { en: string; de: string; fr: string };

// ---- Owner settings: change these numbers to change the policy everywhere on the page.
const NOTICE_HOURS = 48; // cancellation notice required
const LATE_MINUTES = 15; // wait time before a late session is treated as a no-show

const UI = {
  eyebrow: { en: "Please Read", de: "Bitte lesen", fr: "À lire attentivement" },
  title: { en: "Terms, Deposits & Cancellations", de: "Bedingungen, Anzahlungen & Stornierungen", fr: "Conditions, acomptes & annulations" },
  intro: {
    en: "By applying to serve Me or booking a session, you confirm that you have read and accepted these terms.",
    de: "Mit Ihrer Bewerbung zum Dienen oder der Buchung einer Session bestätigen Sie, diese Bedingungen gelesen und akzeptiert zu haben.",
    fr: "En postulant pour Me servir ou en réservant une séance, vous confirmez avoir lu et accepté ces conditions.",
  },
  updated: { en: "Last updated: November 2026", de: "Zuletzt aktualisiert: November 2026", fr: "Dernière mise à jour : novembre 2026" },
  back: { en: "Read the Protocol & Rules", de: "Protokoll & Regeln lesen", fr: "Lire le protocole & les règles" },
  book: { en: "Book a Session", de: "Session buchen", fr: "Réserver une séance" },
} satisfies Record<string, Tx>;

const SECTIONS: { title: Tx; text: Tx }[] = [
  {
    title: { en: "Adults only", de: "Nur für Erwachsene", fr: "Réservé aux adultes" },
    text: {
      en: "You must be at least 18 years old, or the age of majority where you live. I may ask for proof of age at any time.",
      de: "Sie müssen mindestens 18 Jahre alt sein, oder volljährig nach dem Recht Ihres Wohnorts. Ich kann jederzeit einen Altersnachweis verlangen.",
      fr: "Vous devez avoir au moins 18 ans, ou l'âge de la majorité là où vous vivez. Je peux exiger une preuve d'âge à tout moment.",
    },
  },
  {
    title: { en: "Requests are not bookings", de: "Anfragen sind keine Buchungen", fr: "Une demande n'est pas une réservation" },
    text: {
      en: "Submitting a form is a request only. A session or an application is confirmed only when I accept it personally. I may decline any request without giving a reason.",
      de: "Das Absenden eines Formulars ist nur eine Anfrage. Eine Session oder Bewerbung ist erst bestätigt, wenn Ich sie persönlich annehme. Ich kann jede Anfrage ohne Begründung ablehnen.",
      fr: "L'envoi d'un formulaire n'est qu'une demande. Une séance ou une candidature n'est confirmée que lorsque Je l'accepte personnellement. Je peux refuser toute demande sans donner de raison.",
    },
  },
  {
    title: { en: "Deposits and payment", de: "Anzahlungen und Zahlung", fr: "Acomptes et paiement" },
    text: {
      en: "Nothing is paid through this website. If I accept your request, I will send private payment instructions. A deposit may be required to secure your time, and it must be received by the deadline I give you, or the time is released. A deposit secures a booked session; a tribute is the pledge made with an application.",
      de: "Über diese Website wird nichts bezahlt. Wenn Ich Ihre Anfrage annehme, sende Ich Ihnen private Zahlungsanweisungen. Zur Sicherung Ihres Termins kann eine Anzahlung verlangt werden; sie muss bis zu der von Mir genannten Frist eingehen, sonst wird der Termin freigegeben. Eine Anzahlung sichert eine gebuchte Session; ein Tribut ist das Versprechen, das mit einer Bewerbung abgegeben wird.",
      fr: "Rien n'est payé via ce site. Si J'accepte votre demande, Je vous enverrai des instructions de paiement privées. Un acompte peut être exigé pour réserver votre créneau et doit être reçu avant l'échéance que Je fixe, faute de quoi le créneau est libéré. Un acompte garantit une séance réservée ; un tribut est l'engagement pris avec une candidature.",
    },
  },
  {
    title: { en: "Cancellations", de: "Stornierungen", fr: "Annulations" },
    text: {
      en: `Give at least ${NOTICE_HOURS} hours' notice to cancel or reschedule. With proper notice, a deposit may be moved to a new date once, at My discretion. With less notice than this, the deposit is forfeited.`,
      de: `Stornierungen oder Verschiebungen sind mindestens ${NOTICE_HOURS} Stunden vorher mitzuteilen. Bei rechtzeitiger Mitteilung kann eine Anzahlung nach Meinem Ermessen einmal auf einen neuen Termin übertragen werden. Bei kürzerer Vorankündigung verfällt die Anzahlung.`,
      fr: `Prévenez au moins ${NOTICE_HOURS} heures à l'avance pour annuler ou reporter. Avec un préavis suffisant, un acompte peut être reporté une fois sur une nouvelle date, à Ma discrétion. Avec un préavis plus court, l'acompte est perdu.`,
    },
  },
  {
    title: { en: "Lateness and no-shows", de: "Verspätung und Nichterscheinen", fr: "Retards et absences" },
    text: {
      en: `If you are more than ${LATE_MINUTES} minutes late without notice, it is a no-show. The deposit is forfeited and the session may not be rebooked. The session still ends at the scheduled time.`,
      de: `Wenn Sie ohne Nachricht mehr als ${LATE_MINUTES} Minuten zu spät kommen, gilt das als Nichterscheinen. Die Anzahlung verfällt und die Session wird möglicherweise nicht neu angesetzt. Die Session endet dennoch zur geplanten Zeit.`,
      fr: `Si vous avez plus de ${LATE_MINUTES} minutes de retard sans prévenir, c'est une absence. L'acompte est perdu et la séance peut ne pas être reprogrammée. La séance se termine tout de même à l'heure prévue.`,
    },
  },
  {
    title: { en: "If I must cancel", de: "Wenn Ich absagen muss", fr: "Si Je dois annuler" },
    text: {
      en: "If I have to cancel, your deposit is moved to a new date of your choice or returned in full.",
      de: "Wenn Ich absagen muss, wird Ihre Anzahlung auf einen Termin Ihrer Wahl übertragen oder vollständig zurückerstattet.",
      fr: "Si Je dois annuler, votre acompte est reporté à la date de votre choix ou intégralement remboursé.",
    },
  },
  {
    title: { en: "Consent, limits and safety", de: "Einverständnis, Grenzen und Sicherheit", fr: "Consentement, limites et sécurité" },
    text: {
      en: "Everything is consensual, negotiated beforehand, and within the limits we agree. A safeword ends the activity at once. You confirm that you are in good health and sober, and you take responsibility for the accuracy of what you tell Me.",
      de: "Alles geschieht einvernehmlich, vorab verhandelt und innerhalb der vereinbarten Grenzen. Ein Safeword beendet die Aktivität sofort. Sie bestätigen, gesund und nüchtern zu sein, und tragen die Verantwortung für die Richtigkeit Ihrer Angaben.",
      fr: "Tout est consenti, négocié au préalable et dans les limites convenues. Un mot de sécurité met fin à l'activité immédiatement. Vous confirmez être en bonne santé et sobre, et vous êtes responsable de l'exactitude de ce que vous Me dites.",
    },
  },
  {
    title: { en: "Entertainment and roleplay", de: "Unterhaltung und Rollenspiel", fr: "Divertissement et jeu de rôle" },
    text: {
      en: "Sessions are consensual adult roleplay and entertainment. Nothing I offer is sexual service, medical, therapeutic or legal advice.",
      de: "Sessions sind einvernehmliches Rollenspiel und Unterhaltung unter Erwachsenen. Nichts, was Ich anbiete, ist eine sexuelle Dienstleistung oder medizinische, therapeutische oder rechtliche Beratung.",
      fr: "Les séances sont du jeu de rôle et du divertissement consentis entre adultes. Rien de ce que Je propose n'est un service sexuel, ni un conseil médical, thérapeutique ou juridique.",
    },
  },
  {
    title: { en: "Privacy and recording", de: "Datenschutz und Aufzeichnung", fr: "Confidentialité et enregistrement" },
    text: {
      en: "I protect your privacy as My privacy notice states. You may not record, screenshot or share any session or message without My written permission.",
      de: "Ich schütze Ihre Privatsphäre, wie es Meine Datenschutzerklärung festhält. Sie dürfen keine Session oder Nachricht ohne Meine schriftliche Erlaubnis aufzeichnen, screenshotten oder weitergeben.",
      fr: "Je protège votre vie privée comme l'indique Ma politique de confidentialité. Vous ne pouvez enregistrer, capturer ou partager aucune séance ni aucun message sans Mon autorisation écrite.",
    },
  },
  {
    title: { en: "Right to refuse or end", de: "Recht auf Ablehnung oder Beendigung", fr: "Droit de refuser ou de mettre fin" },
    text: {
      en: "I may refuse or end any session at any time if I feel disrespected, unsafe, or if these terms or My protocol are broken. In that case the deposit is not returned.",
      de: "Ich kann jede Session jederzeit ablehnen oder beenden, wenn Ich Respektlosigkeit oder Unsicherheit empfinde oder diese Bedingungen oder Mein Protokoll verletzt werden. In diesem Fall wird die Anzahlung nicht zurückerstattet.",
      fr: "Je peux refuser ou interrompre toute séance à tout moment si Je Me sens manquée de respect, en insécurité, ou si ces conditions ou Mon protocole sont enfreints. Dans ce cas, l'acompte n'est pas remboursé.",
    },
  },
];

function Terms() {
  const { lang } = useI18n();
  const L = (x: Tx) => x[lang];
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">{L(UI.eyebrow)}</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">{L(UI.title)}</h1>
      <div className="gold-rule my-10" />
      <p className="text-base leading-relaxed text-foreground/90">{L(UI.intro)}</p>
      <p className="mt-2 text-xs text-muted-foreground">{L(UI.updated)}</p>

      <ol className="mt-12 space-y-6">
        {SECTIONS.map((s, i) => (
          <li key={s.title.en} className="glass p-6 sm:p-8">
            <h2 className="text-2xl text-gold">
              <span className="mr-3 font-serif text-gold/60" aria-hidden="true">{i + 1}.</span>
              {L(s.title)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{L(s.text)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14 flex flex-col justify-center gap-4 border-t border-border pt-10 sm:flex-row">
        <Link to="/protocol" className="btn-gold">{L(UI.back)}</Link>
        <Link to="/book" className="btn-crimson">{L(UI.book)}</Link>
      </div>
    </section>
  );
}
