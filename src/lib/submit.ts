import { supabase } from "@/integrations/supabase/client";

export async function saveSubmission(
  table: "applications" | "booking_requests",
  reference: string,
  details: Record<string, unknown>,
) {
  const { error } = await supabase.from(table).insert({
    reference,
    name: (details.name as string) ?? null,
    email: (details.email as string) ?? null,
    details: details as never,
  });
  if (error) throw error;
}
