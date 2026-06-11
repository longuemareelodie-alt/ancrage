import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) return json({ error: "Server config error" }, 500);

    const url = new URL(req.url);
    const amount = url.searchParams.get("amount") ?? "57.00";

    const params = new URLSearchParams({
      "amount[value]": amount,
      "amount[currency]": "EUR",
      "billingCountry": "FR",
      "resource": "payments",
      "includeWallets": "applepay",
      "locale": "fr_FR",
    });

    const res = await fetch(`https://api.mollie.com/v2/methods?${params}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Mollie methods failed:", res.status, JSON.stringify(data));
      return json({ error: "mollie_methods_failed", details: data }, 502);
    }

    const methods: Array<{ id: string; description: string }> =
      (data?._embedded?.methods ?? []).map((m: any) => ({
        id: m.id,
        description: m.description,
      }));
    const klarnaIds = methods.filter((m) => m.id.startsWith("klarna")).map((m) => m.id);

    return json({
      mode: mollieKey.startsWith("live_") ? "live" : "test",
      amount,
      klarnaAvailable: klarnaIds.length > 0,
      klarnaIds,
      methods,
    });
  } catch (e) {
    console.error("check-mollie-methods error:", (e as Error)?.message);
    return json({ error: "internal_error" }, 500);
  }
});
