import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { listGallery, type GalleryImage } from "@/lib/gallery";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Gallery — Mistress Sofia" },
      { name: "description", content: "A glimpse of the experience: photographs from Mistress Sofia's private sessions. 18+ only." },
      { property: "og:title", content: "Gallery — Mistress Sofia" },
      { property: "og:type", content: "website" },
      // The link-preview image (og:image) comes from the root route.
    ],
    links: [{ rel: "canonical", href: "https://mistresssofia.site/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const { t } = useI18n();
  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    listGallery().then((list) => { if (live) setImages(list); }).catch(() => { if (live) { setFailed(true); setImages([]); } });
    return () => { live = false; };
  }, []);

  const total = images?.length ?? 0;
  const step = useCallback((d: number) => setOpen((i) => (i === null || total === 0 ? i : (i + d + total) % total)), [total]);

  // Photo viewer: keyboard control, and page scrolling is locked while it is open.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, step]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <p className="eyebrow">{t("A Glimpse of the Experience")}</p>
      <h1 className="mt-4 text-5xl">{t("Gallery")}</h1>
      <div className="gold-rule my-10" />
      {images === null ? (
        <p className="text-sm text-muted-foreground">{t("Loading…")}</p>
      ) : failed ? (
        <p className="text-sm text-muted-foreground">{t("The gallery could not be loaded. Please try again later.")}</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("New photos are coming soon.")}</p>
      ) : (
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {images.map((img, i) => (
            <button key={img.name} type="button" onClick={() => setOpen(i)} className="group mb-3 block w-full break-inside-avoid overflow-hidden border border-border transition hover:border-gold-soft">
              <img src={img.url} alt={t("Gallery photo {n} of {total}", { n: i + 1, total })} loading="lazy" decoding="async" className="w-full transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
            </button>
          ))}
        </div>
      )}

      {open !== null && images?.[open] && (
        <div role="dialog" aria-modal="true" aria-label={t("Photo viewer")} className="fixed inset-0 z-[90] flex items-center justify-center bg-background/95 backdrop-blur-xl" onClick={() => setOpen(null)}>
          <img src={images[open]!.url} alt={t("Gallery photo {n} of {total}", { n: open + 1, total })} className="max-h-[85vh] max-w-[92vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button ref={closeRef} type="button" className="btn-gold absolute right-4 top-4 !px-4 !py-2" onClick={() => setOpen(null)}>{t("Close")}</button>
          {total > 1 && (
            <>
              <button type="button" aria-label={t("Previous photo")} className="btn-gold absolute left-3 top-1/2 -translate-y-1/2 !px-4 !py-3" onClick={(e) => { e.stopPropagation(); step(-1); }}>‹</button>
              <button type="button" aria-label={t("Next photo")} className="btn-gold absolute right-3 top-1/2 -translate-y-1/2 !px-4 !py-3" onClick={(e) => { e.stopPropagation(); step(1); }}>›</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
