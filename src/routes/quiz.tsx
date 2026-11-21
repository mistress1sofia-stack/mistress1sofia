import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/quiz")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "What Type of Submissive Are You? — Mistress Sofia" },
      { name: "description", content: "A short, private assessment by Mistress Sofia. Eight questions, four types. Your answers stay in your browser. Adults 18+ only." },
      { property: "og:title", content: "What Type of Submissive Are You? — Mistress Sofia" },
      { property: "og:type", content: "website" },
      // The link-preview image (og:image) comes from the root route.
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/quiz" }],
  }),
  component: Quiz,
});

type Tx = { en: string; de: string; fr: string };
type Kind = "devoted" | "disciplined" | "tested" | "defiant";
type Level = "new" | "some" | "expert";
const ORDER: Kind[] = ["devoted", "disciplined", "tested", "defiant"];

const UI = {
  eyebrow: { en: "A Short Assessment", de: "Eine kurze Einschätzung", fr: "Une courte évaluation" },
  title: { en: "What Type of Submissive Are You?", de: "Welcher Typ Submissiver sind Sie?", fr: "Quel type de soumis êtes-vous ?" },
  intro: {
    en: "Eight questions. Answer honestly, not impressively. Your answers stay in your browser: nothing is stored or sent anywhere.",
    de: "Acht Fragen. Antworten Sie ehrlich, nicht beeindruckend. Ihre Antworten bleiben in Ihrem Browser: Nichts wird gespeichert oder irgendwohin gesendet.",
    fr: "Huit questions. Répondez honnêtement, pas pour impressionner. Vos réponses restent dans votre navigateur : rien n'est conservé ni envoyé.",
  },
  begin: { en: "Begin", de: "Beginnen", fr: "Commencer" },
  question: { en: "Question {n} of {total}", de: "Frage {n} von {total}", fr: "Question {n} sur {total}" },
  back: { en: "Back", de: "Zurück", fr: "Retour" },
  result: { en: "Your Result", de: "Ihr Ergebnis", fr: "Votre résultat" },
  expect: { en: "What I expect from you", de: "Was Ich von Ihnen erwarte", fr: "Ce que J'attends de vous" },
  next: { en: "Your next step", de: "Ihr nächster Schritt", fr: "Votre prochaine étape" },
  newNote: {
    en: "As you are new, begin with a single session. Long-term service is earned, not assumed.",
    de: "Da Sie neu sind, beginnen Sie mit einer einzelnen Session. Langfristiger Dienst wird verdient, nicht vorausgesetzt.",
    fr: "Étant débutant, commencez par une seule séance. Le service à long terme se mérite, il ne se présume pas.",
  },
  apply: { en: "Apply to Serve", de: "Bewerbung zum Dienen", fr: "Postuler pour servir" },
  book: { en: "Book a Session", de: "Session buchen", fr: "Réserver une séance" },
  retake: { en: "Retake the quiz", de: "Quiz wiederholen", fr: "Refaire le quiz" },
  copy: { en: "Copy the quiz link", de: "Quiz-Link kopieren", fr: "Copier le lien du quiz" },
  copied: { en: "Link copied", de: "Link kopiert", fr: "Lien copié" },
  share: { en: "Send this to someone who needs to know.", de: "Senden Sie dies jemandem, der es wissen muss.", fr: "Envoyez ceci à quelqu'un qui a besoin de savoir." },
  adults: { en: "Adults 18+ only. For entertainment. Not advice.", de: "Nur für Erwachsene ab 18. Zur Unterhaltung. Keine Beratung.", fr: "Réservé aux adultes de 18 ans et plus. Pour le divertissement. Pas un conseil." },
} satisfies Record<string, Tx>;

const QUESTIONS: { q: Tx; options: { t: Tx; kind: Kind }[] }[] = [
  {
    q: { en: "When someone you respect gives you a clear instruction, you feel…", de: "Wenn jemand, den Sie respektieren, Ihnen eine klare Anweisung gibt, fühlen Sie…", fr: "Quand quelqu'un que vous respectez vous donne une instruction claire, vous ressentez…" },
    options: [
      { kind: "devoted", t: { en: "Calm. A weight lifts.", de: "Ruhe. Eine Last fällt ab.", fr: "Du calme. Un poids se lève." } },
      { kind: "disciplined", t: { en: "Focused. I want to do it exactly right.", de: "Konzentration. Ich will es genau richtig machen.", fr: "De la concentration. Je veux le faire exactement bien." } },
      { kind: "tested", t: { en: "A rush of nerves. I want to see what comes next.", de: "Einen Schwall Nervosität. Ich will sehen, was als Nächstes kommt.", fr: "Une montée de nervosité. Je veux voir la suite." } },
      { kind: "defiant", t: { en: "The urge to ask why before I obey.", de: "Den Drang, erst zu fragen, warum, bevor ich gehorche.", fr: "L'envie de demander pourquoi avant d'obéir." } },
    ],
  },
  {
    q: { en: "What draws you most to this world?", de: "Was zieht Sie an dieser Welt am meisten an?", fr: "Qu'est-ce qui vous attire le plus dans ce monde ?" },
    options: [
      { kind: "disciplined", t: { en: "Structure, routine and clear standards", de: "Struktur, Routine und klare Maßstäbe", fr: "La structure, la routine et des exigences claires" } },
      { kind: "devoted", t: { en: "Being of use to someone who deserves it", de: "Für jemanden von Nutzen zu sein, der es verdient", fr: "Être utile à quelqu'un qui le mérite" } },
      { kind: "defiant", t: { en: "Meeting someone I cannot charm or outwit", de: "Jemandem zu begegnen, den ich weder becircen noch überlisten kann", fr: "Rencontrer quelqu'un que je ne peux ni charmer ni déjouer" } },
      { kind: "tested", t: { en: "Intensity, and finding my limits", de: "Intensität und das Entdecken meiner Grenzen", fr: "L'intensité et la découverte de mes limites" } },
    ],
  },
  {
    q: { en: "Your relationship with rules is best described as…", de: "Ihr Verhältnis zu Regeln lässt sich am besten so beschreiben:", fr: "Votre rapport aux règles se décrit le mieux ainsi :" },
    options: [
      { kind: "defiant", t: { en: "I test them first, then decide", de: "Ich teste sie zuerst, dann entscheide ich", fr: "Je les teste d'abord, ensuite je décide" } },
      { kind: "devoted", t: { en: "I keep them gladly", de: "Ich halte sie gern ein", fr: "Je les respecte volontiers" } },
      { kind: "disciplined", t: { en: "I keep them, and look for ways to keep them better", de: "Ich halte sie ein und suche Wege, sie besser einzuhalten", fr: "Je les respecte et cherche à mieux les respecter" } },
      { kind: "tested", t: { en: "I keep them, but I crave being pushed past comfortable", de: "Ich halte sie ein, sehne mich aber danach, über das Bequeme hinausgeführt zu werden", fr: "Je les respecte, mais j'ai envie d'être poussé au-delà du confortable" } },
    ],
  },
  {
    q: { en: "After a hard day, what restores you most?", de: "Was baut Sie nach einem harten Tag am meisten auf?", fr: "Après une journée difficile, qu'est-ce qui vous ressource le plus ?" },
    options: [
      { kind: "tested", t: { en: "Something intense that empties my mind", de: "Etwas Intensives, das meinen Kopf leert", fr: "Quelque chose d'intense qui vide mon esprit" } },
      { kind: "devoted", t: { en: "Being useful to someone", de: "Für jemanden nützlich zu sein", fr: "Être utile à quelqu'un" } },
      { kind: "disciplined", t: { en: "A plan and a routine I can follow", de: "Ein Plan und eine Routine, der ich folgen kann", fr: "Un plan et une routine à suivre" } },
      { kind: "defiant", t: { en: "A strong personality to push against", de: "Eine starke Persönlichkeit, an der ich mich reiben kann", fr: "Une forte personnalité contre laquelle me heurter" } },
    ],
  },
  {
    q: { en: "When you make a mistake, you first want to…", de: "Wenn Ihnen ein Fehler unterläuft, wollen Sie zuerst…", fr: "Quand vous faites une erreur, vous voulez d'abord…" },
    options: [
      { kind: "disciplined", t: { en: "Be corrected and shown how to improve", de: "korrigiert werden und lernen, wie ich mich verbessere", fr: "être corrigé et apprendre à m'améliorer" } },
      { kind: "defiant", t: { en: "Explain myself before anyone else speaks", de: "mich erklären, bevor jemand anderes spricht", fr: "m'expliquer avant que quiconque ne parle" } },
      { kind: "devoted", t: { en: "Make amends in whatever way pleases", de: "es wiedergutmachen, auf welche Weise auch immer es gefällt", fr: "réparer, de la façon qui plaît" } },
      { kind: "tested", t: { en: "Accept whatever consequence is fair", de: "jede angemessene Konsequenz annehmen", fr: "accepter la conséquence qui est juste" } },
    ],
  },
  {
    q: { en: "Which sentence tempts you most?", de: "Welcher Satz reizt Sie am meisten?", fr: "Quelle phrase vous tente le plus ?" },
    options: [
      { kind: "devoted", t: { en: "“Good. Stay there.”", de: "„Gut. Bleib dort.“", fr: "« Bien. Reste là. »" } },
      { kind: "disciplined", t: { en: "“Again. Properly this time.”", de: "„Noch einmal. Diesmal richtig.“", fr: "« Encore. Correctement cette fois. »" } },
      { kind: "tested", t: { en: "“You can take more than you think.”", de: "„Du kannst mehr aushalten, als du denkst.“", fr: "« Tu peux en supporter plus que tu ne le crois. »" } },
      { kind: "defiant", t: { en: "“Make Me believe you.”", de: "„Überzeuge Mich.“", fr: "« Convaincs-Moi. »" } },
    ],
  },
  {
    q: { en: "What do you most want from a Mistress?", de: "Was wünschen Sie sich am meisten von einer Herrin?", fr: "Qu'attendez-vous le plus d'une Maîtresse ?" },
    options: [
      { kind: "tested", t: { en: "To be challenged and carried further than I would go alone", de: "Gefordert und weiter getragen zu werden, als ich allein gehen würde", fr: "Être mis au défi et porté plus loin que je n'irais seul" } },
      { kind: "defiant", t: { en: "To finally meet someone who cannot be charmed", de: "Endlich jemanden zu treffen, der sich nicht becircen lässt", fr: "Enfin rencontrer quelqu'un qui ne se laisse pas charmer" } },
      { kind: "devoted", t: { en: "To be owned and guided, long term", de: "Besessen und geführt zu werden, langfristig", fr: "Être possédé et guidé, sur le long terme" } },
      { kind: "disciplined", t: { en: "To be trained and refined", de: "Erzogen und verfeinert zu werden", fr: "Être dressé et affiné" } },
    ],
  },
];

const EXPERIENCE: { q: Tx; options: { t: Tx; level: Level }[] } = {
  q: { en: "How would you describe your experience?", de: "Wie würden Sie Ihre Erfahrung beschreiben?", fr: "Comment décririez-vous votre expérience ?" },
  options: [
    { level: "new", t: { en: "Complete beginner", de: "Absoluter Anfänger", fr: "Débutant complet" } },
    { level: "some", t: { en: "Some experience", de: "Etwas Erfahrung", fr: "Un peu d'expérience" } },
    { level: "expert", t: { en: "Experienced", de: "Erfahren", fr: "Expérimenté" } },
  ],
};
const TOTAL = QUESTIONS.length + 1;

const RESULTS: Record<Kind, { name: Tx; text: Tx; expect: Tx; primary: "apply" | "book" }> = {
  devoted: {
    primary: "apply",
    name: { en: "The Devoted Servant", de: "Der ergebene Diener", fr: "Le serviteur dévoué" },
    text: {
      en: "You find your calm in being useful. Obedience does not diminish you; it settles you. You do not need to be convinced to serve, only to be directed well. Your risk is not defiance but eagerness: devotion without discipline is easily wasted.",
      de: "Ihre Ruhe finden Sie darin, nützlich zu sein. Gehorsam mindert Sie nicht, er beruhigt Sie. Sie müssen nicht überzeugt werden zu dienen, nur gut geführt. Ihre Gefahr ist nicht Trotz, sondern Eifer: Hingabe ohne Disziplin wird leicht verschwendet.",
      fr: "Vous trouvez votre calme dans l'utilité. L'obéissance ne vous diminue pas, elle vous apaise. Nul besoin de vous convaincre de servir, seulement de vous diriger avec justesse. Votre risque n'est pas la défiance mais l'empressement : une dévotion sans discipline se gaspille facilement.",
    },
    expect: {
      en: "I expect devotion that is steady, not dramatic. Punctuality, honesty and obedience, every time.",
      de: "Ich erwarte Hingabe, die beständig ist, nicht dramatisch. Pünktlichkeit, Ehrlichkeit und Gehorsam, jedes Mal.",
      fr: "J'attends une dévotion constante, non théâtrale. Ponctualité, honnêteté et obéissance, à chaque fois.",
    },
  },
  disciplined: {
    primary: "apply",
    name: { en: "The Disciplined Student", de: "Der disziplinierte Schüler", fr: "L'élève discipliné" },
    text: {
      en: "You respect structure and you want to be better at it. Correction does not wound you; it interests you. You thrive where standards are high and clear. Your risk is perfectionism: you may mistake effort for submission.",
      de: "Sie respektieren Struktur und wollen darin besser werden. Korrektur verletzt Sie nicht, sie interessiert Sie. Sie blühen auf, wo Maßstäbe hoch und klar sind. Ihre Gefahr ist Perfektionismus: Sie verwechseln womöglich Anstrengung mit Unterwerfung.",
      fr: "Vous respectez la structure et voulez vous y améliorer. La correction ne vous blesse pas, elle vous intéresse. Vous vous épanouissez là où les exigences sont hautes et claires. Votre risque est le perfectionnisme : vous pourriez confondre effort et soumission.",
    },
    expect: {
      en: "I expect you to be teachable: to accept correction without excuses, and to repeat what I ask until it is right.",
      de: "Ich erwarte, dass Sie lernbereit sind: Korrektur ohne Ausreden anzunehmen und zu wiederholen, was Ich verlange, bis es stimmt.",
      fr: "J'attends que vous soyez docile à l'apprentissage : accepter la correction sans excuses et répéter ce que J'exige jusqu'à ce que ce soit juste.",
    },
  },
  tested: {
    primary: "book",
    name: { en: "The Tested One", de: "Der Geprüfte", fr: "Celui qu'on met à l'épreuve" },
    text: {
      en: "You are drawn to intensity and to finding out what you can endure. Limits fascinate you, yours more than anyone's. You trust best when someone competent holds the edge for you. Your risk is chasing sensation for its own sake and forgetting the trust underneath it.",
      de: "Sie ziehen Intensität an und die Frage, was Sie ertragen können. Grenzen faszinieren Sie, Ihre eigenen mehr als alle anderen. Sie vertrauen am besten, wenn jemand Kompetentes die Grenze für Sie hält. Ihre Gefahr ist, Empfindung um ihrer selbst willen zu jagen und das Vertrauen darunter zu vergessen.",
      fr: "L'intensité vous attire, ainsi que l'envie de savoir ce que vous pouvez endurer. Les limites vous fascinent, les vôtres plus que toutes. Vous faites surtout confiance quand quelqu'un de compétent tient la limite pour vous. Votre risque est de courir après la sensation pour elle-même et d'oublier la confiance qui la sous-tend.",
    },
    expect: {
      en: "I expect complete honesty about your limits and your health. I push edges deliberately, and only with full information.",
      de: "Ich erwarte vollständige Ehrlichkeit über Ihre Grenzen und Ihre Gesundheit. Ich verschiebe Grenzen bewusst, und nur mit vollständigen Informationen.",
      fr: "J'attends une honnêteté totale sur vos limites et votre santé. Je repousse les limites délibérément, et seulement avec une information complète.",
    },
  },
  defiant: {
    primary: "book",
    name: { en: "The Defiant", de: "Der Widerspenstige", fr: "Le rebelle" },
    text: {
      en: "You do not give yourself away cheaply. You question, you test, you wait to see whether someone is truly stronger than you. Charm does not work on you; competence does. When you finally yield, it means something. Your risk is pride: it can keep you at the door long after you wanted to enter.",
      de: "Sie verschenken sich nicht billig. Sie hinterfragen, Sie prüfen, Sie warten, ob jemand wirklich stärker ist als Sie. Charme wirkt bei Ihnen nicht, Kompetenz schon. Wenn Sie sich schließlich fügen, bedeutet es etwas. Ihre Gefahr ist Stolz: Er kann Sie lange vor der Tür halten, obwohl Sie längst eintreten wollten.",
      fr: "Vous ne vous donnez pas à bon marché. Vous questionnez, vous testez, vous attendez de voir si quelqu'un est vraiment plus fort que vous. Le charme n'a pas de prise sur vous, la compétence si. Quand vous cédez enfin, cela signifie quelque chose. Votre risque est l'orgueil : il peut vous garder à la porte longtemps après avoir voulu entrer.",
    },
    expect: {
      en: "Some arrive resistant. None remain so. I expect you to be honest about why you resist, and to stop performing.",
      de: "Manche kommen widerspenstig. Keiner bleibt es. Ich erwarte, dass Sie ehrlich sagen, warum Sie sich sträuben, und aufhören, etwas vorzuspielen.",
      fr: "Certains arrivent réticents. Aucun ne le reste. J'attends que vous soyez honnête sur la raison de votre résistance, et que vous cessiez de jouer un rôle.",
    },
  },
};

function Quiz() {
  const { lang, t } = useI18n();
  const L = (x: Tx) => x[lang];
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0); // 0..QUESTIONS.length-1 scored, QUESTIONS.length = experience
  const [picked, setPicked] = useState<Kind[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const done = level !== null;

  // Remember (this tab only) that the visitor came through the quiz, so the forms can pre-fill "How did you find me?".
  useEffect(() => {
    if (!done) return;
    try { if (!sessionStorage.getItem("ms-source")) sessionStorage.setItem("ms-source", "The quiz on this site"); } catch { /* storage blocked */ }
  }, [done]);

  // Move focus to the new question or result so keyboard and screen-reader users follow along.
  useEffect(() => { if (started) headingRef.current?.focus(); }, [started, step, done]);

  const pickKind = (kind: Kind) => { setPicked((p) => [...p.slice(0, step), kind]); setStep(step + 1); };
  const goBack = () => { if (done) setLevel(null); else if (step > 0) setStep(step - 1); else setStarted(false); };
  const restart = () => { setPicked([]); setLevel(null); setStep(0); setStarted(false); };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/quiz`); setCopied(true); window.setTimeout(() => setCopied(false), 2500); }
    catch { /* clipboard blocked: the visitor can copy the address bar instead */ }
  };

  const tally: Record<Kind, number> = { devoted: 0, disciplined: 0, tested: 0, defiant: 0 };
  picked.forEach((k) => { tally[k] += 1; });
  const winner = ORDER.reduce((best, k) => (tally[k] > tally[best] ? k : best), ORDER[0]!);
  const result = RESULTS[winner];
  const beginner = level === "new";
  const primary = beginner ? "book" : result.primary;

  const optionClass = "block w-full border border-input px-5 py-4 text-left text-sm transition hover:border-gold-soft hover:bg-oxblood/20";
  const applyLink = <Link key="apply" to="/apply" className={primary === "apply" ? "btn-crimson" : "btn-gold"}>{L(UI.apply)}</Link>;
  const bookLink = <Link key="book" to="/book" className={primary === "book" ? "btn-crimson" : "btn-gold"}>{L(UI.book)}</Link>;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">{L(UI.eyebrow)}</p>

      {!started ? (
        <>
          <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-5xl outline-none">{L(UI.title)}</h1>
          <div className="gold-rule my-8" />
          <p className="text-base leading-relaxed text-foreground/90">{L(UI.intro)}</p>
          <button type="button" className="btn-crimson mt-10" onClick={() => setStarted(true)}>{L(UI.begin)}</button>
          <p className="mt-10 text-xs text-muted-foreground">{L(UI.adults)}</p>
        </>
      ) : !done ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t(L(UI.question), { n: step + 1, total: TOTAL })}</p>
          <div className="mt-3 h-px w-full bg-border" aria-hidden="true"><div className="h-px bg-gold transition-all" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} /></div>
          <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-3xl leading-snug outline-none sm:text-4xl">
            {L(step < QUESTIONS.length ? QUESTIONS[step]!.q : EXPERIENCE.q)}
          </h1>
          <div className="mt-8 space-y-3">
            {step < QUESTIONS.length
              ? QUESTIONS[step]!.options.map((o) => (
                  <button key={o.kind} type="button" className={optionClass} onClick={() => pickKind(o.kind)}>{L(o.t)}</button>
                ))
              : EXPERIENCE.options.map((o) => (
                  <button key={o.level} type="button" className={optionClass} onClick={() => setLevel(o.level)}>{L(o.t)}</button>
                ))}
          </div>
          <button type="button" className="mt-8 text-xs uppercase tracking-[0.25em] text-gold underline" onClick={goBack}>{L(UI.back)}</button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{L(UI.result)}</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-5xl outline-none">{L(result.name)}</h1>
          <div className="gold-rule my-8" />
          <p className="text-base leading-relaxed text-foreground/90">{L(result.text)}</p>
          <div className="glass mt-8 p-6">
            <p className="eyebrow">{L(UI.expect)}</p>
            <p className="mt-3 font-serif text-xl leading-relaxed">{L(result.expect)}</p>
          </div>
          <p className="eyebrow mt-10">{L(UI.next)}</p>
          {beginner && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{L(UI.newNote)}</p>}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row">
            {primary === "book" ? [bookLink, applyLink] : [applyLink, bookLink]}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-border pt-6">
            <button type="button" className="text-xs uppercase tracking-[0.25em] text-gold underline" onClick={goBack}>{L(UI.back)}</button>
            <button type="button" className="text-xs uppercase tracking-[0.25em] text-gold underline" onClick={restart}>{L(UI.retake)}</button>
            <button type="button" className="text-xs uppercase tracking-[0.25em] text-gold underline" onClick={() => void copyLink()}>{copied ? L(UI.copied) : L(UI.copy)}</button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{L(UI.share)}</p>
        </div>
      )}
    </section>
  );
}
