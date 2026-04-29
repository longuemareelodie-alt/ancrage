// Endpoint deprecated: Ancrage no longer offers subscriptions, so there is
// nothing to cancel from the client. Kept as a 410 Gone stub.
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "Subscriptions are no longer offered. Nothing to cancel.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
