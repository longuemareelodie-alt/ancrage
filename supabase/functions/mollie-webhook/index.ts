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

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return JSON.stringify({
      serializationError: true,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : String(error),
    });
  }
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause ? safeStringify(error.cause) : null,
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : safeStringify(error),
    stack: null,
    cause: null,
  };
};

const logDebug = (label: string, value?: unknown) => {
  if (typeof value === "undefined") {
    console.log(label);
    return;
  }

  console.log(label, safeStringify(value));
};

const logError = (label: string, error: unknown, context?: unknown) => {
  console.error(
    label,
    safeStringify({
      error: serializeError(error),
      context: typeof context === "undefined" ? null : context,
    }),
  );
};

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

const pickFirstStringMatch = (
  candidates: Array<{ value: unknown; source: string }>,
  predicate: (value: string) => boolean,
) => {
  for (const candidate of candidates) {
    if (typeof candidate.value !== "string") {
      continue;
    }

    const value = candidate.value.trim();
    if (!value || !predicate(value)) {
      continue;
    }

    return { value, source: candidate.source };
  }

  return { value: null, source: null };
};

const safeParseJsonText = (raw: string) => {
  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    logError("Failed to parse JSON text", error, { bodyPreview: raw.slice(0, 1000) });
    return null;
  }
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
      logError("Failed to parse multipart body", error);
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
  const embeddedEntityContext = asRecord(embeddedEntity?.context);
  const rootPayment = asRecord(root?.payment);
  const dataPayment = asRecord(data?.payment);
  const resourcePayment = asRecord(resourceObject?.payment);

  const isPaymentId = (id: string | null) => Boolean(id?.startsWith("tr_"));
  const isPaymentLinkId = (id: string | null) => Boolean(id?.startsWith("pl_"));

  const rawId = firstString(root?.id);
  const rootResourceString = typeof root?.resource === "string" ? root.resource.trim() : null;
  const eventType = firstString(
    root?.type,
    root?.event,
    root?.eventType,
    data?.type,
    resourceObject?.type,
  );
  const resourceType = firstString(
    rootResourceString && !isPaymentId(rootResourceString) && !isPaymentLinkId(rootResourceString)
      ? rootResourceString
      : null,
    resourceObject?.resource,
    data?.resource,
  );

  const paymentMatch = pickFirstStringMatch(
    [
      { value: rawId, source: "body.id" },
      { value: rootResourceString, source: "body.resource" },
      { value: root?.paymentId, source: "body.paymentId" },
      { value: root?.payment_id, source: "body.payment_id" },
      { value: rootPayment?.id, source: "body.payment.id" },
      { value: data?.id, source: "body.data.id" },
      { value: data?.paymentId, source: "body.data.paymentId" },
      { value: data?.payment_id, source: "body.data.payment_id" },
      { value: dataPayment?.id, source: "body.data.payment.id" },
      { value: resourceObject?.id, source: "body.resource.id" },
      { value: resourceObject?.paymentId, source: "body.resource.paymentId" },
      { value: resourceObject?.payment_id, source: "body.resource.payment_id" },
      { value: resourcePayment?.id, source: "body.resource.payment.id" },
      { value: embeddedPayment?.id, source: "body._embedded.payment.id" },
      { value: embeddedEntityContext?.paymentId, source: "body._embedded.entity.context.paymentId" },
      { value: embeddedEntityContext?.payment_id, source: "body._embedded.entity.context.payment_id" },
      {
        value: extractTokenFromHref(getHref(rootLinks?.payment), "tr_"),
        source: "body._links.payment.href",
      },
      {
        value: extractTokenFromHref(getHref(resourceLinks?.payment), "tr_"),
        source: "body.resource._links.payment.href",
      },
      {
        value: extractTokenFromHref(getHref(dataLinks?.payment), "tr_"),
        source: "body.data._links.payment.href",
      },
      {
        value: extractTokenFromHref(getHref(rootLinks?.self), "tr_"),
        source: "body._links.self.href",
      },
    ],
    (candidate) => isPaymentId(candidate),
  );

  const paymentLinkMatch = pickFirstStringMatch(
    [
      { value: rawId, source: "body.id" },
      { value: rootResourceString, source: "body.resource" },
      { value: root?.paymentLinkId, source: "body.paymentLinkId" },
      { value: root?.payment_link_id, source: "body.payment_link_id" },
      { value: root?.entityId, source: "body.entityId" },
      { value: data?.id, source: "body.data.id" },
      { value: data?.paymentLinkId, source: "body.data.paymentLinkId" },
      { value: data?.payment_link_id, source: "body.data.payment_link_id" },
      { value: resourceObject?.id, source: "body.resource.id" },
      { value: resourceObject?.paymentLinkId, source: "body.resource.paymentLinkId" },
      { value: resourceObject?.payment_link_id, source: "body.resource.payment_link_id" },
      { value: embeddedEntity?.id, source: "body._embedded.entity.id" },
      {
        value: extractTokenFromHref(getHref(rootLinks?.paymentLink), "pl_"),
        source: "body._links.paymentLink.href",
      },
      {
        value: extractTokenFromHref(getHref(rootLinks?.entity), "pl_"),
        source: "body._links.entity.href",
      },
      {
        value: extractTokenFromHref(getHref(resourceLinks?.paymentLink), "pl_"),
        source: "body.resource._links.paymentLink.href",
      },
      {
        value: extractTokenFromHref(getHref(resourceLinks?.self), "pl_"),
        source: "body.resource._links.self.href",
      },
      {
        value: extractTokenFromHref(getHref(dataLinks?.paymentLink), "pl_"),
        source: "body.data._links.paymentLink.href",
      },
      {
        value: extractTokenFromHref(getHref(rootLinks?.self), "pl_"),
        source: "body._links.self.href",
      },
    ],
    (candidate) => isPaymentLinkId(candidate),
  );

  const paymentId = paymentMatch.value;
  const paymentLinkId = paymentLinkMatch.value;

  const isEventId = rawId?.startsWith("event_") || rawId?.startsWith("evt_");
  const isPaymentLinkEvent =
    Boolean(eventType?.startsWith("payment-link."))
    || resourceType === "payment-link"
    || isPaymentLinkId(paymentLinkId);

  return {
    rawId,
    paymentId,
    paymentIdSource: paymentMatch.source,
    paymentLinkId,
    paymentLinkIdSource: paymentLinkMatch.source,
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

    logDebug("Received webhook request", {
      method: req.method,
      contentType,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      rawBody: rawBody || "<empty>",
    });

    let payload: any = null;
    try {
      payload = await parseRequestBody(rawBody, contentType, requestClone);
    } catch (error) {
      logError("Request body parsing crashed", error, { rawBody, contentType });
      return webhookAck({
        status: "error",
        error: "body_parse_failed",
      });
    }

    const {
      rawId,
      paymentId: directPaymentId,
      paymentIdSource: directPaymentIdSource,
      paymentLinkId,
      paymentLinkIdSource,
      eventType,
      isEventId,
      isPaymentLinkEvent,
      resourceType,
    } = extractWebhookIds(payload);

    logDebug("Webhook parsed", {
      contentType,
      rawId,
      directPaymentId,
      directPaymentIdSource,
      paymentLinkId,
      paymentLinkIdSource,
      eventType,
      resourceType,
      isEventId,
      isPaymentLinkEvent,
      payloadKeys:
        payload && typeof payload === "object" ? Object.keys(payload).slice(0, 20) : [],
      payload,
    });

    const mollieKey = Deno.env.get("MOLLIE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!mollieKey || !supabaseUrl || !serviceRoleKey) {
      logDebug("Missing env vars", {
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
    let paymentIdSource = directPaymentIdSource;
    const mollieHeaders = { Authorization: `Bearer ${mollieKey}` };

    // Strategy 1: If we have a payment-link event or payment-link ID, fetch its payments
    if (!paymentId && paymentLinkId && isPaymentLinkEvent) {
      logDebug("Resolving payment from payment-link", {
        paymentLinkId,
        paymentLinkIdSource,
        eventType,
        resourceType,
      });
      try {
        // Step 1: Fetch payment-link details (no ?include=payments — not supported)
        const plRes = await fetch(
          `https://api.mollie.com/v2/payment-links/${paymentLinkId}`,
          { headers: mollieHeaders },
        );
        const plText = await plRes.text();
        logDebug("Payment-link fetch result", {
          status: plRes.status,
          ok: plRes.ok,
          paymentLinkId,
          bodyPreview: plText.slice(0, 2000),
        });

        if (plRes.ok) {
          const plData = safeParseJsonText(plText);
          if (!plData) {
            return webhookAck({
              status: "ignored",
              action: "none",
              reason: "payment_link_response_invalid_json",
              payment_link_id: paymentLinkId,
            });
          }

          logDebug("Payment-link data", {
            id: plData.id,
            status: plData.status,
            paidAt: plData.paidAt,
            _links: plData._links ? Object.keys(plData._links) : [],
          });

          // Try _links.payment on the payment-link itself
          const paymentIdFromLinks = extractTokenFromHref(
            getHref(asRecord(plData?._links)?.payment),
            "tr_",
          );

          if (paymentIdFromLinks) {
            paymentId = paymentIdFromLinks;
            paymentIdSource = "payment-link._links.payment.href";
            logDebug("Found payment from payment-link _links", { paymentId, paymentLinkId });
          }

          // Step 2: If still no paymentId, list payments for this payment-link
          if (!paymentId) {
            logDebug("Listing payments for payment-link", { paymentLinkId });
            try {
              const paymentsRes = await fetch(
                `https://api.mollie.com/v2/payment-links/${paymentLinkId}/payments`,
                { headers: mollieHeaders },
              );
              const paymentsText = await paymentsRes.text();
              logDebug("Payment-link payments list result", {
                status: paymentsRes.status,
                ok: paymentsRes.ok,
                bodyPreview: paymentsText.slice(0, 2000),
              });

              if (paymentsRes.ok) {
                const paymentsData = safeParseJsonText(paymentsText);
                const paymentsList = getEmbeddedPayments(paymentsData);
                logDebug("Payment-link payments found", { count: paymentsList.length });

                const paidPayment = paymentsList.find(
                  (c: any) => c?.status === "paid" && typeof c?.id === "string",
                );
                const anyPayment = paymentsList.find(
                  (c: any) => typeof c?.id === "string",
                );

                if (paidPayment?.id) {
                  paymentId = paidPayment.id;
                  paymentIdSource = "payment-link/payments[paid].id";
                  logDebug("Found paid payment from payments list", { paymentId, paymentLinkId });
                } else if (anyPayment?.id) {
                  paymentId = anyPayment.id;
                  paymentIdSource = "payment-link/payments[0].id";
                  logDebug("Using first payment from payments list", { paymentId, paymentLinkId });
                }
              }
            } catch (err) {
              logError("Payment-link payments list exception", err, { paymentLinkId });
            }
          }
        } else {
          logDebug("Payment-link fetch error", {
            status: plRes.status,
            paymentLinkId,
            bodyPreview: plText.slice(0, 2000),
          });
        }
      } catch (err) {
        logError("Payment-link fetch exception", err, { paymentLinkId, eventType });
      }
    }

    logDebug("Resolved payment identifier", {
      rawId,
      directPaymentId,
      directPaymentIdSource,
      paymentLinkId,
      paymentLinkIdSource,
      paymentId,
      paymentIdSource,
      eventType,
      resourceType,
    });

    // If we still have no payment ID, acknowledge and exit
    if (!paymentId) {
      logDebug("Unable to resolve payment ID from webhook", {
        rawId,
        directPaymentId,
        directPaymentIdSource,
        paymentLinkId,
        paymentLinkIdSource,
        eventType,
        isEventId,
        resourceType,
        payload,
      });
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
    logDebug("Fetching payment details", { paymentId });

    let mollieRes: Response;
    try {
      mollieRes = await fetch(
        `https://api.mollie.com/v2/payments/${paymentId}`,
        { headers: mollieHeaders },
      );
    } catch (error) {
      logError("Mollie payment fetch crashed", error, { paymentId });
      return webhookAck({
        status: "error",
        error: "mollie_payment_fetch_crashed",
        payment_id: paymentId,
      });
    }

    const mollieBody = await mollieRes.text();
    logDebug("Mollie payment fetch result", {
      paymentId,
      status: mollieRes.status,
      ok: mollieRes.ok,
      contentType: mollieRes.headers.get("content-type"),
      bodyPreview: mollieBody.slice(0, 3000),
    });

    if (!mollieRes.ok) {
      logDebug("Mollie payment fetch error", {
        paymentId,
        mollieStatus: mollieRes.status,
        bodyPreview: mollieBody.slice(0, 2000),
      });
      return webhookAck({
        status: "error",
        error: "mollie_payment_fetch_failed",
        payment_id: paymentId,
        mollie_status: mollieRes.status,
      });
    }

    const payment = safeParseJsonText(mollieBody);
    if (!payment || typeof payment !== "object") {
      logDebug("Mollie payment payload invalid", { paymentId, mollieBodyPreview: mollieBody.slice(0, 1000) });
      return webhookAck({
        status: "error",
        error: "mollie_payment_invalid_payload",
        payment_id: paymentId,
      });
    }

    logDebug("Payment details", {
      id: payment?.id ?? null,
      status: payment?.status ?? null,
      metadata: payment?.metadata ?? null,
      amount: payment?.amount ?? null,
      billingEmail: payment?.billingEmail ?? payment?.details?.billingEmail ?? null,
    });

    logDebug("Payment metadata", payment?.metadata ?? null);

    if (!payment?.metadata || typeof payment.metadata !== "object") {
      logError("Payment metadata missing", new Error("payment_metadata_missing"), {
        paymentId,
        payment,
      });
    }

    if (payment.status !== "paid") {
      logDebug("Payment not paid", { paymentId, status: payment?.status ?? null });
      return webhookAck({ status: payment.status, action: "none" });
    }

    const paymentMetadata = asRecord(payment?.metadata);
    const userId = firstString(paymentMetadata?.user_id, paymentMetadata?.userId);
    const email = extractPaymentEmail(payment);

    logDebug("Resolved user lookup data", {
      paymentId,
      userId,
      email,
      metadata: payment?.metadata ?? null,
    });

    if (!userId && !email) {
      logError("No user identifier found for payment", new Error("user_identifier_missing"), {
        paymentId,
        paymentRecordId: payment?.id ?? null,
        metadata: payment?.metadata ?? null,
        payment,
      });
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "user_identifier_missing",
        payment_id: payment?.id ?? paymentId,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let profile: { user_id: string; email: string | null; is_premium: boolean; plan_type: string } | null = null;

    try {
      if (userId) {
        logDebug("Looking up profile by user_id", { userId, paymentId, metadata: paymentMetadata });
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, email, is_premium, plan_type")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          logError("Profile lookup by user_id failed", error, {
            userId,
            paymentId,
            metadata: paymentMetadata,
          });
        } else {
          profile = data as any;
          logDebug("User lookup result", {
            lookup: "user_id",
            paymentId,
            userId,
            email,
            profile,
          });
        }
      }

      if (!profile && email) {
        logDebug("Looking up profile by email", { email, paymentId, metadata: paymentMetadata });
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, email, is_premium, plan_type")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          logError("Profile lookup by email failed", error, {
            email,
            paymentId,
            metadata: paymentMetadata,
          });
        } else {
          profile = data as any;
          logDebug("User lookup result", {
            lookup: "email",
            paymentId,
            userId,
            email,
            profile,
          });
        }
      }
    } catch (error) {
      logError("User lookup crashed", error, {
        paymentId,
        userId,
        email,
        metadata: paymentMetadata,
      });
      return webhookAck({
        status: "error",
        error: "user_lookup_crashed",
        payment_id: payment?.id ?? paymentId,
      });
    }

    if (!profile) {
      logError("User not found for payment", new Error("user_not_found"), {
        paymentId,
        paymentRecordId: payment?.id ?? null,
        userId,
        email,
        paymentMetadata,
        payment,
      });
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "user_not_found",
        payment_id: payment?.id ?? paymentId,
      });
    }

    // --- Determine plan_type from payment metadata ---
    // Ancrage no longer offers subscriptions: any successful payment grants
    // lifetime "paid" access. Subscription-related metadata is ignored.
    const finalPlanType = "paid";

    if (profile.is_premium && profile.plan_type === finalPlanType) {
      logDebug("Profile already at this plan", { profile, paymentId, finalPlanType });
      return webhookAck({
        status: "premium_already_active",
        user_id: profile.user_id,
        email: profile.email,
        plan_type: profile.plan_type,
      });
    }

    logDebug("Running premium update query", {
      targetUserId: profile.user_id,
      update: { is_premium: true, plan_type: finalPlanType },
      paymentId,
    });

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: true, plan_type: finalPlanType })
      .eq("user_id", profile.user_id)
      .select("user_id, email, is_premium, plan_type")
      .single();

    if (updateError) {
      logDebug("DB update error", {
        targetUserId: profile.user_id,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      return webhookAck({
        status: "error",
        error: "profile_update_failed",
        user_id: profile.user_id,
      });
    }

    logDebug("Premium update result", {
      targetUserId: profile.user_id,
      updatedProfile: updatedProfile ?? null,
    });

    if (!updatedProfile?.user_id) {
      return webhookAck({
        status: "error",
        error: "profile_update_empty_result",
        user_id: profile.user_id,
      });
    }

    // --- Send welcome premium email ---
    try {
      // Fetch first_name for personalization
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("user_id", updatedProfile.user_id)
        .single();

      const recipientEmail = updatedProfile.email || email;
      if (recipientEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "welcome-premium",
            recipientEmail,
            idempotencyKey: `welcome-premium-${paymentId}`,
            templateData: { firstName: profileData?.first_name || "" },
          },
        });
        logDebug("Welcome premium email sent", { recipientEmail, paymentId });
      }

      // Send admin notification email
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-payment-notification",
          recipientEmail: "longuemareelodie9@gmail.com",
          idempotencyKey: `admin-notify-${paymentId}`,
          templateData: {
            customerEmail: updatedProfile.email || email || "Inconnu",
            customerName: profileData?.first_name || "",
            amount: payment?.amount ? `${payment.amount.value} ${payment.amount.currency}` : "",
            paymentId: paymentId,
          },
        },
      });
      logDebug("Admin payment notification sent", { paymentId });
    } catch (emailErr) {
      logError("Failed to send email notifications (non-fatal)", emailErr, { paymentId });
    }

    // --- Handle subscription creation if this was a "first" payment ---
    const paymentType = firstString(paymentMetadata?.type);
    if (paymentType === "subscription_first" && payment.sequenceType === "first") {
      const subPlan = firstString(paymentMetadata?.plan) || "monthly";
      const subInterval = firstString(paymentMetadata?.interval) || "1 month";
      const subAmount = firstString(paymentMetadata?.subscription_amount) || (subPlan === "yearly" ? "59.00" : "9.00");
      const subDescription = firstString(paymentMetadata?.subscription_description) || "ANCRAGE Premium";
      const custId = payment.customerId;

      if (custId) {
        logDebug("Creating Mollie subscription", {
          customerId: custId,
          plan: subPlan,
          interval: subInterval,
          amount: subAmount,
        });

        try {
          const subRes = await fetch(
            `https://api.mollie.com/v2/customers/${custId}/subscriptions`,
            {
              method: "POST",
              headers: mollieHeaders,
              body: JSON.stringify({
                amount: { currency: "EUR", value: subAmount },
                interval: subInterval,
                description: subDescription,
                webhookUrl: `${supabaseUrl}/functions/v1/mollie-webhook`,
                metadata: { user_id: profile.user_id, plan: subPlan },
              }),
            },
          );

          const subData = await fetch(
            `https://api.mollie.com/v2/customers/${custId}/subscriptions`,
            { headers: mollieHeaders },
          ).then(() => subRes.json());

          const subBody = await subRes.json().catch(() => null);
          logDebug("Subscription creation result", {
            status: subRes.status,
            ok: subRes.ok,
            body: subBody,
          });

          if (subRes.ok && subBody?.id) {
            await supabase
              .from("subscriptions")
              .update({
                mollie_subscription_id: subBody.id,
                status: "active",
              })
              .eq("user_id", profile.user_id)
              .eq("mollie_customer_id", custId)
              .eq("status", "pending");

            logDebug("Subscription activated in DB", {
              subscriptionId: subBody.id,
              userId: profile.user_id,
            });
          }
        } catch (subErr) {
          logError("Subscription creation failed", subErr, {
            customerId: custId,
            userId: profile.user_id,
          });
        }
      }
    }

    return webhookAck({
      status: "premium_activated",
      user_id: updatedProfile.user_id,
      email: updatedProfile.email,
    });
  } catch (err) {
    logError("Webhook error", err);
    return webhookAck({
      status: "error",
      error: "internal_error",
    });
  }
});
