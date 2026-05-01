import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import {
  PRODUCT_CATALOG,
  ProductCatalogIntegrityError,
  assertCatalogIntegrity,
  type ProductKey,
} from "../_shared/productCatalog.ts";

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

// Basic email validator (RFC 5322 lite — sufficient for guest checkout)
const isValidEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.trim().length <= 254;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Server-authoritative product catalog must match its locked fingerprint
    // before we touch Mollie. Any drift (label, amount, currency, flags)
    // refuses payment creation until the catalog and its companion test
    // (`tests/productCatalog.spec.ts`) are explicitly updated together.
    try {
      assertCatalogIntegrity();
    } catch (e) {
      if (e instanceof ProductCatalogIntegrityError) {
        console.error("[create-mollie-payment] catalog integrity violation", e.message);
        return jsonResponse(
          { error: "product_catalog_integrity_violation" },
          503,
        );
      }
      throw e;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const mollieKey = Deno.env.get("MOLLIE_API_KEY");

    if (!mollieKey) {
      console.error("MOLLIE_API_KEY not set");
      return jsonResponse({ error: "Server config error" }, 500);
    }

    // Try to authenticate the caller — but auth is OPTIONAL (guest checkout allowed).
    // If no Authorization header or invalid token, we treat the call as a guest.
    let authedUser: { id: string; email: string | null } | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase() !== "bearer ") {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          authedUser = { id: user.id, email: user.email ?? null };
        }
      } catch (e) {
        console.warn("Optional auth lookup failed (treating as guest):", (e as Error)?.message);
      }
    }

    // Parse body: redirectUrl, promoCode, product, and (for guests) guestEmail
    let redirectUrl = "https://ancrage.lovable.app/dashboard?payment=success";
    let webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;
    let rawPromoCode: string | null = null;
    let rawProduct: string | null = null;
    let guestEmail: string | null = null;

    try {
      const body = await req.json();
      if (body?.redirectUrl) redirectUrl = body.redirectUrl;
      if (body?.webhookUrl) webhookUrl = body.webhookUrl;
      if (typeof body?.promoCode === "string") rawPromoCode = body.promoCode;
      if (typeof body?.product === "string") rawProduct = body.product;
      if (typeof body?.guestEmail === "string") guestEmail = body.guestEmail.trim().toLowerCase();
    } catch {
      // No body or invalid JSON — use defaults
    }

    // ---- Product selection (catalog imported from _shared/productCatalog) ----
    const productKey: ProductKey =
      rawProduct === "initiation_7d" ? "initiation_7d" : "premium";
    const product = PRODUCT_CATALOG[productKey];

    // ---- Resolve effective email + identity ----
    // Guests (no auth) MUST provide a valid email so the webhook can
    // create their account on payment success. Authed users always
    // win over guestEmail (single source of truth = the session).
    const effectiveEmail = authedUser?.email ?? guestEmail;
    const isGuest = !authedUser;

    if (isGuest && !isValidEmail(guestEmail)) {
      return jsonResponse({ error: "guest_email_required" }, 400);
    }
    if (isGuest && !product.allowGuestCheckout) {
      // Guest eligibility is now declared on the product itself in the
      // shared catalog — adding a non-guest product is a one-line opt-out.
      return jsonResponse({ error: "guest_not_allowed_for_product", product: productKey }, 400);
    }

    // ---- Promo code validation (server-authoritative) ----
    // Promos only apply to the premium product.
    const PROMO_CATALOG: Record<string, { discountCents: number; label: string }> = {
      ANCRAGE15: { discountCents: 1500, label: "Ancrage15 (-15€)" },
    };

    const normalizedPromo = (rawPromoCode ?? "").trim().toUpperCase();

    // If a promo was sent for a product that doesn't accept promos, fail loudly
    // so the front-end can show a precise error instead of silently ignoring it.
    if (normalizedPromo && !product.allowPromo) {
      return jsonResponse(
        { error: "promo_not_allowed_for_product", product: productKey },
        400,
      );
    }

    const promo = normalizedPromo && product.allowPromo ? PROMO_CATALOG[normalizedPromo] : null;

    // If client sent a code but it's invalid (and the product accepts promos)
    // → reject explicitly so the UI can tell the user.
    if (normalizedPromo && product.allowPromo && !promo) {
      return jsonResponse({ error: "invalid_promo_code", code: normalizedPromo }, 400);
    }

    const basePriceCents = product.priceCents;
    const discountCents = promo?.discountCents ?? 0;
    const finalCents = Math.max(0, basePriceCents - discountCents);
    // Mollie minimum is 1 cent for EUR — guard against a free total.
    if (finalCents < 100) {
      return jsonResponse({ error: "amount_below_minimum" }, 400);
    }
    const finalAmountEur = (finalCents / 100).toFixed(2);

    const description = promo
      ? `${product.description} (${promo.label})`
      : product.description;

    // Create Mollie payment with user metadata
    const molliePayload = {
      amount: { currency: "EUR", value: finalAmountEur },
      description,
      redirectUrl,
      webhookUrl,
      metadata: {
        user_id: authedUser?.id ?? null,
        email: effectiveEmail,
        is_guest: isGuest,
        type: productKey === "premium" ? "lifetime" : "initiation_7d",
        product: productKey,
        base_price_cents: basePriceCents,
        discount_cents: discountCents,
        final_cents: finalCents,
        promo_code: promo ? normalizedPromo : null,
      },
    };

    console.log("Creating Mollie payment:", JSON.stringify({
      user_id: authedUser?.id ?? null,
      email: effectiveEmail,
      is_guest: isGuest,
      redirectUrl,
      webhookUrl,
      promo_code: promo ? normalizedPromo : null,
      final_cents: finalCents,
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