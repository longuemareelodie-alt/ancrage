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
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");

    if (!mollieKey) {
      return jsonResponse({ error: "Server config error" }, 500);
    }

    // Auth user
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

    // Parse body
    let plan: "monthly" | "yearly" = "monthly";
    let redirectUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/payment-success`;
    try {
      const body = await req.json();
      if (body?.plan === "yearly") plan = "yearly";
      if (body?.redirectUrl) redirectUrl = body.redirectUrl;
    } catch {
      // defaults
    }

    const amount = plan === "yearly" ? "59.00" : "9.00";
    const interval = plan === "yearly" ? "12 months" : "1 month";
    const description = plan === "yearly"
      ? "ANCRAGE Premium — Annuel"
      : "ANCRAGE Premium — Mensuel";

    const mollieHeaders = {
      Authorization: `Bearer ${mollieKey}`,
      "Content-Type": "application/json",
    };

    // Service role client for writing subscription data
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // Step 1: Check if user already has a Mollie customer
    const { data: existingSub } = await adminSupabase
      .from("subscriptions")
      .select("mollie_customer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let customerId: string;

    if (existingSub?.mollie_customer_id) {
      customerId = existingSub.mollie_customer_id;
      console.log("Reusing Mollie customer:", customerId);
    } else {
      // Create Mollie customer
      const custRes = await fetch("https://api.mollie.com/v2/customers", {
        method: "POST",
        headers: mollieHeaders,
        body: JSON.stringify({
          name: user.user_metadata?.first_name || user.email?.split("@")[0] || "Utilisatrice",
          email: user.email,
          metadata: { user_id: user.id },
        }),
      });

      const custData = await custRes.json();
      if (!custRes.ok) {
        console.error("Mollie create customer error:", custRes.status, JSON.stringify(custData));
        return jsonResponse({ error: "Failed to create customer", details: custData }, 502);
      }

      customerId = custData.id;
      console.log("Created Mollie customer:", customerId);
    }

    // Step 2: Create first payment with sequenceType "first" to get a mandate
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;
    const paymentRes = await fetch(`https://api.mollie.com/v2/customers/${customerId}/payments`, {
      method: "POST",
      headers: mollieHeaders,
      body: JSON.stringify({
        amount: { currency: "EUR", value: amount },
        description: `${description} — Premier paiement`,
        redirectUrl,
        webhookUrl,
        sequenceType: "first",
        metadata: {
          user_id: user.id,
          email: user.email,
          type: "subscription_first",
          plan,
          interval,
          subscription_amount: amount,
          subscription_description: description,
        },
      }),
    });

    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      console.error("Mollie create payment error:", paymentRes.status, JSON.stringify(paymentData));
      return jsonResponse({ error: "Failed to create payment", details: paymentData }, 502);
    }

    const checkoutUrl = paymentData._links?.checkout?.href;
    if (!checkoutUrl) {
      console.error("No checkout URL:", JSON.stringify(paymentData));
      return jsonResponse({ error: "No checkout URL returned" }, 502);
    }

    // Step 3: Store pending subscription
    await adminSupabase.from("subscriptions").insert({
      user_id: user.id,
      mollie_customer_id: customerId,
      plan,
      status: "pending",
      amount: Math.round(parseFloat(amount) * 100),
    });

    console.log("Subscription payment created:", JSON.stringify({
      payment_id: paymentData.id,
      customer_id: customerId,
      plan,
      checkoutUrl,
    }));

    return jsonResponse({
      checkoutUrl,
      paymentId: paymentData.id,
      customerId,
      plan,
    });
  } catch (err) {
    console.error("Create subscription error:", err?.message || err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
