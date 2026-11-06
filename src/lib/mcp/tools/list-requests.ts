import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_requests",
  title: "List requests",
  description: "List saved applications or booking requests in the owner's private inbox (owner account only).",
  inputSchema: {
    type: z.enum(["applications", "booking_requests"]).describe("Which inbox to read."),
    status: z.enum(["new", "all"]).default("new").describe("Only unreviewed requests, or all."),
    limit: z.number().int().min(1).max(100).default(25).describe("Maximum rows to return."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ type, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    let query = supabaseForUser(ctx).from(type).select("id, reference, name, email, created_at, reviewed_at").order("created_at", { ascending: false }).limit(limit);
    if (status === "new") query = query.is("reviewed_at", null);
    const { data, error } = await query;
    if (error) throw new ToolError(error.message);
    const rows = data ?? [];
    return {
      content: [{ type: "text", text: rows.length ? rows.map(r => `${r.id} · ${r.reference} · ${r.name ?? "Unnamed"} · ${r.reviewed_at ? "reviewed" : "new"}`).join("\n") : "No requests (or this account has no inbox access)." }],
      structuredContent: { rows },
    };
  },
});
