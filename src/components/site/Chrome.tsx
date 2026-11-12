import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const links = [
  { label: "About", href: "/#about" },
  { label: "Offerings", href: "/#offerings" },
  { label: "Boundaries", href: "/#boundaries" },
  { label: "Protocol & FAQ", href: "/#protocol" },
];

export function Header() {
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
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-[0.68rem] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-gold">
              {l.label}
            </a>
          ))}
          <Link to="/apply" className="text-[0.68rem] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-gold">
            Apply to Serve
          </Link>
          <Link to="/book" className="btn-crimson !px-5 !py-2.5">Book a Session</Link>
        </nav>
        <button
          className="lg:hidden text-gold text-xs tracking-[0.3em] uppercase"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-5 border-t border-border px-6 py-6 lg:hidden">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {l.label}
            </a>
          ))}
          <Link to="/apply" onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Apply to Serve</Link>
          <Link to="/book" onClick={() => setOpen(false)} className="btn-crimson">Book a Session</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl tracking-[0.35em] text-gold">MISTRESS SOFIA</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Professional Dominatrix. Selective. Discreet. Uncompromising.</p>
        </div>
        <div className="flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {links.map((l) => <a key={l.label} href={l.href} className="hover:text-gold">{l.label}</a>)}
          <Link to="/apply" className="hover:text-gold">Apply to Serve</Link>
          <Link to="/book" className="hover:text-gold">Book a Session</Link>
          <Link to="/privacy" className="hover:text-gold">Privacy Notice</Link>
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p>Strictly 18+ adults only. All interactions are consensual, negotiated in advance, and conducted between adults.</p>
          <p className="mt-3">Applications and booking requests are stored privately and reviewed only by Mistress Sofia. You may request deletion of your data at any time.</p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
        © {new Date().getFullYear()} Mistress Sofia. All rights reserved.
      </div>
    </footer>
  );
}
