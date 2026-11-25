import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shop")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Shop — Mistress Sofia" },
      { name: "description", content: "Guides, audio and recommended gear from Mistress Sofia. Purchases are made through secure partner checkouts. Adults 18+ only." },
      { property: "og:title", content: "Shop — Mistress Sofia" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/shop" }],
  }),
  component: Shop,
});

type Tx = { en: string; de: string; fr: string };

/* ------------------------------------------------------------------
   OWNER AREA — add your real products here. Nothing else needs editing.
   Each item needs: title, text (short description), price (as text, e.g. "$25"),
   and url (the checkout link from your selling platform).
   Leave a list empty ([]) and that section shows "coming soon".

   Example:
   {
     title: { en: "Chastity Basics", de: "Keuschheit: Grundlagen", fr: "Les bases de la chasteté" },
     text:  { en: "A short guide for beginners.", de: "Ein kurzer Leitfaden für Anfänger.", fr: "Un court guide pour débutants." },
     price: "$25",
     url:   "https://example-platform.com/your-product",
   },
------------------------------------------------------------------- */
type Item = { title: Tx; text: Tx; price?: string; url: string };

const PRODUCTS: Item[] = [];  // Your own digital products (guides, audio, documents)
const GEAR: Item[] = [];      // Gear you recommend (affiliate links)
const WISHLIST_URL = "";      // Optional: your wishlist link. Leave "" to hide it.

const UI = {
  eyebrow: { en: "The Shop", de: "Der Shop", fr: "La boutique" },
  title: { en: "Shop", de: "Shop", fr: "Boutique" },
  intro: {
    en: "Guides, audio and recommended gear, chosen by Me for those who wish to serve better. Digital items are delivered instantly after purchase.",
    de: "Leitfäden, Audio und empfohlene Ausrüstung, von Mir ausgewählt für alle, die besser dienen möchten. Digitale Artikel werden nach dem Kauf sofort geliefert.",
    fr: "Guides, audio et équipement recommandé, choisis par Moi pour ceux qui souhaitent mieux servir. Les articles numériques sont livrés immédiatement après l'achat.",
  },
  notice: {
    en: "Purchases are made on our partners' secure checkout pages, not on this site. This site never sees or stores your payment details. Sessions and applications are still arranged privately and nothing for them is paid here.",
    de: "Käufe erfolgen auf den sicheren Bezahlseiten Unserer Partner, nicht auf dieser Website. Diese Website sieht oder speichert Ihre Zahlungsdaten nie. Sessions und Bewerbungen werden weiterhin privat vereinbart; dafür wird hier nichts bezahlt.",
    fr: "Les achats se font sur les pages de paiement sécurisées de Nos partenaires, pas sur ce site. Ce site ne voit ni ne conserve jamais vos données de paiement. Les séances et candidatures restent convenues en privé et rien n'est payé ici pour elles.",
  },
  productsTitle: { en: "My Guides & Audio", de: "Meine Leitfäden & Audio", fr: "Mes guides & audio" },
  gearTitle: { en: "Recommended Gear", de: "Empfohlene Ausrüstung", fr: "Équipement recommandé" },
  gearNote: {
    en: "Some links are affiliate links. If you buy through them, I may earn a small commission at no extra cost to you.",
    de: "Einige Links sind Affiliate-Links. Wenn Sie darüber kaufen, erhalte Ich möglicherweise eine kleine Provision, ohne Mehrkosten für Sie.",
    fr: "Certains liens sont des liens d'affiliation. Si vous achetez via ces liens, Je peux percevoir une petite commission, sans frais supplémentaires pour vous.",
  },
  soon: { en: "The first releases are coming soon.", de: "Die ersten Veröffentlichungen folgen in Kürze.", fr: "Les premières parutions arrivent bientôt." },
  buy: { en: "Buy", de: "Kaufen", fr: "Acheter" },
  view: { en: "View", de: "Ansehen", fr: "Voir" },
  wishlist: { en: "Spoil Me — My Wishlist", de: "Verwöhnen Sie Mich — Mein Wunschzettel", fr: "Gâtez-Moi — Ma liste de souhaits" },
  final: {
    en: "Digital products are final sale once delivered. If there is a problem with a file or delivery, contact the platform that sent it.",
    de: "Digitale Produkte sind nach der Lieferung vom Umtausch ausgeschlossen. Bei Problemen mit einer Datei oder der Lieferung wenden Sie sich an die Plattform, die sie gesendet hat.",
    fr: "Les produits numériques ne sont ni repris ni remboursés une fois livrés. En cas de problème de fichier ou de livraison, contactez la plateforme qui l'a envoyé.",
  },
} satisfies Record<string, Tx>;

function Grid({ items, label, L }: { items: Item[]; label: Tx; L: (x: Tx) => string }) {
  return (
    <ul className="mt-8 grid gap-6 sm:grid-cols-2">
      {items.map((p) => (
        <li key={p.url} className="glass flex flex-col p-6">
          <h3 className="text-xl text-gold">{L(p.title)}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">{L(p.text)}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            {p.price ? <span className="font-serif text-2xl">{p.price}</span> : <span />}
            <a href={p.url} target="_blank" rel="noopener noreferrer sponsored" className="btn-crimson">{L(label)}</a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Shop() {
  const { lang } = useI18n();
  const L = (x: Tx) => x[lang];
  const empty = PRODUCTS.length === 0 && GEAR.length === 0;
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="eyebrow">{L(UI.eyebrow)}</p>
      <h1 className="mt-4 text-5xl">{L(UI.title)}</h1>
      <div className="gold-rule my-10" />
      <p className="text-base leading-relaxed text-foreground/90">{L(UI.intro)}</p>
      <p className="mt-4 border-l-2 border-crimson pl-4 text-xs leading-relaxed text-muted-foreground">{L(UI.notice)}</p>

      {empty && <p className="mt-16 text-center font-serif text-2xl text-gold">{L(UI.soon)}</p>}

      {PRODUCTS.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl text-gold">{L(UI.productsTitle)}</h2>
          <Grid items={PRODUCTS} label={UI.buy} L={L} />
        </div>
      )}

      {GEAR.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl text-gold">{L(UI.gearTitle)}</h2>
          <p className="mt-3 text-xs text-muted-foreground">{L(UI.gearNote)}</p>
          <Grid items={GEAR} label={UI.view} L={L} />
        </div>
      )}

      {WISHLIST_URL && (
        <div className="mt-16 text-center">
          <a href={WISHLIST_URL} target="_blank" rel="noopener noreferrer" className="btn-gold">{L(UI.wishlist)}</a>
        </div>
      )}

      <p className="mt-16 border-t border-border pt-8 text-xs leading-relaxed text-muted-foreground">{L(UI.final)}</p>
    </section>
  );
}
