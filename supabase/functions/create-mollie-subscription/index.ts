// Endpoint deprecated: Eclosia no longer offers subscriptions.
// Kept as a 410 Gone stub so any stale client receives a clear error.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      error: "Subscriptions are no longer offered. Use create-mollie-payment for the one-time 57€ purchase.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
