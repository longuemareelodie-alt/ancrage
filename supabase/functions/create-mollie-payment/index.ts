import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");

    if (!mollieKey) {
      console.error("MOLLIE_API_KEY not set");
      return jsonResponse({ error: "Server config error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Parse optional redirect URL + promo code from request body
    let redirectUrl = "https://ancrage.lovable.app/dashboard?payment=success";
    let webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;
    let rawPromoCode: string | null = null;

    try {
      const body = await req.json();
      if (body?.redirectUrl) redirectUrl = body.redirectUrl;
      if (body?.webhookUrl) webhookUrl = body.webhookUrl;
      if (typeof body?.promoCode === "string") rawPromoCode = body.promoCode;
    } catch {
      // No body or invalid JSON — use defaults
    }

    // ---- Promo code validation (server-authoritative) ----
    // Catalog of accepted promo codes. Discounts are in EUR cents.
    // Keep this list short and explicit; never trust the client.
    const PROMO_CATALOG: Record<string, { discountCents: number; label: string }> = {
      ANCRAGE15: { discountCents: 1500, label: "Ancrage15 (-15€)" },
    };

    const BASE_PRICE_CENTS = 3900; // 39.00 EUR

    const normalizedPromo = (rawPromoCode ?? "").trim().toUpperCase();
    const promo = normalizedPromo ? PROMO_CATALOG[normalizedPromo] : null;

    // If client sent a code but it's invalid → reject explicitly so the UI can
    // tell the user. Empty/null = no promo, proceed at full price.
    if (normalizedPromo && !promo) {
      return jsonResponse({ error: "invalid_promo_code", code: normalizedPromo }, 400);
    }

    const discountCents = promo?.discountCents ?? 0;
    const finalCents = Math.max(0, BASE_PRICE_CENTS - discountCents);
    // Mollie minimum is 1 cent for EUR — guard against a free total.
    if (finalCents < 100) {
      return jsonResponse({ error: "amount_below_minimum" }, 400);
    }
    const finalAmountEur = (finalCents / 100).toFixed(2);

    const description = promo
      ? `ANCRAGE — Accès Premium (${promo.label})`
      : "ANCRAGE — Accès Premium";

    // Create Mollie payment with user metadata
    const molliePayload = {
      amount: { currency: "EUR", value: finalAmountEur },
      description,
      redirectUrl,
      webhookUrl,
      metadata: {
        user_id: user.id,
        email: user.email,
        type: "lifetime",
        base_price_cents: BASE_PRICE_CENTS,
        discount_cents: discountCents,
        final_cents: finalCents,
        promo_code: promo ? normalizedPromo : null,
      },
    };

    console.log("Creating Mollie payment:", JSON.stringify({
      user_id: user.id,
      email: user.email,
      redirectUrl,
      webhookUrl,
      promo_code: promo ? normalizedPromo : null,
      final_cents: finalCents,
    }));

    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(molliePayload),
    });

    const mollieData = await mollieRes.json();

    if (!mollieRes.ok) {
      console.error("Mollie create payment error:", mollieRes.status, JSON.stringify(mollieData));
      return jsonResponse({ error: "Failed to create payment", details: mollieData }, 502);
    }

    const checkoutUrl = mollieData._links?.checkout?.href;

    if (!checkoutUrl) {
      console.error("No checkout URL in Mollie response:", JSON.stringify(mollieData));
      return jsonResponse({ error: "No checkout URL returned" }, 502);
    }

    console.log("Payment created:", JSON.stringify({
      payment_id: mollieData.id,
      status: mollieData.status,
      checkoutUrl,
    }));

    return jsonResponse({
      checkoutUrl,
      paymentId: mollieData.id,
      status: mollieData.status,
    });
  } catch (err) {
    console.error("Create payment error:", err?.message || err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});