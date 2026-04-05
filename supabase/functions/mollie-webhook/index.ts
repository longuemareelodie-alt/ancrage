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
      paymentLinkId,
      eventType,
      isEventId,
      isPaymentLinkEvent,
      resourceType,
    } = extractWebhookIds(payload);

    logDebug("Webhook parsed", {
      contentType,
      rawId,
      directPaymentId,
      paymentLinkId,
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
    const mollieHeaders = { Authorization: `Bearer ${mollieKey}` };

    // Strategy 1: If we have a payment-link event or payment-link ID, fetch its payments
    if (!paymentId && paymentLinkId && isPaymentLinkEvent) {
      logDebug("Resolving payment from payment-link", { paymentLinkId, eventType, resourceType });
      try {
        const plRes = await fetch(
          `https://api.mollie.com/v2/payment-links/${paymentLinkId}?include=payments`,
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

          const embeddedPayments = getEmbeddedPayments(plData);
          logDebug("Payment-link data", {
            id: plData.id,
            status: plData.status,
            paidAt: plData.paidAt,
            _links: plData._links ? Object.keys(plData._links) : [],
            embeddedPayments: embeddedPayments.length,
          });
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
            logDebug("Found paid payment from payment-link", { paymentId, paymentLinkId });
          } else if (latestPayment?.id) {
            paymentId = latestPayment.id;
            logDebug("Using fallback payment from payment-link", { paymentId, paymentLinkId });
          } else if (paymentIdFromLinks) {
            paymentId = paymentIdFromLinks;
            logDebug("Found payment from payment-link _links", { paymentId, paymentLinkId });
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
      paymentLinkId,
      paymentId,
      eventType,
      resourceType,
    });

    // If we still have no payment ID, acknowledge and exit
    if (!paymentId) {
      logDebug("Unable to resolve payment ID from webhook", {
        rawId,
        directPaymentId,
        paymentLinkId,
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

    if (payment.status !== "paid") {
      logDebug("Payment not paid", { paymentId, status: payment?.status ?? null });
      return webhookAck({ status: payment.status, action: "none" });
    }

    const userId = firstString(payment.metadata?.user_id, payment.metadata?.userId);
    const email = extractPaymentEmail(payment);

    logDebug("Resolved user lookup data", {
      paymentId,
      userId,
      email,
      metadata: payment?.metadata ?? null,
    });

    if (!userId && !email) {
      logDebug("No user_id or email found for payment", {
        paymentId,
        paymentRecordId: payment?.id ?? null,
        metadata: payment?.metadata ?? null,
      });
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "user_identifier_missing",
        payment_id: payment?.id ?? paymentId,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let profile: { user_id: string; email: string | null; is_premium: boolean } | null = null;

    if (userId) {
      logDebug("Looking up profile by user_id", { userId, paymentId });
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, is_premium")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        logDebug("Profile lookup by user_id failed", {
          userId,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        profile = data;
        logDebug("Profile lookup by user_id result", { userId, profile });
      }
    }

    if (!profile && email) {
      logDebug("Looking up profile by email", { email, paymentId });
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, email, is_premium")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        logDebug("Profile lookup by email failed", {
          email,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        profile = data;
        logDebug("Profile lookup by email result", { email, profile });
      }
    }

    if (!profile && userId) {
      logDebug("Inserting profile by user_id", { userId, email, isPremium: true });
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
        logDebug("Profile insert by user_id failed", {
          userId,
          email,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else {
        profile = data;
        logDebug("Profile insert by user_id result", { profile });
      }
    }

    if (!profile && email) {
      logDebug("Listing auth users to match email", { email });
      const { data: userListData, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        logDebug("Auth user lookup by email failed", {
          email,
          message: usersError.message,
        });
      } else {
        const authUsers = Array.isArray(userListData?.users) ? userListData.users : [];
        logDebug("Auth user lookup result", { email, totalUsersScanned: authUsers.length });
        const authUser = authUsers.find(
          (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
        );

        if (authUser) {
          logDebug("Inserting profile from auth user", {
            authUserId: authUser.id,
            email,
            matchedEmail: authUser.email ?? null,
          });
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
            logDebug("Profile insert by email failed", {
              email,
              authUserId: authUser.id,
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });
          } else {
            profile = data;
            logDebug("Profile insert by email result", { profile });
          }
        }
      }
    }

    if (!profile) {
      logDebug("No profile found for payment", {
        paymentId,
        paymentRecordId: payment?.id ?? null,
        userId,
        email,
      });
      return webhookAck({
        status: "ignored",
        action: "none",
        reason: "profile_not_found",
        payment_id: payment?.id ?? paymentId,
      });
    }

    if (profile.is_premium) {
      logDebug("Profile already premium", { profile, paymentId });
      return webhookAck({
        status: "premium_already_active",
        user_id: profile.user_id,
        email: profile.email,
      });
    }

    logDebug("Running premium update query", {
      targetUserId: profile.user_id,
      update: { is_premium: true },
      paymentId,
    });

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("user_id", profile.user_id)
      .select("user_id, email, is_premium")
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
