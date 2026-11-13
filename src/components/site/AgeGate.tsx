import { useEffect, useRef, useState } from "react";
import { PrefsSwitcher, useI18n } from "@/lib/i18n";

export const AGE_KEY = "ms-age-verified";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Inline head script (runs before first paint). It marks the page "gate" for everyone,
// then "yes" for a visitor who confirmed their age in the last 30 days. A CSS rule in
// styles.css hides the gate at once when data-age is "yes", so verified visitors never
// see it flash, and everyone else always sees it covering the page from the first paint.
export const AGE_GATE_SCRIPT = `(function(){var d=document.documentElement;d.dataset.age="gate";try{var v=JSON.parse(localStorage.getItem("${AGE_KEY}"));if(v&&v.t&&Date.now()-v.t<${THIRTY_DAYS_MS}){d.dataset.age="yes"}}catch(e){}})();`;

export function AgeGate() {
  const { t } = useI18n();
  // Starts open so the gate is part of the server-rendered page and covers the content
  // from the very first paint. Verified visitors are released as soon as the page loads.
  const [open, setOpen] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (document.documentElement.dataset["age"] === "yes") setOpen(false);
  }, []);

  // While the gate is up: lock scrolling, put focus on the Enter button, and hide the page
  // behind it from the keyboard and screen readers (inert) so it cannot be reached.
  useEffect(() => {
    const verified = document.documentElement.dataset["age"] === "yes";
    const behind = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer"));
    if (open && !verified) {
      document.body.style.overflow = "hidden";
      behind.forEach((el) => el.setAttribute("inert", ""));
      enterRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  function confirmAge() {
    try {
      localStorage.setItem(AGE_KEY, JSON.stringify({ t: Date.now() }));
    } catch {
      /* Storage blocked (for example private browsing): they will be asked again next visit. */
    }
    document.documentElement.dataset["age"] = "yes";
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!open) return null;
  return (
    <div className="age-gate fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-6 backdrop-blur-xl">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-desc"
        className="glass max-h-[100dvh] w-full max-w-lg overflow-y-auto p-10 text-center"
        onKeyDown={onKeyDown}
      >
        <p className="eyebrow">{t("Restricted Access")}</p>
        <h2 id="age-gate-title" className="mt-4 break-words text-5xl">{t("Adults Only (18+)")}</h2>
        <div className="gold-rule my-6" />
        <p id="age-gate-desc" className="text-sm leading-relaxed text-muted-foreground">
          {t("This site contains mature themes intended for adults. Please confirm you are at least 18 years of age (or of legal age in your jurisdiction) to proceed.")}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button ref={enterRef} type="button" className="btn-crimson" onClick={confirmAge}>
            {t("I Am 18 or Older — Enter")}
          </button>
          <button type="button" className="btn-gold" onClick={() => (window.location.href = "https://www.google.com")}>
            {t("Exit / Leave")}
          </button>
        </div>
        <PrefsSwitcher className="mt-6 justify-center" />
      </div>
    </div>
  );
}
