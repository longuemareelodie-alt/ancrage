/**
 * Server-authoritative product catalog — single source of truth.
 *
 * ⚠️  GUARDRAIL ⚠️
 * Any change to a product LABEL (description) or AMOUNT (priceCents) MUST be
 * accompanied by an explicit update of:
 *   1. The matching entry below (with a fresh PRODUCT_CATALOG_FINGERPRINT).
 *   2. The locking test `tests/productCatalog.spec.ts` (its EXPECTED_*
 *      constants).
 *
 * The fingerprint is recomputed at runtime by `assertCatalogIntegrity()` and
 * compared to PRODUCT_CATALOG_FINGERPRINT. A mismatch trips a 503 in
 * payment-creating functions and is logged in the webhook so on-call can act
 * before money is touched. The locking test asserts the same fingerprint at
 * commit time, so a silent edit (PR or hot-patch) cannot ship without also
 * touching the test file.
 */

export type ProductKey = "premium" | "initiation_7d";

export interface ProductDefinition {
  /** Stable product code stored in payment metadata + activation log. */
  key: ProductKey;
  /** Final amount in cents. Compared against `payment.amount.value` in the webhook. */
  priceCents: number;
  /** ISO currency code — kept here so the test catches accidental currency swaps. */
  currency: "EUR";
  /** Human-readable label shown on Mollie checkout, invoice and emails. */
  description: string;
  /** Whether promo codes can be applied to this product. */
  allowPromo: boolean;
  /** Whether unauthenticated users can purchase this product (account is created on success). */
  allowGuestCheckout: boolean;
  /**
   * Type stored in payment metadata under `metadata.type` for back-compat
   * with older webhook code paths and reporting.
   */
  metadataType: "lifetime" | "initiation_7d";
}

export const PRODUCT_CATALOG: Readonly<Record<ProductKey, ProductDefinition>> =
  Object.freeze({
    premium: Object.freeze({
      key: "premium",
      priceCents: 9700,
      currency: "EUR",
      description: "ANCRAGE — Accès Premium",
      allowPromo: true,
      allowGuestCheckout: true,
      metadataType: "lifetime",
    }),
    initiation_7d: Object.freeze({
      key: "initiation_7d",
      priceCents: 499,
      currency: "EUR",
      description: "ANCRAGE — Initiation 7 jours",
      allowPromo: false,
      allowGuestCheckout: true,
      metadataType: "initiation_7d",
    }),
  });

/**
 * Stable fingerprint of the catalog covering ALL price-bearing fields.
 * MUST be regenerated (with `computeCatalogFingerprint()`) and updated below
 * whenever a product is added/removed or its amount/label/currency changes.
 *
 * Format: `<sha256-hex-truncated-to-16>` — the same value is asserted by
 * `tests/productCatalog.spec.ts`.
 */
export const PRODUCT_CATALOG_FINGERPRINT = "03a9b7fad46b757d";

/** Canonical, stable serialization used by the fingerprint algorithm. */
export function canonicalCatalogString(): string {
  const keys = Object.keys(PRODUCT_CATALOG).sort() as ProductKey[];
  return keys
    .map((k) => {
      const p = PRODUCT_CATALOG[k];
      return [
        p.key,
        String(p.priceCents),
        p.currency,
        p.description,
        p.allowPromo ? "1" : "0",
        p.allowGuestCheckout ? "1" : "0",
        p.metadataType,
      ].join("|");
    })
    .join("\n");
}

/** Lightweight, dependency-free FNV-1a 64-bit fingerprint hex (16 chars). */
export function computeCatalogFingerprint(): string {
  const str = canonicalCatalogString();
  // FNV-1a 64-bit using BigInt — deterministic across Deno (edge) & Node (test).
  const FNV_OFFSET = 0xcbf29ce484222325n;
  const FNV_PRIME = 0x100000001b3n;
  const MASK = (1n << 64n) - 1n;
  let hash = FNV_OFFSET;
  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i));
    hash = (hash * FNV_PRIME) & MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

/**
 * Throws if the in-memory catalog disagrees with PRODUCT_CATALOG_FINGERPRINT.
 *
 * Call this at the top of any function that creates payments or activates
 * premium so a tampered/half-edited catalog never reaches Mollie or grants
 * access without an explicit, reviewed update.
 */
export function assertCatalogIntegrity(): void {
  const actual = computeCatalogFingerprint();
  if (actual !== PRODUCT_CATALOG_FINGERPRINT) {
    throw new ProductCatalogIntegrityError(
      `Product catalog fingerprint mismatch — expected ${PRODUCT_CATALOG_FINGERPRINT}, got ${actual}. ` +
        `A product label, amount, currency or flag changed without updating PRODUCT_CATALOG_FINGERPRINT and tests/productCatalog.spec.ts. ` +
        `Refusing to process payments until both are aligned.`,
    );
  }
}

export class ProductCatalogIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductCatalogIntegrityError";
  }
}

/**
 * Validate that the amount Mollie actually charged matches what the catalog
 * defines for the declared product, accounting for an optional promo
 * discount that was recorded in payment metadata.
 *
 * Returns `{ ok: true }` on match or `{ ok: false, reason }` on mismatch.
 * Used by the webhook to refuse activation if metadata was tampered with or
 * the customer paid less than the expected amount.
 */
export function validatePaymentAmount(params: {
  productKey: ProductKey;
  paidCents: number;
  discountCents?: number;
  currency?: string | null;
}): { ok: true } | { ok: false; reason: string; expectedCents: number } {
  const product = PRODUCT_CATALOG[params.productKey];
  if (!product) {
    return { ok: false, reason: "unknown_product", expectedCents: 0 };
  }
  if (params.currency && params.currency !== product.currency) {
    return {
      ok: false,
      reason: `currency_mismatch:${params.currency}`,
      expectedCents: product.priceCents,
    };
  }
  const discount = Math.max(
    0,
    product.allowPromo ? Math.floor(params.discountCents ?? 0) : 0,
  );
  const expectedCents = Math.max(0, product.priceCents - discount);
  if (params.paidCents !== expectedCents) {
    return {
      ok: false,
      reason: `amount_mismatch:${params.paidCents}!=${expectedCents}`,
      expectedCents,
    };
  }
  return { ok: true };
}
