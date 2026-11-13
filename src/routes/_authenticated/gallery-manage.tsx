import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GALLERY_BUCKET, listGallery, type GalleryImage } from '@/lib/gallery';

export const Route = createFileRoute('/_authenticated/gallery-manage')({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: 'Manage Gallery — Mistress Sofia' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: GalleryManage,
});

const MAX_SIDE = 1600;

// Re-draws the photo onto a canvas and saves it as a fresh JPEG. This shrinks it for fast loading and
// also drops all hidden photo data (GPS location, camera details, dates), so nothing identifying is uploaded.
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process images.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process the image.'))), 'image/jpeg', 0.85));
}

function GalleryManage() {
  const [images, setImages] = useState<GalleryImage[] | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { setImages(await listGallery()); }
    catch (error) { setImages([]); setMessage(error instanceof Error ? error.message : 'Could not load the gallery.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMessage('');
    let done = 0; const problems: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const blob = await prepare(file);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(name, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (error) throw error;
        done += 1;
      } catch (error) { problems.push(`${file.name}: ${error instanceof Error ? error.message : 'failed'}`); }
    }
    if (fileRef.current) fileRef.current.value = '';
    setMessage(`${done} photo${done === 1 ? '' : 's'} added.${problems.length ? ' Problems: ' + problems.join('; ') : ''}`);
    await load(); setBusy(false);
  }

  async function remove(name: string) {
    if (confirming !== name) { setConfirming(name); return; }
    setBusy(true); setMessage(''); setConfirming(null);
    const { error } = await supabase.storage.from(GALLERY_BUCKET).remove([name]);
    setMessage(error ? error.message : 'Photo deleted.');
    await load(); setBusy(false);
  }

  return <section className="mx-auto max-w-5xl px-6 py-16">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><ImagePlus className="mb-3 size-6 text-gold" /><h1 className="text-4xl text-gold">Manage gallery</h1></div>
      <Link to="/admin" className="btn-gold">Back to inbox</Link>
    </div>
    <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">Add photos from your phone. Each one is shrunk and stripped of hidden location data before upload. Only post images where any other person cannot be identified, and check backgrounds for anything that shows where you are.</p>
    <div className="mt-8">
      <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" id="gallery-files" disabled={busy} onChange={(e) => void onPick(e.target.files)} />
      <Button type="button" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Please wait…' : 'Add photos'}</Button>
    </div>
    {message && <p role="status" className="mt-5 text-sm text-gold break-words">{message}</p>}
    {images === null ? <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      : images.length === 0 ? <p className="mt-10 text-sm text-muted-foreground">No photos yet.</p>
      : <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => <div key={img.name} className="border border-border">
          <img src={img.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
          <button type="button" disabled={busy} onClick={() => void remove(img.name)} className={`flex w-full items-center justify-center gap-2 py-3 text-xs uppercase tracking-[0.2em] ${confirming === img.name ? 'bg-destructive/20 text-danger' : 'text-muted-foreground hover:text-gold'}`}>
            <Trash2 className="size-4" />{confirming === img.name ? 'Tap again to delete' : 'Delete'}
          </button>
        </div>)}
      </div>}
  </section>;
}
