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

const asRecord = (value: unknown): Record<string, any> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null;

const getHref = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  return firstString(asRecord(value)?.href);
};

const extractTokenFromHref = (href: unknown, prefix: "tr_" | "pl_") => {
  if (typeof href !== "string") {
    return null;
  }

  return href.match(new RegExp(`${prefix}[^/?#]+`))?.[0] ?? null;
};

const getEmbeddedPayments = (value: any) => {
  const payments = value?._embedded?.payments;
  return Array.isArray(payments) ? payments : [];
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
  const root = asRecord(payload);
  const data = asRecord(root?.data);
  const resourceObject = asRecord(root?.resource);
  const embedded = asRecord(root?._embedded);
  const rootLinks = asRecord(root?._links);
  const resourceLinks = asRecord(resourceObject?._links);
  const dataLinks = asRecord(data?._links);
  const embeddedEntity = asRecord(embedded?.entity);
  const embeddedPayment = asRecord(embedded?.payment);
  const rootPayment = asRecord(root?.payment);
  const dataPayment = asRecord(data?.payment);
  const resourcePayment = asRecord(resourceObject?.payment);

  const isPaymentId = (id: string | null) => Boolean(id?.startsWith("tr_"));
  const isPaymentLinkId = (id: string | null) => Boolean(id?.startsWith("pl_"));

  const rawId = firstString(root?.id);
  const eventType = firstString(
    root?.type,
    root?.event,
    root?.eventType,
    data?.type,
    resourceObject?.type,
  );
  const resourceType = firstString(
    typeof root?.resource === "string" ? root.resource : null,
    resourceObject?.resource,
    data?.resource,
  );

  const paymentCandidates = [
    rawId,
    root?.paymentId,
    root?.payment_id,
    rootPayment?.id,
    data?.id,
    data?.paymentId,
    data?.payment_id,
    dataPayment?.id,
    resourceObject?.id,
    resourceObject?.paymentId,
    resourceObject?.payment_id,
    resourcePayment?.id,
    embeddedPayment?.id,
    extractTokenFromHref(getHref(rootLinks?.payment), "tr_"),
    extractTokenFromHref(getHref(resourceLinks?.payment), "tr_"),
    extractTokenFromHref(getHref(dataLinks?.payment), "tr_"),
    extractTokenFromHref(getHref(rootLinks?.self), "tr_"),
  ];

  const paymentLinkCandidates = [
    rawId,
    root?.paymentLinkId,
    root?.payment_link_id,
    root?.entityId,
    data?.id,
    data?.paymentLinkId,
    data?.payment_link_id,
    resourceObject?.id,
    resourceObject?.paymentLinkId,
    resourceObject?.payment_link_id,
    embeddedEntity?.id,
    extractTokenFromHref(getHref(rootLinks?.paymentLink), "pl_"),
    extractTokenFromHref(getHref(rootLinks?.entity), "pl_"),
    extractTokenFromHref(getHref(resourceLinks?.paymentLink), "pl_"),
    extractTokenFromHref(getHref(resourceLinks?.self), "pl_"),
    extractTokenFromHref(getHref(dataLinks?.paymentLink), "pl_"),
    extractTokenFromHref(getHref(rootLinks?.self), "pl_"),
  ];

  const paymentId =
    firstString(
      ...paymentCandidates.filter((candidate) =>
        typeof candidate === "string" && isPaymentId(candidate),
      ),
    ) ?? null;

  const paymentLinkId =
    firstString(
      ...paymentLinkCandidates.filter((candidate) =>
        typeof candidate === "string" && isPaymentLinkId(candidate),
      ),
    ) ?? null;

  const isEventId = rawId?.startsWith("event_") || rawId?.startsWith("evt_");
  const isPaymentLinkEvent =
    Boolean(eventType?.startsWith("payment-link."))
    || resourceType === "payment-link"
    || isPaymentLinkId(paymentLinkId);

  return {
    rawId,
    paymentId,
    paymentLinkId,
    eventType,
    isEventId,
    isPaymentLinkEvent,
    resourceType,
  };
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
    const {
      rawId,
      paymentId: directPaymentId,
      paymentLinkId,
      eventType,
      isEventId,
      isPaymentLinkEvent,
      resourceType,
    } = extractWebhookIds(payload);

    console.log(
      "Webhook received:",
      JSON.stringify({
        contentType,
        rawId,
        directPaymentId,
        paymentLinkId,
        eventType,
          resourceType,
        isEventId,
          isPaymentLinkEvent,
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

    if (eventType === "hook.ping") {
      return webhookAck({ status: "hook_ping", action: "none" });
    }

    // --- Resolve the payment ID through multiple strategies ---
    let paymentId = directPaymentId;
    const mollieHeaders = { Authorization: `Bearer ${mollieKey}` };

    // Strategy 1: If we have a payment-link event or payment-link ID, fetch its payments
    if (!paymentId && paymentLinkId && isPaymentLinkEvent) {
      console.log("Resolving payment from payment-link:", paymentLinkId);
      try {
        const plRes = await fetch(
          `https://api.mollie.com/v2/payment-links/${paymentLinkId}?include=payments`,
          { headers: mollieHeaders },
        );
        if (plRes.ok) {
          const plData = await plRes.json();
          const embeddedPayments = getEmbeddedPayments(plData);
          console.log("Payment-link data:", JSON.stringify({
            id: plData.id,
            status: plData.status,
            paidAt: plData.paidAt,
            _links: plData._links ? Object.keys(plData._links) : [],
            embeddedPayments: embeddedPayments.length,
          }));
          const paidPayment = embeddedPayments.find(
            (candidate: any) => candidate?.status === "paid" && typeof candidate?.id === "string",
          );
          const latestPayment = embeddedPayments.find(
            (candidate: any) => typeof candidate?.id === "string",
          );
          const paymentIdFromLinks = extractTokenFromHref(
            getHref(asRecord(plData?._links)?.payment),
            "tr_",
          );

          if (paidPayment?.id) {
            paymentId = paidPayment.id;
            console.log("Found paid payment from payment-link:", paymentId);
          } else if (latestPayment?.id) {
            paymentId = latestPayment.id;
            console.log("Using fallback payment from payment-link:", paymentId);
          } else if (paymentIdFromLinks) {
            paymentId = paymentIdFromLinks;
            console.log("Found payment from payment-link _links:", paymentId);
          }
        } else {
          const errText = await plRes.text();
          console.error("Payment-link fetch error:", plRes.status, errText);
        }
      } catch (err) {
        console.error("Payment-link fetch exception:", err?.message || err);
      }
    }

    // If we still have no payment ID, acknowledge and exit
    if (!paymentId) {
      console.error("Unable to resolve payment ID from webhook", JSON.stringify({
        rawId, directPaymentId, paymentLinkId, eventType, isEventId, resourceType,
      }));
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "payment_id_not_resolved",
        raw_id: rawId,
        payment_link_id: paymentLinkId,
        event_type: eventType,
        resource_type: resourceType,
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
