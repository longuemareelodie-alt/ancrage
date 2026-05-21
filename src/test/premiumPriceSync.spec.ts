/**
 * Single source of truth — guard test.
 *
 * Le prix Premium est défini :
 *   - côté UI dans `src/lib/premiumOffer.ts` (PREMIUM_PRICE_CENTS)
 *   - côté serveur dans `supabase/functions/_shared/productCatalog.ts`
 *     (PRODUCT_CATALOG.premium.priceCents)
 *
 * Ces deux valeurs DOIVENT toujours être identiques. Ce test verrouille la
 * synchronisation : toute divergence accidentelle (UI affichée ≠ prix
 * effectivement débité par Mollie) fait échouer la CI.
 */

import { describe, it, expect } from "vitest";
import {
  PREMIUM_PRICE_CENTS,
  PREMIUM_PRICE_EUR,
  PREMIUM_PRICE_SHORT,
  PREMIUM_PRICE_LONG,
  PREMIUM_CURRENCY,
} from "@/lib/premiumOffer";
import { PRODUCT_CATALOG } from "../../supabase/functions/_shared/productCatalog";

describe("premium price — single source of truth", () => {
  it("UI price (cents) equals server catalog price (cents)", () => {
    expect(PREMIUM_PRICE_CENTS).toBe(PRODUCT_CATALOG.premium.priceCents);
  });

  it("UI currency equals server catalog currency", () => {
    expect(PREMIUM_CURRENCY).toBe(PRODUCT_CATALOG.premium.currency);
  });

  it("display strings are derived from PREMIUM_PRICE_CENTS (no hardcoded number drift)", () => {
    const expectedEur = PREMIUM_PRICE_CENTS / 100;
    expect(PREMIUM_PRICE_EUR).toBe(expectedEur);
    expect(PREMIUM_PRICE_SHORT).toBe(`${expectedEur}€`);
    expect(PREMIUM_PRICE_LONG).toBe(`${expectedEur} €`);
  });
});
