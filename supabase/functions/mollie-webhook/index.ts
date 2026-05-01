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

/**
 * Audit-log a premium activation outcome to the `premium_activation_log` table.
 * Best-effort: failures are logged but never break the webhook flow.
 */
const logActivation = async (
  supabaseUrl: string | undefined,
  serviceRoleKey: string | undefined,
  entry: {
    user_id?: string | null;
    payment_id?: string | null;
    status: string;
    amount?: number | null;
    message?: string | null;
    raw?: Record<string, unknown> | null;
  },
) => {
  if (!supabaseUrl || !serviceRoleKey) return;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/premium_activation_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        user_id: entry.user_id ?? null,
        payment_id: entry.payment_id ?? null,
        status: entry.status,
        amount: entry.amount ?? null,
        source: "mollie-webhook",
        message: entry.message ?? null,
        raw: entry.raw ?? null,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        "premium_activation_log insert failed",
        safeStringify({ status: res.status, body: body.slice(0, 500), entry }),
      );
    }
  } catch (err) {
    console.error(
      "premium_activation_log insert crashed",
      safeStringify({ error: serializeError(err), entry }),
    );
  }

  // Fire-and-forget: trigger failure alert when status indicates an error.
  if (entry.status === "error" || entry.status === "failed") {
    try {
      const url = `${supabaseUrl}/functions/v1/notify-webhook-failure`;
      // We do NOT await — the webhook should respond fast to Mollie.
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ trigger: "mollie-webhook", status: entry.status }),
      }).catch((e) =>
        console.error("notify-webhook-failure trigger failed", serializeError(e)),
      );
    } catch (e) {
      console.error("notify-webhook-failure invoke crashed", serializeError(e));
    }
  }
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

    const amountCents =
      payment?.amount?.value && !Number.isNaN(parseFloat(payment.amount.value))
        ? Math.round(parseFloat(payment.amount.value) * 100)
        : null;

    if (payment.status !== "paid") {
      logDebug("Payment not paid", { paymentId, status: payment?.status ?? null });
      await logActivation(supabaseUrl, serviceRoleKey, {
        payment_id: paymentId,
        status: payment?.status === "failed" ? "failed" : "pending",
        amount: amountCents,
        message: `Mollie payment status: ${payment?.status ?? "unknown"}`,
        raw: { mollie_status: payment?.status, event_type: eventType },
      });
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
      await logActivation(supabaseUrl, serviceRoleKey, {
        payment_id: paymentId,
        status: "error",
        amount: amountCents,
        message: "user_identifier_missing",
        raw: { metadata: paymentMetadata ?? null },
      });
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "user_identifier_missing",
        payment_id: payment?.id ?? paymentId,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let profile: {
      user_id: string;
      email: string | null;
      is_premium: boolean;
      plan_type: string;
      has_initiation_access: boolean;
    } | null = null;

    try {
      if (userId) {
        logDebug("Looking up profile by user_id", { userId, paymentId, metadata: paymentMetadata });
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, email, is_premium, plan_type, has_initiation_access")
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
          .select("user_id, email, is_premium, plan_type, has_initiation_access")
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
      await logActivation(supabaseUrl, serviceRoleKey, {
        user_id: userId,
        payment_id: paymentId,
        status: "error",
        amount: amountCents,
        message: "user_lookup_crashed",
      });
      return webhookAck({
        status: "error",
        error: "user_lookup_crashed",
        payment_id: payment?.id ?? paymentId,
      });
    }

    if (!profile) {
      // ---- New flow: payment-first, account-on-success ----
      // No existing profile = guest checkout. Create the auth user via the
      // service role, then send a recovery link so they can set their password.
      // The handle_new_user trigger creates the profiles row automatically.
      if (!email) {
        logError("Cannot create account without email", new Error("guest_no_email"), {
          paymentId,
          userId,
          paymentMetadata,
        });
        await logActivation(supabaseUrl, serviceRoleKey, {
          payment_id: paymentId,
          status: "error",
          amount: amountCents,
          message: "guest_no_email_for_account_creation",
        });
        return webhookAck({
          status: "error",
          error: "guest_no_email",
          payment_id: payment?.id ?? paymentId,
        });
      }

      logDebug("Creating account for guest payment", { email, paymentId });

      // 1) Try to create a fresh auth user. If that user already exists in
      //    auth.users without a profiles row (rare race), fall back to lookup.
      let createdUserId: string | null = null;
      try {
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true, // payment proves email ownership
          user_metadata: { source: "mollie_payment", payment_id: paymentId },
        });
        if (createErr) {
          // 422 / "already registered" → look up the existing user.
          const msg = createErr.message?.toLowerCase() ?? "";
          if (msg.includes("registered") || msg.includes("exists") || (createErr as any)?.status === 422) {
            logDebug("auth.admin.createUser: user already exists, will look up", { email, paymentId });
          } else {
            throw createErr;
          }
        } else {
          createdUserId = created.user?.id ?? null;
        }
      } catch (e) {
        logError("auth.admin.createUser failed", e, { email, paymentId });
        await logActivation(supabaseUrl, serviceRoleKey, {
          payment_id: paymentId,
          status: "error",
          amount: amountCents,
          message: `account_create_failed: ${(e as Error)?.message ?? "unknown"}`,
        });
        return webhookAck({
          status: "error",
          error: "account_create_failed",
          payment_id: payment?.id ?? paymentId,
        });
      }

      // 2) Re-fetch the profile (created by handle_new_user trigger). Retry briefly
      //    because the trigger runs asynchronously after createUser returns.
      for (let attempt = 0; attempt < 5 && !profile; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 250));
        const { data } = await supabase
          .from("profiles")
          .select("user_id, email, is_premium, plan_type, has_initiation_access")
          .eq("email", email)
          .maybeSingle();
        if (data) profile = data as any;
      }

      if (!profile) {
        logError("Profile still missing after account creation", new Error("profile_missing_post_create"), {
          email,
          createdUserId,
          paymentId,
        });
        await logActivation(supabaseUrl, serviceRoleKey, {
          user_id: createdUserId,
          payment_id: paymentId,
          status: "error",
          amount: amountCents,
          message: "profile_missing_post_create",
        });
        return webhookAck({
          status: "error",
          error: "profile_missing_post_create",
          payment_id: payment?.id ?? paymentId,
        });
      }

      // 3) Generate a recovery link so the buyer can set their password.
      //    The link redirects to /reset-password (already wired in the app).
      const siteOrigin = "https://www.digitalmamanlibre.com";
      try {
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: `${siteOrigin}/reset-password?welcome=1` },
        });
        if (linkErr) throw linkErr;
        const actionLink =
          linkData?.properties?.action_link
          ?? (linkData as any)?.action_link
          ?? null;

        if (actionLink) {
          // Fire-and-forget welcome email with the activation link.
          supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "welcome-initiation",
              recipientEmail: email,
              idempotencyKey: `account-activation-${paymentId}`,
              templateData: { firstName: "", actionUrl: actionLink },
            },
          }).catch((e) => logError("activation email send failed (non-fatal)", e, { paymentId }));
        } else {
          logError("generateLink returned no action_link", new Error("no_action_link"), { paymentId });
        }
      } catch (linkErr) {
        // Account exists, payment will still be activated below — but the
        // user won't get the activation email. They can use "forgot password"
        // from /auth as a recovery path. We log loudly so support can intervene.
        logError("Failed to generate activation link (non-fatal)", linkErr, { email, paymentId });
      }
    }

    // --- Determine product type from payment metadata ---
    // Two products are supported:
    //   - "initiation_7d" → 4,99 € : grants only has_initiation_access
    //   - "premium" (default / "lifetime") → 39 € : grants is_premium + initiation
    const rawProduct = firstString(paymentMetadata?.product);
    const rawType = firstString(paymentMetadata?.type);
    const isInitiationProduct =
      rawProduct === "initiation_7d" || rawType === "initiation_7d";

    if (isInitiationProduct) {
      // ---- Initiation 7d activation path ----
      if (profile.has_initiation_access) {
        logDebug("Profile already has initiation access", { profile, paymentId });
        await logActivation(supabaseUrl, serviceRoleKey, {
          user_id: profile.user_id,
          payment_id: paymentId,
          status: "already_active",
          amount: amountCents,
          message: "Profile already has_initiation_access=true",
        });
        return webhookAck({
          status: "initiation_already_active",
          user_id: profile.user_id,
          email: profile.email,
        });
      }

      logDebug("Running initiation update query", {
        targetUserId: profile.user_id,
        paymentId,
      });

      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ has_initiation_access: true })
        .eq("user_id", profile.user_id)
        .select("user_id, email, has_initiation_access")
        .single();

      if (updateError || !updatedProfile?.user_id) {
        logError("Initiation activation update failed", updateError ?? new Error("empty_result"), {
          targetUserId: profile.user_id,
          paymentId,
        });
        await logActivation(supabaseUrl, serviceRoleKey, {
          user_id: profile.user_id,
          payment_id: paymentId,
          status: "error",
          amount: amountCents,
          message: `initiation_update_failed: ${updateError?.message ?? "empty_result"}`,
        });
        return webhookAck({
          status: "error",
          error: "initiation_update_failed",
          user_id: profile.user_id,
        });
      }

      await logActivation(supabaseUrl, serviceRoleKey, {
        user_id: updatedProfile.user_id,
        payment_id: paymentId,
        status: "paid",
        amount: amountCents,
        message: "has_initiation_access activated",
        raw: {
          product: "initiation_7d",
          currency: payment?.amount?.currency ?? null,
          method: payment?.method ?? null,
        },
      });

      // Welcome email for the initiation 7 jours buyer
      try {
        const { data: initProfileData } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("user_id", updatedProfile.user_id)
          .maybeSingle();

        const initRecipient = updatedProfile.email || email;
        if (initRecipient) {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "welcome-initiation",
              recipientEmail: initRecipient,
              idempotencyKey: `welcome-initiation-${paymentId}`,
              templateData: { firstName: initProfileData?.first_name || "" },
            },
          });
        } else {
          logDebug("Skipped welcome-initiation email: no recipient", { paymentId });
        }
      } catch (emailErr) {
        logError("Failed to send welcome-initiation email (non-fatal)", emailErr, { paymentId });
      }

      // Admin notification
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "admin-payment-notification",
            recipientEmail: "longuemareelodie9@gmail.com",
            idempotencyKey: `admin-notify-${paymentId}`,
            templateData: {
              customerEmail: updatedProfile.email || email || "Inconnu",
              customerName: "",
              amount: payment?.amount ? `${payment.amount.value} ${payment.amount.currency}` : "",
              paymentId: paymentId,
            },
          },
        });
      } catch (emailErr) {
        logError("Failed to send initiation admin notification (non-fatal)", emailErr, { paymentId });
      }

      return webhookAck({
        status: "initiation_activated",
        user_id: updatedProfile.user_id,
        email: updatedProfile.email,
      });
    }

    // ---- Premium activation path (default / lifetime) ----
    const finalPlanType = "paid";

    if (profile.is_premium && profile.plan_type === finalPlanType && profile.has_initiation_access) {
      logDebug("Profile already at this plan", { profile, paymentId, finalPlanType });
      await logActivation(supabaseUrl, serviceRoleKey, {
        user_id: profile.user_id,
        payment_id: paymentId,
        status: "already_active",
        amount: amountCents,
        message: "Profile already premium=true / plan=paid",
      });
      return webhookAck({
        status: "premium_already_active",
        user_id: profile.user_id,
        email: profile.email,
        plan_type: profile.plan_type,
      });
    }

    logDebug("Running premium update query", {
      targetUserId: profile.user_id,
      update: { is_premium: true, plan_type: finalPlanType, has_initiation_access: true },
      paymentId,
    });

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: true, plan_type: finalPlanType, has_initiation_access: true })
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
      await logActivation(supabaseUrl, serviceRoleKey, {
        user_id: profile.user_id,
        payment_id: paymentId,
        status: "error",
        amount: amountCents,
        message: `profile_update_failed: ${updateError.message}`,
        raw: { code: updateError.code, details: updateError.details, hint: updateError.hint },
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
      await logActivation(supabaseUrl, serviceRoleKey, {
        user_id: profile.user_id,
        payment_id: paymentId,
        status: "error",
        amount: amountCents,
        message: "profile_update_empty_result",
      });
      return webhookAck({
        status: "error",
        error: "profile_update_empty_result",
        user_id: profile.user_id,
      });
    }

    // --- Successful activation: write the audit-log entry ---
    await logActivation(supabaseUrl, serviceRoleKey, {
      user_id: updatedProfile.user_id,
      payment_id: paymentId,
      status: "paid",
      amount: amountCents,
      message: "is_premium activated",
      raw: {
        previous_is_premium: profile.is_premium,
        previous_plan_type: profile.plan_type,
        currency: payment?.amount?.currency ?? null,
        method: payment?.method ?? null,
      },
    });

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
