import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Mollie sends a POST with form-encoded body containing "id"
    const formData = await req.formData();
    const paymentId = formData.get("id") as string;

    if (!paymentId) {
      return new Response(JSON.stringify({ error: "Missing payment id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mollie API
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieKey) {
      console.error("MOLLIE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mollieRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mollieKey}` },
    });

    if (!mollieRes.ok) {
      const errText = await mollieRes.text();
      console.error("Mollie API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await mollieRes.json();
    console.log("Payment status:", payment.status, "for", paymentId);

    // Only activate premium on paid status
    if (payment.status !== "paid") {
      return new Response(JSON.stringify({ status: payment.status, action: "none" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract user email from payment metadata
    // When creating Mollie payment, include metadata: { email: user_email }
    const email = payment.metadata?.email;

    if (!email) {
      console.error("No email in payment metadata for", paymentId);
      return new Response(JSON.stringify({ error: "No email in payment metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile to premium using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("email", email);

    if (updateError) {
      console.error("DB update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Premium activated for", email);

    return new Response(JSON.stringify({ status: "premium_activated", email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
