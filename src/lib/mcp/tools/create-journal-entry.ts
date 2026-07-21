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
  name: "create_journal_entry",
  title: "Create a journal entry",
  description:
    "Add a new private journal entry for the signed-in user. Use for reflections, feelings, or notes the user dictates.",
  inputSchema: {
    content: z.string().trim().min(1).describe("The journal entry text."),
    mood: z
      .string()
      .trim()
      .max(40)
      .optional()
      .describe("Optional short mood label (e.g. 'calme', 'tendue')."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ content, mood }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("private_journal_entries")
      .insert({ user_id: ctx.getUserId(), content, mood: mood ?? null })
      .select("id, created_at, content, mood")
      .maybeSingle();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Entry saved (id ${data?.id}).` }],
      structuredContent: { entry: data },
    };
  },
});
