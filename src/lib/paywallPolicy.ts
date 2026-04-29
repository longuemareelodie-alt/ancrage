/**
 * Paywall enforcement policy.
 *
 * Accounts created BEFORE this cutoff are "grandfathered": they keep full
 * access to the app even without a paid plan (no surprise lockout for users
 * who signed up before the one-time payment requirement existed).
 *
 * Accounts created ON OR AFTER this cutoff must complete the one-time payment
 * to access anything beyond auth, paywall, payment, and legal pages.
 *
 * To roll out paywall enforcement, update this constant. Use ISO 8601 UTC.
 */
export const PAYWALL_ENFORCEMENT_CUTOFF_ISO = "2026-04-29T00:00:00Z";

export const isGrandfatheredAccount = (createdAt: string | null | undefined): boolean => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const cutoff = new Date(PAYWALL_ENFORCEMENT_CUTOFF_ISO).getTime();
  if (Number.isNaN(created) || Number.isNaN(cutoff)) return false;
  return created < cutoff;
};
