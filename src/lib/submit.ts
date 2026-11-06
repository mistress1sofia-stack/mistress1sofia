import { supabase } from "@/integrations/supabase/client";

// Keys that must never be persisted: payment credentials and local-only artifacts.
const BLOCKED_KEYS = new Set(["code", "cardImage", "giftCardCode", "wallet", "password"]);

export function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(details).filter(([key]) => !BLOCKED_KEYS.has(key)));
}

export async function saveSubmission(
  table: "applications" | "booking_requests",
  reference: string,
  details: Record<string, unknown>,
) {
  const clean = sanitizeDetails(details);
  const { error } = await supabase.from(table).insert({
    reference,
    name: (clean["name"] as string) ?? null,
    email: (clean["email"] as string) ?? null,
    details: clean as never,
  });
  if (error) throw error;
}
