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

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const parseRequestBody = (rawBody: string, contentType: string) => {
  if (!rawBody.trim()) {
    return null;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    const params = new URLSearchParams(rawBody);
    const hasParams = Array.from(params.keys()).length > 0;
    return hasParams ? Object.fromEntries(params.entries()) : { raw: rawBody };
  }
};

const extractWebhookIds = (payload: any) => {
  const explicitPaymentId = firstString(
    payload?.paymentId,
    payload?.payment_id,
    payload?.payment?.id,
    payload?.data?.paymentId,
    payload?.data?.payment_id,
    payload?.data?.payment?.id,
    payload?.entityId,
    payload?.resourceId,
    payload?._embedded?.payment?.id,
    payload?._embedded?.entity?.id,
  );

  const rawId = firstString(payload?.id);
  const paymentId =
    explicitPaymentId ?? (rawId && !rawId.startsWith("event_") ? rawId : null);

  return { rawId, paymentId };
};

const extractPaymentEmail = (payment: any) =>
  firstString(
    payment?.metadata?.email,
    payment?.metadata?.customer_email,
    payment?.billingEmail,
    payment?.customerEmail,
    payment?.details?.billingEmail,
    payment?.customer?.email,
    payment?._embedded?.customer?.email,
  );

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    const rawBody = await req.text();
    const payload = parseRequestBody(rawBody, contentType);
    const { rawId, paymentId } = extractWebhookIds(payload);

    console.log(
      "Webhook received:",
      JSON.stringify({
        contentType,
        rawId,
        paymentId,
        payloadKeys:
          payload && typeof payload === "object" ? Object.keys(payload).slice(0, 10) : [],
      }),
    );

    if (!paymentId) {
      console.error("Unable to extract payment id from webhook payload", payload);
      return jsonResponse({
        status: "ignored",
        action: "none",
        reason: "payment_id_not_found",
        raw_id: rawId,
      });
    }

    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mollieKey || !supabaseUrl || !serviceRoleKey) {
      console.error("Missing env vars:", {
        hasMollie: !!mollieKey,
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return jsonResponse({ error: "Server config error" }, 500);
    }

    const mollieRes = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mollieKey}` } }
    );

    if (!mollieRes.ok) {
      const errText = await mollieRes.text();
      console.error("Mollie API error:", mollieRes.status, errText);

      if (mollieRes.status === 404) {
        return jsonResponse({
          status: "ignored",
          action: "none",
          reason: "payment_not_found",
          payment_id: paymentId,
          raw_id: rawId,
        });
      }

      return jsonResponse({ error: "Failed to fetch payment from Mollie" }, 502);
    }

    const payment = await mollieRes.json();
    console.log(
      "Payment details:",
      JSON.stringify({
        id: payment.id,
        status: payment.status,
        metadata: payment.metadata,
        amount: payment.amount,
        billingEmail: payment.billingEmail ?? payment.details?.billingEmail ?? null,
      }),
    );

    if (payment.status !== "paid") {
      console.log("Payment not paid, status:", payment.status);
      return jsonResponse({ status: payment.status, action: "none" });
    }

    const userId = firstString(payment.metadata?.user_id, payment.metadata?.userId);
    const email = extractPaymentEmail(payment);

    if (!userId && !email) {
      console.error(
        "No user_id or email found for payment",
        paymentId,
        JSON.stringify({ metadata: payment.metadata, paymentId: payment.id })
      );
      return jsonResponse({
        status: "ignored",
        action: "none",
        reason: "user_identifier_missing",
        payment_id: payment.id,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let profile: { user_id: string; email: string | null; is_premium: boolean } | null = null;

    if (userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, is_premium")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Profile lookup by user_id failed:", error.message, error.details);
      } else {
        profile = data;
      }
    }

    if (!profile && email) {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, is_premium")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Profile lookup by email failed:", error.message, error.details);
      } else {
        profile = data;
      }
    }

    if (!profile && userId) {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          email,
          first_name: "",
          is_premium: true,
        })
        .select("user_id, email, is_premium")
        .single();

      if (error) {
        console.error("Profile insert by user_id failed:", error.message, error.details);
      } else {
        profile = data;
      }
    }

    if (!profile && email) {
      const { data: userListData, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.error("Auth user lookup by email failed:", usersError.message);
      } else {
        const authUser = userListData.users.find(
          (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
        );

        if (authUser) {
          const { data, error } = await supabase
            .from("profiles")
            .insert({
              user_id: authUser.id,
              email: authUser.email ?? email,
              first_name:
                typeof authUser.user_metadata?.first_name === "string"
                  ? authUser.user_metadata.first_name
                  : "",
              is_premium: true,
            })
            .select("user_id, email, is_premium")
            .single();

          if (error) {
            console.error("Profile insert by email failed:", error.message, error.details);
          } else {
            profile = data;
          }
        }
      }
    }

    if (!profile) {
      console.error("No profile found for payment", payment.id, JSON.stringify({ userId, email }));
      return jsonResponse({
        status: "ignored",
        action: "none",
        reason: "profile_not_found",
        payment_id: payment.id,
      });
    }

    if (profile.is_premium) {
      console.log("Profile already premium:", JSON.stringify(profile));
      return jsonResponse({
        status: "premium_already_active",
        user_id: profile.user_id,
        email: profile.email,
      });
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("user_id", profile.user_id)
      .select("user_id, email, is_premium")
      .single();

    if (updateError) {
      console.error("DB update error:", updateError.message, updateError.details);
      return jsonResponse({ error: "Failed to update profile" }, 500);
    }

    console.log("Premium activated:", JSON.stringify(updatedProfile));

    return jsonResponse({
      status: "premium_activated",
      user_id: updatedProfile.user_id,
      email: updatedProfile.email,
    });
  } catch (err) {
    console.error("Webhook error:", err?.message || err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
