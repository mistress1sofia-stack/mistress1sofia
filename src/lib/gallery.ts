import { supabase } from "@/integrations/supabase/client";

// Photos live in a public storage bucket called "gallery". Anyone can view them;
// only the signed-in owner can add or remove them (enforced by the backend, not this code).
export const GALLERY_BUCKET = "gallery";
export type GalleryImage = { name: string; url: string };

export async function listGallery(): Promise<GalleryImage[]> {
  const { data, error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f.name))
    .map((f) => ({ name: f.name, url: supabase.storage.from(GALLERY_BUCKET).getPublicUrl(f.name).data.publicUrl }));
}
