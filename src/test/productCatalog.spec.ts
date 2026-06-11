/**
 * Locking test for the server-authoritative product catalog.
 *
 * This test guards against silent edits of product LABEL or AMOUNT (or
 * currency / promo / guest flags). Any such change MUST also bump:
 *   - `PRODUCT_CATALOG_FINGERPRINT` in `supabase/functions/_shared/productCatalog.ts`
 *   - The EXPECTED_* constants in this file
 *
 * Forgetting either step causes this test to fail loudly in CI before the
 * change can ship.
 */

import { describe, expect, it } from "vitest";
import {
  PRODUCT_CATALOG,
  PRODUCT_CATALOG_FINGERPRINT,
  computeCatalogFingerprint,
  validatePaymentAmount,
} from "../../supabase/functions/_shared/productCatalog";

// ⚠️  These values lock the public-facing contract of the product offering.
// Updating any of them is a deliberate business decision and requires the
// fingerprint below to be recomputed and updated together.
const EXPECTED_FINGERPRINT = "03a9b7fad46b757d";

const EXPECTED_PRODUCTS = {
  premium: {
    priceCents: 9700,
    currency: "EUR" as const,
    description: "ANCRAGE — Accès Premium",
    allowPromo: true,
    allowGuestCheckout: true,
    metadataType: "lifetime" as const,
  },
  initiation_7d: {
    priceCents: 499,
    currency: "EUR" as const,
    description: "ANCRAGE — Initiation 7 jours",
    allowPromo: false,
    allowGuestCheckout: true,
    metadataType: "initiation_7d" as const,
  },
};

describe("product catalog (server-authoritative)", () => {
  it("fingerprint constant matches the runtime fingerprint", () => {
    expect(computeCatalogFingerprint()).toBe(PRODUCT_CATALOG_FINGERPRINT);
  });

  it("fingerprint is the expected, reviewed value", () => {
    // If this fails: a product label, amount, currency or flag changed
    // without a matching update to EXPECTED_FINGERPRINT here AND to
    // PRODUCT_CATALOG_FINGERPRINT in productCatalog.ts.
    expect(PRODUCT_CATALOG_FINGERPRINT).toBe(EXPECTED_FINGERPRINT);
  });

  it.each(Object.entries(EXPECTED_PRODUCTS))(
    "product %s exposes the locked label, amount and flags",
    (key, expected) => {
      const actual = PRODUCT_CATALOG[key as keyof typeof EXPECTED_PRODUCTS];
      expect(actual).toBeDefined();
      expect(actual.priceCents).toBe(expected.priceCents);
      expect(actual.currency).toBe(expected.currency);
      expect(actual.description).toBe(expected.description);
      expect(actual.allowPromo).toBe(expected.allowPromo);
      expect(actual.allowGuestCheckout).toBe(expected.allowGuestCheckout);
      expect(actual.metadataType).toBe(expected.metadataType);
    },
  );

  it("catalog object is frozen (no runtime tampering)", () => {
    expect(Object.isFrozen(PRODUCT_CATALOG)).toBe(true);
    expect(Object.isFrozen(PRODUCT_CATALOG.premium)).toBe(true);
    expect(Object.isFrozen(PRODUCT_CATALOG.initiation_7d)).toBe(true);
  });

  it("only the two expected product keys are defined", () => {
    expect(Object.keys(PRODUCT_CATALOG).sort()).toEqual([
      "initiation_7d",
      "premium",
    ]);
  });
});

describe("validatePaymentAmount", () => {
  it("accepts the exact catalog amount", () => {
    expect(
      validatePaymentAmount({
        productKey: "initiation_7d",
        paidCents: 499,
        currency: "EUR",
      }),
    ).toEqual({ ok: true });
    expect(
      validatePaymentAmount({
        productKey: "premium",
        paidCents: 9700,
        currency: "EUR",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects an under-payment", () => {
    const r = validatePaymentAmount({
      productKey: "initiation_7d",
      paidCents: 100,
      currency: "EUR",
    }) as { ok: false; reason: string; expectedCents: number };
    expect(r.ok).toBe(false);
    expect(r.expectedCents).toBe(499);
    expect(r.reason).toMatch(/^amount_mismatch:/);
  });

  it("rejects a currency switch", () => {
    const r = validatePaymentAmount({
      productKey: "premium",
      paidCents: 9700,
      currency: "USD",
    }) as { ok: false; reason: string; expectedCents: number };
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("currency_mismatch:USD");
  });

  it("ignores discount on a product that disallows promos", () => {
    // initiation_7d.allowPromo === false → discount must be discarded.
    const r = validatePaymentAmount({
      productKey: "initiation_7d",
      paidCents: 200,
      discountCents: 299,
      currency: "EUR",
    }) as { ok: false; reason: string; expectedCents: number };
    expect(r.ok).toBe(false);
    expect(r.expectedCents).toBe(499);
  });

  it("applies discount on a promo-eligible product", () => {
    expect(
      validatePaymentAmount({
        productKey: "premium",
        paidCents: 4200, // 5700 - 1500
        discountCents: 1500,
        currency: "EUR",
      }),
    ).toEqual({ ok: true });
  });
});
