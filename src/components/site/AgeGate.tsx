import { useEffect, useState } from "react";

const KEY = "ms-age-verified";

export function AgeGate() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(KEY) !== "yes") setOpen(true);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-6 backdrop-blur-xl">
      <div className="glass w-full max-w-lg p-10 text-center">
        <p className="eyebrow">Restricted Access</p>
        <h2 className="mt-4 text-5xl">Adults Only (18+)</h2>
        <div className="gold-rule my-6" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          This site contains mature themes and explicit adult protocol. You must be at least 18 years of age (or legal age in your jurisdiction) to proceed.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
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
