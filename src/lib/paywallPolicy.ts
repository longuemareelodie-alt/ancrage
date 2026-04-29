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

export type ProfileCreatedAtStatus = "valid" | "missing" | "invalid";

/**
 * Classify a profile.created_at value before using it for paywall decisions.
 * - "missing"  → null/undefined/empty (profile row missing or column unset)
 * - "invalid"  → present but not a parseable date (data corruption)
 * - "valid"    → safe to compare against the cutoff
 *
 * Both "missing" and "invalid" are anomalies and should be logged by callers
 * so the underlying profile row can be repaired.
 */
export const classifyProfileCreatedAt = (
  createdAt: string | null | undefined,
): ProfileCreatedAtStatus => {
  if (!createdAt) return "missing";
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return "invalid";
  return "valid";
};

export const isGrandfatheredAccount = (createdAt: string | null | undefined): boolean => {
  // Conservative fallback: any anomaly (missing/invalid) → NOT grandfathered.
  // This preserves revenue safety; callers are expected to log the anomaly
  // separately so admins can repair the affected profile.
  if (classifyProfileCreatedAt(createdAt) !== "valid") return false;
  const created = new Date(createdAt as string).getTime();
  const cutoff = new Date(PAYWALL_ENFORCEMENT_CUTOFF_ISO).getTime();
  if (Number.isNaN(cutoff)) return false;
  return created < cutoff;
};
