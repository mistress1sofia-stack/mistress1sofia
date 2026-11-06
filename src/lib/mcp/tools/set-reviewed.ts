import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "set_request_reviewed",
  title: "Mark request reviewed",
  description: "Mark an application or booking request as reviewed, or back to new (owner account only).",
  inputSchema: {
    type: z.enum(["applications", "booking_requests"]).describe("Which inbox the request is in."),
    id: z.string().uuid().describe("Request id from list_requests."),
    reviewed: z.boolean().describe("true = reviewed, false = new."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ type, id, reviewed }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not authenticated");
    const { data, error } = await supabaseForUser(ctx).from(type).update({ reviewed_at: reviewed ? new Date().toISOString() : null }).eq("id", id).select("id");
    if (error) throw new ToolError(error.message);
    if (!data?.length) throw new ToolError("Request not found.");
    return { content: [{ type: "text", text: reviewed ? "Marked reviewed." : "Marked as new." }] };
  },
});
