import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "list_transformation_portraits",
  title: "List my transformation portraits",
  description:
    "Return the signed-in user's monthly AI-generated transformation portraits, newest first. Each portrait describes what the user has overcome, what she is developing, her new strengths, and what she is becoming.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(24)
      .optional()
      .describe("How many portraits to return (1-24, default 6)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("transformation_portraits")
      .select(
        "id, year, month, overcome, developing, new_strengths, becoming, entry_count, created_at",
      )
      .eq("user_id", ctx.getUserId())
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(limit ?? 6);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { portraits: data ?? [] },
    };
  },
});
