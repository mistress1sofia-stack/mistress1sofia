import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PrefsSwitcher, useI18n } from "@/lib/i18n";

const links = [
  { label: "About", href: "/#about" },
  { label: "Offerings", href: "/#offerings" },
  { label: "Boundaries", href: "/#boundaries" },
  { label: "Protocol & FAQ", href: "/#protocol" },
];

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Escape closes the mobile menu wherever the keyboard focus is.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-lg tracking-[0.35em] text-gold">
          MISTRESS SOFIA
        </Link>
        <nav className="hidden items-center gap-7 xl:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-[0.68rem] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-gold">
              {t(l.label)}
            </a>
          ))}
          <Link to="/apply" className="text-[0.68rem] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-gold">
            {t("Apply to Serve")}
          </Link>
          <PrefsSwitcher />
          <Link to="/book" className="btn-crimson !px-5 !py-2.5">{t("Book a Session")}</Link>
        </nav>
        <button
          className="xl:hidden text-gold text-xs tracking-[0.3em] uppercase"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          aria-label={open ? t("Close menu") : t("Open menu")}
          aria-expanded={open}
        >
          {open ? t("Close") : t("Menu")}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-5 border-t border-border px-6 py-6 xl:hidden">
          <PrefsSwitcher />
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t(l.label)}
            </a>
          ))}
          <Link to="/apply" onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("Apply to Serve")}</Link>
          <Link to="/book" onClick={() => setOpen(false)} className="btn-crimson">{t("Book a Session")}</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl tracking-[0.35em] text-gold">MISTRESS SOFIA</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t("Professional Dominatrix. Selective. Discreet. Uncompromising.")}</p>
        </div>
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {links.map((l) => <a key={l.label} href={l.href} className="hover:text-gold">{t(l.label)}</a>)}
          <Link to="/apply" className="hover:text-gold">{t("Apply to Serve")}</Link>
          <Link to="/book" className="hover:text-gold">{t("Book a Session")}</Link>
          <Link to="/privacy" className="hover:text-gold">{t("Privacy Notice")}</Link>
          <PrefsSwitcher className="mt-3" />
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p>{t("Strictly 18+ adults only. All interactions are consensual, negotiated in advance, and conducted between adults.")}</p>
          <p className="mt-3">{t("Applications and booking requests are stored privately and reviewed only by Mistress Sofia. You may request deletion of your data at any time.")}</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
        {t("© {year} Mistress Sofia. All rights reserved.", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
