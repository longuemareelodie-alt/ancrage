import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse payment ID from Mollie webhook (form-encoded or JSON)
    let paymentId: string | null = null;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      paymentId = formData.get("id") as string;
    } else {
      const body = await req.json();
      paymentId = body.id;
    }

    if (!paymentId) {
      console.error("Missing payment id in webhook body");
      return new Response(JSON.stringify({ error: "Missing payment id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Webhook received for payment:", paymentId);

    // Validate env vars
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mollieKey || !supabaseUrl || !serviceRoleKey) {
      console.error("Missing env vars:", {
        hasMollie: !!mollieKey,
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mollie
    const mollieRes = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mollieKey}` } }
    );

    if (!mollieRes.ok) {
      const errText = await mollieRes.text();
      console.error("Mollie API error:", mollieRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment from Mollie" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payment = await mollieRes.json();
    console.log("Payment details:", JSON.stringify({
      id: payment.id,
      status: payment.status,
      metadata: payment.metadata,
      amount: payment.amount,
    }));

    // Only activate premium on paid status
    if (payment.status !== "paid") {
      console.log("Payment not paid, status:", payment.status);
      return new Response(
        JSON.stringify({ status: payment.status, action: "none" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract user identifier from payment metadata
    // Support both user_id and email for flexibility
    const userId = payment.metadata?.user_id;
    const email = payment.metadata?.email;

    if (!userId && !email) {
      console.error(
        "No user_id or email in payment metadata for",
        paymentId,
        "metadata:",
        JSON.stringify(payment.metadata)
      );
      return new Response(
        JSON.stringify({ error: "No user identifier in payment metadata" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update profile to premium using service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let updateQuery = supabase
      .from("profiles")
      .update({ is_premium: true });

    // Prefer user_id over email for matching
    if (userId) {
      updateQuery = updateQuery.eq("user_id", userId);
    } else {
      updateQuery = updateQuery.eq("email", email);
    }

    const { data, error: updateError, count } = await updateQuery.select("user_id, email, is_premium");

    if (updateError) {
      console.error("DB update error:", updateError.message, updateError.details);
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data || data.length === 0) {
      console.error("No profile found for", userId ? `user_id=${userId}` : `email=${email}`);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Premium activated:", JSON.stringify(data[0]));

    return new Response(
      JSON.stringify({
        status: "premium_activated",
        user_id: data[0].user_id,
        email: data[0].email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Webhook error:", err?.message || err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
