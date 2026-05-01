/**
 * URL parameter cleanup utility.
 *
 * Used after consuming one-shot navigation flags (e.g. `?launch=1` from the
 * welcome email) to:
 *   - Remove ONLY the keys we explicitly want stripped (the action flag + the
 *     standard tracking params), so any other useful query string the user or
 *     a partner appended (e.g. `?ref=…`, `?debug=1`) is preserved.
 *   - Preserve the URL `#hash` (used for in-page anchors and Supabase auth
 *     callbacks) — never drop it implicitly.
 *   - Replace history without adding a new entry, so the back button still
 *     works as expected.
 */

/** Standard tracking params we always want to drop from the visible URL. */
export const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
] as const;

export type CleanUrlOptions = {
  /**
   * Extra param keys to remove on top of the standard tracking params
   * (e.g. one-shot action flags like `launch`, `welcome`).
   */
  extraKeys?: readonly string[];
  /**
   * If true, removes ALL `utm_*` keys (even non-standard ones), in addition
   * to those listed in `extraKeys`. Defaults to false (keep behavior tight
   * and predictable).
   */
  stripAllUtm?: boolean;
};

/**
 * Build a cleaned URL string (path + filtered query + hash) for the current
 * window location. Returns null when running outside a browser context.
 */
export function buildCleanUrl(opts: CleanUrlOptions = {}): string | null {
  if (typeof window === "undefined") return null;

  const { extraKeys = [], stripAllUtm = false } = opts;
  const params = new URLSearchParams(window.location.search);

  const drop = new Set<string>([...TRACKING_PARAMS, ...extraKeys]);

  // Iterate over a snapshot of keys: URLSearchParams may yield duplicates and
  // we want to delete every occurrence in one pass.
  for (const key of Array.from(params.keys())) {
    if (drop.has(key)) {
      params.delete(key);
      continue;
    }
    if (stripAllUtm && key.toLowerCase().startsWith("utm_")) {
      params.delete(key);
    }
  }

  const qs = params.toString();
  // Preserve the hash explicitly. Without this, Supabase recovery/access tokens
  // delivered as `#access_token=…` would be silently dropped.
  return (
    window.location.pathname +
    (qs ? `?${qs}` : "") +
    (window.location.hash || "")
  );
}

/**
 * Apply `buildCleanUrl` to the current window via `history.replaceState`.
 * No-op outside the browser, when the URL is already clean, or when nothing
 * would actually change (avoids gratuitous history writes).
 */
export function cleanCurrentUrl(opts: CleanUrlOptions = {}): void {
  const next = buildCleanUrl(opts);
  if (!next) return;

  const current =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  if (next === current) return;

  window.history.replaceState({}, "", next);
}
