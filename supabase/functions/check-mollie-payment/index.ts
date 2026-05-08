const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    let paymentId = url.searchParams.get("paymentId");
    if (!paymentId && (req.method === "POST")) {
      try {
        const body = await req.json();
        if (typeof body?.paymentId === "string") paymentId = body.paymentId;
      } catch { /* ignore */ }
    }

    if (!paymentId || !/^tr_[A-Za-z0-9]+$/.test(paymentId)) {
      return json({ error: "invalid_payment_id" }, 400);
    }

    const res = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Mollie GET payment failed:", res.status, JSON.stringify(data));
      return json({ error: "mollie_lookup_failed", details: data }, 502);
    }

    return json({
      id: data.id,
      status: data.status, // open | pending | paid | canceled | failed | expired | authorized
      amount: data.amount,
      metadata: data.metadata ?? null,
    });
  } catch (e) {
    console.error("check-mollie-payment error:", (e as Error)?.message);
    return json({ error: "internal_error" }, 500);
  }
});
