import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

type RuntimeGlobals = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  return (globalThis as RuntimeGlobals).process?.env?.[name]?.trim() || undefined;
}

function supabaseProjectUrl(): string {
  const url = runtimeEnv("SUPABASE_URL") ?? runtimeEnv("VITE_SUPABASE_URL");
  if (!url) throw new Error("SUPABASE_URL is required");
  return url;
}

function supabasePublishableKey(): string {
  const key = runtimeEnv("SUPABASE_PUBLISHABLE_KEY") ?? runtimeEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!key) throw new Error("SUPABASE_PUBLISHABLE_KEY is required");
  return key;
}

export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  return createClient<Database>(supabaseProjectUrl(), supabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
