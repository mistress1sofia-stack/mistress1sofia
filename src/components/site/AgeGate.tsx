import { useEffect, useRef, useState } from "react";

const KEY = "ms-age-verified";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (localStorage.getItem(KEY) !== "yes") setOpen(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) enterRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-6 backdrop-blur-xl">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-desc"
        className="glass w-full max-w-lg p-10 text-center"
        onKeyDown={onKeyDown}
      >
        <p className="eyebrow">Restricted Access</p>
        <h2 id="age-gate-title" className="mt-4 text-5xl">Adults Only (18+)</h2>
        <div className="gold-rule my-6" />
        <p id="age-gate-desc" className="text-sm leading-relaxed text-muted-foreground">
          This site contains mature themes intended for adults. Please confirm you are at least 18 years of age
          (or of legal age in your jurisdiction) to proceed.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            ref={enterRef}
            className="btn-crimson"
            onClick={() => {
              localStorage.setItem(KEY, "yes");
              setOpen(false);
            }}
          >
            I Am 18 or Older — Enter
          </button>
          <button className="btn-gold" onClick={() => (window.location.href = "https://www.google.com")}>
            Exit / Leave
          </button>
        </div>
      </div>
    </div>
  );
}
