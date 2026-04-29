// Endpoint deprecated: Ancrage no longer offers subscriptions.
// Kept as a 410 Gone stub so any stale client receives a clear error.
import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "Subscriptions are no longer offered. Use create-mollie-payment for the one-time 39€ purchase.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
