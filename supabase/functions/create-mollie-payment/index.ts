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

    // Parse optional redirect URL from request body
    let redirectUrl = "https://ancrage.lovable.app/dashboard?payment=success";
    let webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    try {
      const body = await req.json();
      if (body?.redirectUrl) redirectUrl = body.redirectUrl;
      if (body?.webhookUrl) webhookUrl = body.webhookUrl;
    } catch {
      // No body or invalid JSON — use defaults
    }

    // Create Mollie payment with user metadata
    const molliePayload = {
      amount: { currency: "EUR", value: "29.00" },
      description: "ANCRAGE — Accès Premium",
      redirectUrl,
      webhookUrl,
      metadata: {
        user_id: user.id,
        email: user.email,
        type: "lifetime",
      },
    };

    console.log("Creating Mollie payment:", JSON.stringify({
      user_id: user.id,
      email: user.email,
      redirectUrl,
      webhookUrl,
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