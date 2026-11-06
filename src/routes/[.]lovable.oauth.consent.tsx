import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  staticData: { sitemap: false },
  ssr: false,
  head: () => ({ meta: [
    { title: "Connect an app — Mistress Sofia" },
    { name: "description", content: "Approve or deny an app's access to your private inbox." },
    { property: "og:title", content: "Connect an app — Mistress Sofia" },
    { property: "og:description", content: "Approve or deny an app's access to your private inbox." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing or invalid.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr } });
  },
  loaderDeps: ({ search }) => ({ id: search.authorization_id }),
  loader: async ({ deps }) => {
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(deps.id);
    if (error) throw new Error("This connection request has expired or is invalid.");
    const d = data as { redirect_url?: string; redirect_to?: string; client?: { name?: string }; redirect_uri?: string; scope?: string } | null;
    const immediate = d?.redirect_url ?? d?.redirect_to;
    if (immediate && !d?.client) throw redirect({ href: immediate });
    return d;
  },
  component: Consent,
  errorComponent: ({ error }) => <section className="mx-auto max-w-md px-6 py-16"><h1 className="text-3xl text-gold">Connection unavailable</h1><p role="alert" className="mt-4">{error instanceof Error ? error.message : "Something went wrong."}</p></section>,
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = details?.client?.name ?? "An app";
  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    const d = data as { redirect_url?: string; redirect_to?: string } | null;
    const target = d?.redirect_url ?? d?.redirect_to;
    if (error || !target) { setBusy(false); setError(approve ? "Could not approve. Please try again." : "Could not cancel. Please try again."); return; }
    window.location.href = target;
  }
  return <section className="mx-auto max-w-md px-6 py-16">
    <h1 className="text-4xl text-gold">Connect {name} to Mistress Sofia</h1>
    <p className="mt-4">{name} will be able to list, read and mark your inbox requests as reviewed, acting as you.</p>
    {details?.redirect_uri && <p className="mt-3 break-all text-sm text-muted-foreground">Returns to: {details.redirect_uri}</p>}
    <p className="mt-3 text-sm text-muted-foreground">Shares your basic profile and email. This does not bypass the inbox's access rules.</p>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <div className="mt-8 grid gap-3">
      <Button disabled={busy} onClick={() => decide(true)}>Approve</Button>
      <Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button>
    </div>
  </section>;
}
