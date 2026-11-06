import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_request",
  title: "Get request",
  description: "Read the full details of one application or booking request by id (owner account only).",
  inputSchema: {
    type: z.enum(["applications", "booking_requests"]).describe("Which inbox the request is in."),
    id: z.string().uuid().describe("Request id from list_requests."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ type, id }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const { data, error } = await supabaseForUser(ctx).from(type).select("id, reference, name, email, details, created_at, reviewed_at").eq("id", id).maybeSingle();
    if (error) throw new ToolError(error.message);
    if (!data) throw new ToolError("Request not found.");
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { request: data } };
  },
});
