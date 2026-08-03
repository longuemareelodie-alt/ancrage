import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!mollieKey || !supabaseUrl || !anonKey) return json({ error: "Server config error" }, 500);

    // This endpoint exposes payment configuration and can create diagnostic
    // payments on the live Mollie account: admins only.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }
    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authed.auth.getUser();
    const userId = userData?.user?.id;
    if (userErr || !userId) return json({ error: "unauthorized" }, 401);
    const { data: isAdmin } = await authed.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (isAdmin !== true) return json({ error: "forbidden" }, 403);


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

    // Optional deep test: try to create a Klarna-ONLY payment so Mollie
    // tells us exactly why Klarna would be rejected (then we don't pay it —
    // the payment simply expires).
    let klarnaTest: unknown = undefined;
    if (url.searchParams.get("testKlarna") === "1") {
      const value = Number(amount).toFixed(2);
      const vat = (Math.round(Number(amount) * 100 / 6) / 100).toFixed(2);
      const res2 = await fetch("https://api.mollie.com/v2/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mollieKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: { currency: "EUR", value },
          description: "Diagnostic Klarna (ne pas payer)",
          redirectUrl: "https://digitalmamanlibre.com/payment-pending",
          locale: "fr_FR",
          method: "klarna",

          lines: [
            {
              type: "digital",
              description: "Diagnostic Klarna",
              quantity: 1,
              quantityUnit: "pcs",
              unitPrice: { currency: "EUR", value },
              totalAmount: { currency: "EUR", value },
              vatRate: "20.00",
              vatAmount: { currency: "EUR", value: vat },
              sku: "diagnostic",
            },
          ],
        }),
      });
      const body2 = await res2.json();
      klarnaTest = {
        status: res2.status,
        ok: res2.ok,
        paymentId: body2?.id ?? null,
        checkoutUrl: body2?._links?.checkout?.href ?? null,
        error: res2.ok ? null : body2,
      };
    }

    return json({
      mode: mollieKey.startsWith("live_") ? "live" : "test",
      amount,
      klarnaAvailable: klarnaIds.length > 0,
      klarnaIds,
      methods,
      klarnaTest,
    });
  } catch (e) {
    console.error("check-mollie-methods error:", (e as Error)?.message);
    return json({ error: "internal_error" }, 500);
  }
});
