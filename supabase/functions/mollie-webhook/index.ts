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

const webhookAck = (payload: Record<string, unknown> = {}) =>
  jsonResponse({ received: true, ...payload });

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const parseRequestBody = async (
  rawBody: string,
  contentType: string,
  requestClone?: Request,
) => {
  if (contentType.includes("multipart/form-data") && requestClone) {
    try {
      const formData = await requestClone.formData();
      return Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          typeof value === "string" ? value : value.name,
        ]),
      );
    } catch (error) {
      console.error("Failed to parse multipart body:", error?.message || error);
    }
  }

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
  // Only accept IDs that look like Mollie payment tokens (tr_*)
  const isPaymentId = (id: string | null) => id && id.startsWith("tr_");
  const isPaymentLinkId = (id: string | null) => id && id.startsWith("pl_");

  // Look for explicit payment IDs in various locations
  const candidates = [
    payload?.paymentId,
    payload?.payment_id,
    payload?.payment?.id,
    payload?.data?.paymentId,
    payload?.data?.payment_id,
    payload?.data?.payment?.id,
    payload?._embedded?.payment?.id,
  ];

  const explicitPaymentId = firstString(...candidates.filter((c) => {
    const s = typeof c === "string" ? c : null;
    return s && isPaymentId(s);
  })) ?? firstString(...candidates);

  const rawId = firstString(payload?.id);

  // Only use rawId as paymentId if it looks like a payment token
  const paymentId =
    (explicitPaymentId && isPaymentId(explicitPaymentId) ? explicitPaymentId : null)
    ?? (rawId && isPaymentId(rawId) ? rawId : null);

  // Detect payment-link ID (pl_*) which needs separate handling
  const entityId = firstString(payload?.entityId, payload?._embedded?.entity?.id);
  const paymentLinkId = firstString(
    payload?.paymentLinkId,
    payload?.payment_link_id,
    payload?.data?.paymentLinkId,
    payload?.data?.payment_link_id,
  )
    ?? (entityId && isPaymentLinkId(entityId) ? entityId : null)
    ?? (rawId && isPaymentLinkId(rawId) ? rawId : null);

  // Also extract payment-link ID from _links
  const plFromLinks = !paymentLinkId
    ? firstString(
        payload?._links?.paymentLink?.href?.match?.(/payment-links\/(pl_\w+)/)?.[1],
        payload?._links?.entity?.href?.match?.(/payment-links\/(pl_\w+)/)?.[1],
        payload?._embedded?.entity?._links?.self?.href?.match?.(/payment-links\/(pl_\w+)/)?.[1],
      )
    : null;

  const resolvedPlId = paymentLinkId ?? plFromLinks;

  // Detect event type from payload
  const eventType = firstString(
    payload?.type,
    payload?.event,
    payload?.eventType,
    payload?.data?.type,
  );

  // Check if rawId is an event ID that needs resolution
  const isEventId = rawId?.startsWith("event_") || rawId?.startsWith("evt_");

  return { rawId, paymentId, paymentLinkId: resolvedPlId, eventType, isEventId };
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
    const requestClone = req.clone();
    const rawBody = await req.text();

    console.log("Received webhook body:", rawBody || "<empty>");

    const payload = await parseRequestBody(rawBody, contentType, requestClone);
    const { rawId, paymentId: directPaymentId, paymentLinkId, eventType, isEventId } = extractWebhookIds(payload);

    console.log(
      "Webhook received:",
      JSON.stringify({
        contentType,
        rawId,
        directPaymentId,
        paymentLinkId,
        eventType,
        isEventId,
        payloadKeys:
          payload && typeof payload === "object" ? Object.keys(payload).slice(0, 10) : [],
      }),
    );
    console.log("Parsed webhook payload:", JSON.stringify(payload));

    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mollieKey || !supabaseUrl || !serviceRoleKey) {
      console.error("Missing env vars:", {
        hasMollie: !!mollieKey,
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
      });
      return webhookAck({
        status: "error",
        error: "server_config_error",
      });
    }

    // --- Resolve the payment ID through multiple strategies ---
    let paymentId = directPaymentId;
    const mollieHeaders = { Authorization: `Bearer ${mollieKey}` };

    // Strategy 1: If we have a payment-link ID, fetch its payments
    if (!paymentId && paymentLinkId) {
      console.log("Resolving payment from payment-link:", paymentLinkId);
      try {
        const plRes = await fetch(
          `https://api.mollie.com/v2/payment-links/${paymentLinkId}?include=payments`,
          { headers: mollieHeaders },
        );
        if (plRes.ok) {
          const plData = await plRes.json();
          console.log("Payment-link data:", JSON.stringify({
            id: plData.id,
            status: plData.status,
            paidAt: plData.paidAt,
            _links: plData._links ? Object.keys(plData._links) : [],
            embeddedPayments: plData._embedded?.payments?.length ?? 0,
          }));
          // Find the paid payment from embedded payments
          const paidPayment = plData._embedded?.payments?.find(
            (p: any) => p.status === "paid",
          );
          if (paidPayment?.id) {
            paymentId = paidPayment.id;
            console.log("Found paid payment from payment-link:", paymentId);
          } else {
            // Try the last payment
            const lastPayment = plData._embedded?.payments?.slice(-1)[0];
            if (lastPayment?.id) {
              paymentId = lastPayment.id;
              console.log("Using last payment from payment-link:", paymentId);
            }
          }
        } else {
          const errText = await plRes.text();
          console.error("Payment-link fetch error:", plRes.status, errText);
        }
      } catch (err) {
        console.error("Payment-link fetch exception:", err?.message || err);
      }
    }

    // Strategy 2: If we have an event ID, try to fetch the event to get the resource
    if (!paymentId && isEventId && rawId) {
      console.log("Resolving payment from event:", rawId);
      try {
        // Try the events endpoint (next-gen webhooks)
        const evtRes = await fetch(
          `https://api.mollie.com/v2/events/${rawId}`,
          { headers: mollieHeaders },
        );
        if (evtRes.ok) {
          const evtData = await evtRes.json();
          console.log("Event data:", JSON.stringify(evtData));
          // Extract payment ID from event resource
          const resourcePaymentId = firstString(
            evtData?.resource?.id,
            evtData?.data?.id,
            evtData?.paymentId,
            evtData?._links?.payment?.href?.match(/payments\/(tr_\w+)/)?.[1],
          );
          // Extract payment-link ID from event
          const resourcePlId = firstString(
            evtData?.paymentLinkId,
            evtData?.resource?.paymentLinkId,
            evtData?._links?.paymentLink?.href?.match(/payment-links\/(pl_\w+)/)?.[1],
          );
          if (resourcePaymentId) {
            paymentId = resourcePaymentId;
            console.log("Found payment ID from event:", paymentId);
          } else if (resourcePlId) {
            // Fetch payment-link to get payment
            console.log("Found payment-link from event, fetching:", resourcePlId);
            const plRes2 = await fetch(
              `https://api.mollie.com/v2/payment-links/${resourcePlId}?include=payments`,
              { headers: mollieHeaders },
            );
            if (plRes2.ok) {
              const plData2 = await plRes2.json();
              const paidP = plData2._embedded?.payments?.find(
                (p: any) => p.status === "paid",
              ) ?? plData2._embedded?.payments?.slice(-1)[0];
              if (paidP?.id) {
                paymentId = paidP.id;
                console.log("Found payment from event->payment-link:", paymentId);
              }
            } else {
              await plRes2.text(); // consume body
            }
          }
        } else {
          const errText = await evtRes.text();
          console.log("Event fetch returned:", evtRes.status, errText);
        }
      } catch (err) {
        console.error("Event fetch exception:", err?.message || err);
      }
    }

    // If we still have no payment ID, acknowledge and exit
    if (!paymentId) {
      console.error("Unable to resolve payment ID from webhook", JSON.stringify({
        rawId, directPaymentId, paymentLinkId, eventType, isEventId,
      }));
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "payment_id_not_resolved",
        raw_id: rawId,
        payment_link_id: paymentLinkId,
        event_type: eventType,
      });
    }

    // --- Fetch the actual payment details ---
    console.log("Fetching payment details for:", paymentId);
    const mollieRes = await fetch(
      `https://api.mollie.com/v2/payments/${paymentId}`,
      { headers: mollieHeaders },
    );

    if (!mollieRes.ok) {
      const errText = await mollieRes.text();
      console.error("Mollie payment fetch error:", mollieRes.status, errText);
      return webhookAck({
        status: "error",
        error: "mollie_payment_fetch_failed",
        payment_id: paymentId,
        mollie_status: mollieRes.status,
      });
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
      return webhookAck({ status: payment.status, action: "none" });
    }

    const userId = firstString(payment.metadata?.user_id, payment.metadata?.userId);
    const email = extractPaymentEmail(payment);

    if (!userId && !email) {
      console.error(
        "No user_id or email found for payment",
        paymentId,
        JSON.stringify({ metadata: payment.metadata, paymentId: payment.id })
      );
      return webhookAck({
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
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "profile_not_found",
        payment_id: payment.id,
      });
    }

    if (profile.is_premium) {
      console.log("Profile already premium:", JSON.stringify(profile));
      return webhookAck({
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
      return webhookAck({
        status: "error",
        error: "profile_update_failed",
        user_id: profile.user_id,
      });
    }

    console.log("Premium activated:", JSON.stringify(updatedProfile));

    return webhookAck({
      status: "premium_activated",
      user_id: updatedProfile.user_id,
      email: updatedProfile.email,
    });
  } catch (err) {
    console.error("Webhook error:", err?.stack || err?.message || err);
    return webhookAck({
      status: "error",
      error: "internal_error",
    });
  }
});
