import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/protocol")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Protocol & Rules — Mistress Sofia" },
      { name: "description", content: "The rules and protocol Mistress Sofia expects from anyone who applies to serve or books a session. Read before you approach. Adults 18+ only." },
      { property: "og:title", content: "Protocol & Rules — Mistress Sofia" },
      { property: "og:type", content: "website" },
      // The link-preview image (og:image) comes from the root route.
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/protocol" }],
  }),
  component: Protocol,
});

type Tx = { en: string; de: string; fr: string };

const UI = {
  eyebrow: { en: "Before You Approach", de: "Bevor Sie sich nähern", fr: "Avant de vous approcher" },
  title: { en: "Protocol & Rules", de: "Protokoll & Regeln", fr: "Protocole & règles" },
  intro: {
    en: "These are My rules. They are not suggestions. Everyone who applies to serve Me, or books a session, is expected to have read them and to keep them. If you cannot, do not apply.",
    de: "Dies sind Meine Regeln. Sie sind keine Vorschläge. Von jedem, der sich bewirbt, Mir zu dienen, oder eine Session bucht, wird erwartet, dass er sie gelesen hat und einhält. Wenn Sie das nicht können, bewerben Sie sich nicht.",
    fr: "Voici Mes règles. Ce ne sont pas des suggestions. Quiconque postule pour Me servir, ou réserve une séance, est censé les avoir lues et les respecter. Si vous ne le pouvez pas, ne postulez pas.",
  },
  endsTitle: { en: "What Ends Your Consideration", de: "Was Ihre Prüfung beendet", fr: "Ce qui met fin à votre candidature" },
  endsIntro: { en: "Any of these ends your request immediately, with no second chance:", de: "Jedes dieser Dinge beendet Ihre Anfrage sofort, ohne zweite Chance:", fr: "L'un de ces comportements met fin à votre demande immédiatement, sans seconde chance :" },
  ctaTitle: { en: "If You Can Keep These, Prove It", de: "Wenn Sie dies einhalten können, beweisen Sie es", fr: "Si vous pouvez les respecter, prouvez-le" },
  apply: { en: "Apply to Serve", de: "Bewerbung zum Dienen", fr: "Postuler pour servir" },
  book: { en: "Book a Session", de: "Session buchen", fr: "Réserver une séance" },
} satisfies Record<string, Tx>;

const RULES: { title: Tx; text: Tx }[] = [
  {
    title: { en: "Address Me properly", de: "Sprechen Sie Mich richtig an", fr: "Adressez-vous à Moi correctement" },
    text: {
      en: "Address Me as Mistress, in every message and in every session. Capitalise My name. Never use a casual tone, a pet name for Me, or a nickname.",
      de: "Sprechen Sie Mich stets mit „Herrin“ an, in jeder Nachricht und jeder Session. Schreiben Sie Meinen Namen groß. Verwenden Sie niemals einen lockeren Ton, einen Kosenamen für Mich oder einen Spitznamen.",
      fr: "Adressez-vous à Moi en disant « Maîtresse », dans chaque message et chaque séance. Mettez Mon nom en majuscule. N'employez jamais un ton familier, un petit nom ou un surnom pour Moi.",
    },
  },
  {
    title: { en: "Read before you approach", de: "Lesen Sie, bevor Sie sich nähern", fr: "Lisez avant de vous approcher" },
    text: {
      en: "Everything you need is on this website. Read it fully. I do not answer questions about rates, availability or process that the website already answers.",
      de: "Alles, was Sie brauchen, steht auf dieser Website. Lesen Sie sie vollständig. Ich beantworte keine Fragen zu Preisen, Verfügbarkeit oder Ablauf, die die Website bereits beantwortet.",
      fr: "Tout ce dont vous avez besoin se trouve sur ce site. Lisez-le intégralement. Je ne réponds pas aux questions sur les tarifs, les disponibilités ou le déroulement auxquelles le site répond déjà.",
    },
  },
  {
    title: { en: "Be honest", de: "Seien Sie ehrlich", fr: "Soyez honnête" },
    text: {
      en: "Complete honesty about your experience, your limits and your health. A lie ends your consideration immediately.",
      de: "Vollständige Ehrlichkeit über Ihre Erfahrung, Ihre Grenzen und Ihre Gesundheit. Eine Lüge beendet Ihre Prüfung sofort.",
      fr: "Une honnêteté totale sur votre expérience, vos limites et votre santé. Un mensonge met immédiatement fin à votre candidature.",
    },
  },
  {
    title: { en: "Be punctual", de: "Seien Sie pünktlich", fr: "Soyez ponctuel" },
    text: {
      en: "Arrive on time, or early. Online, be ready and connected before the hour. Lateness is disrespect and may cost you your session.",
      de: "Erscheinen Sie pünktlich oder früher. Online seien Sie vor der vereinbarten Stunde bereit und verbunden. Verspätung ist Respektlosigkeit und kann Sie Ihre Session kosten.",
      fr: "Arrivez à l'heure, ou en avance. En ligne, soyez prêt et connecté avant l'heure. Le retard est un manque de respect et peut vous coûter votre séance.",
    },
  },
  {
    title: { en: "Be clean and prepared", de: "Seien Sie sauber und vorbereitet", fr: "Soyez propre et préparé" },
    text: {
      en: "Arrive clean, groomed and sober. For online sessions, prepare a private space, a charged device, and a working camera and microphone.",
      de: "Erscheinen Sie sauber, gepflegt und nüchtern. Bereiten Sie für Online-Sessions einen privaten Raum, ein aufgeladenes Gerät sowie funktionierende Kamera und Mikrofon vor.",
      fr: "Présentez-vous propre, soigné et sobre. Pour les séances en ligne, préparez un lieu privé, un appareil chargé, ainsi qu'une caméra et un microphone qui fonctionnent.",
    },
  },
  {
    title: { en: "Limits are respected", de: "Grenzen werden respektiert", fr: "Les limites sont respectées" },
    text: {
      en: "Your limits are negotiated before anything begins, and I respect them absolutely. Tell Me them honestly. A safeword is always honoured, instantly.",
      de: "Ihre Grenzen werden verhandelt, bevor irgendetwas beginnt, und Ich respektiere sie absolut. Nennen Sie sie Mir ehrlich. Ein Safeword wird immer sofort beachtet.",
      fr: "Vos limites sont négociées avant que quoi que ce soit ne commence, et Je les respecte absolument. Dites-Les-moi honnêtement. Un mot de sécurité est toujours respecté, immédiatement.",
    },
  },
  {
    title: { en: "Do not chase", de: "Haken Sie nicht nach", fr: "Ne relancez pas" },
    text: {
      en: "After you apply or book, wait. I review every request personally. Repeated messages move you backward, not forward.",
      de: "Warten Sie, nachdem Sie sich beworben oder gebucht haben. Ich prüfe jede Anfrage persönlich. Wiederholte Nachrichten bringen Sie zurück, nicht voran.",
      fr: "Après avoir postulé ou réservé, attendez. J'examine personnellement chaque demande. Les messages répétés vous font reculer, pas avancer.",
    },
  },
  {
    title: { en: "Payments are arranged privately", de: "Zahlungen werden privat vereinbart", fr: "Les paiements sont convenus en privé" },
    text: {
      en: "Nothing is paid through this website. Never send card codes, card photos or wallet details through the forms. Payment instructions come from Me, privately, after I accept you. Follow them exactly and on time.",
      de: "Über diese Website wird nichts bezahlt. Senden Sie niemals Kartencodes, Kartenfotos oder Wallet-Daten über die Formulare. Zahlungsanweisungen erhalten Sie von Mir, privat, nachdem Ich Sie angenommen habe. Befolgen Sie sie genau und pünktlich.",
      fr: "Rien n'est payé via ce site. N'envoyez jamais de codes de carte, de photos de carte ou d'informations de portefeuille via les formulaires. Les instructions de paiement viennent de Moi, en privé, une fois que Je vous ai accepté. Suivez-les exactement et dans les délais.",
    },
  },
  {
    title: { en: "Discretion", de: "Diskretion", fr: "Discrétion" },
    text: {
      en: "What happens between us stays between us. Do not record, screenshot or share anything without My written permission. I protect your privacy in the same way, as My privacy notice states.",
      de: "Was zwischen uns geschieht, bleibt zwischen uns. Nehmen Sie nichts auf, machen Sie keine Screenshots und teilen Sie nichts ohne Meine schriftliche Erlaubnis. Ich schütze Ihre Privatsphäre ebenso, wie es Meine Datenschutzerklärung festhält.",
      fr: "Ce qui se passe entre nous reste entre nous. N'enregistrez rien, ne faites aucune capture d'écran et ne partagez rien sans Mon autorisation écrite. Je protège votre vie privée de la même façon, comme l'indique Ma politique de confidentialité.",
    },
  },
  {
    title: { en: "Respect My time and My boundaries", de: "Respektieren Sie Meine Zeit und Meine Grenzen", fr: "Respectez Mon temps et Mes limites" },
    text: {
      en: "Do not contact Me outside the channels I give you. Do not ask for what I do not offer. My boundaries are listed on the home page, and they are not negotiable.",
      de: "Kontaktieren Sie Mich nicht außerhalb der Kanäle, die Ich Ihnen nenne. Fragen Sie nicht nach dem, was Ich nicht anbiete. Meine Grenzen stehen auf der Startseite und sind nicht verhandelbar.",
      fr: "Ne Me contactez pas en dehors des canaux que Je vous donne. Ne demandez pas ce que Je ne propose pas. Mes limites figurent sur la page d'accueil et ne sont pas négociables.",
    },
  },
  {
    title: { en: "Obey", de: "Gehorchen Sie", fr: "Obéissez" },
    text: {
      en: "Once we begin, you follow My instructions, within the limits we have agreed. Obedience is the point.",
      de: "Sobald wir beginnen, befolgen Sie Meine Anweisungen, innerhalb der vereinbarten Grenzen. Gehorsam ist der Sinn der Sache.",
      fr: "Une fois que nous commençons, vous suivez Mes instructions, dans les limites convenues. L'obéissance est le but.",
    },
  },
];

const ENDS: Tx[] = [
  { en: "Lying about your experience, limits or health", de: "Lügen über Erfahrung, Grenzen oder Gesundheit", fr: "Mentir sur votre expérience, vos limites ou votre santé" },
  { en: "Pressuring Me, or negotiating My rates", de: "Mich zu bedrängen oder Meine Preise zu verhandeln", fr: "Me mettre la pression ou négocier Mes tarifs" },
  { en: "Messaging repeatedly, or outside the channels I give you", de: "Wiederholt oder außerhalb der von Mir genannten Kanäle zu schreiben", fr: "Écrire à répétition ou en dehors des canaux que Je donne" },
  { en: "Disrespect, or an inappropriate tone", de: "Respektlosigkeit oder ein unangemessener Ton", fr: "Le manque de respect ou un ton déplacé" },
  { en: "Missing the deadline for your deposit or tribute", de: "Die Frist für Ihre Anzahlung oder Ihren Tribut zu versäumen", fr: "Manquer le délai de votre acompte ou de votre tribut" },
  { en: "Recording or sharing anything without permission", de: "Etwas ohne Erlaubnis aufzuzeichnen oder zu teilen", fr: "Enregistrer ou partager quoi que ce soit sans autorisation" },
];

function Protocol() {
  const { lang } = useI18n();
  const L = (x: Tx) => x[lang];
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="eyebrow">{L(UI.eyebrow)}</p>
      <h1 className="mt-4 text-5xl">{L(UI.title)}</h1>
      <div className="gold-rule my-10" />
      <p className="text-base leading-relaxed text-foreground/90">{L(UI.intro)}</p>

      <ol className="mt-12 space-y-6">
        {RULES.map((rule, i) => (
          <li key={rule.title.en} className="glass p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <span className="font-serif text-4xl leading-none text-gold" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-2xl text-gold">{L(rule.title)}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{L(rule.text)}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16">
        <h2 className="text-3xl text-gold">{L(UI.endsTitle)}</h2>
        <p className="mt-4 text-sm text-muted-foreground">{L(UI.endsIntro)}</p>
        <ul className="mt-6 list-none space-y-3 text-sm">
          {ENDS.map((item) => (
            <li key={item.en} className="flex items-start gap-4">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-crimson" aria-hidden="true" />
              {L(item)}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 border-t border-border pt-12 text-center">
        <h2 className="text-3xl">{L(UI.ctaTitle)}</h2>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/apply" className="btn-crimson">{L(UI.apply)}</Link>
          <Link to="/book" className="btn-gold">{L(UI.book)}</Link>
        </div>
      </div>
    </section>
  );
}
