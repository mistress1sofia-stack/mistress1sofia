import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listRequests from "./tools/list-requests";
import getRequest from "./tools/get-request";
import setReviewed from "./tools/set-reviewed";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "mistress-sofia",
  title: "Mistress Sofia",
  version: "0.1.0",
  instructions: "Private inbox tools for Mistress Sofia's owner account: list, read and mark applications and booking requests as reviewed.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listRequests, getRequest, setReviewed],
});
