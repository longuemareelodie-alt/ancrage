/**
 * Retry helper for Supabase queries that may fail due to transient
 * network/timeout errors. Uses progressive (exponential) backoff with jitter.
 *
 * Usage:
 *   const { data, error } = await withRetry(() =>
 *     supabase.from("profiles").select("is_premium").eq("user_id", id).single()
 *   );
 *
 * Errors considered transient (and retried):
 *   - Network failures (fetch threw, no response)
 *   - PostgREST/Supabase errors with no `code` (typically network/timeout)
 *   - HTTP 5xx-style codes returned by the SDK
 *   - PostgreSQL "57014" (statement timeout)
 *
 * Permanent errors (RLS, 4xx, missing row) are returned immediately.
 */

export type RetryResult<T> = {
  data: T | null;
  error: any | null;
  attempts: number;
  /** True if we exhausted retries because of transient errors. */
  transientFailure: boolean;
};

export interface RetryOptions {
  /** Total attempts (including the first try). Default 4 (≈ 0 + 0.5s + 1s + 2s). */
  maxAttempts?: number;
  /** Base delay in ms between attempts. Default 500. */
  baseDelayMs?: number;
  /** Max delay cap in ms. Default 4000. */
  maxDelayMs?: number;
  /** Optional callback fired before each retry (for UI state). */
  onRetry?: (attempt: number, error: any) => void;
  /** Per-attempt timeout in ms (uses AbortController-like racing). Default 8000. */
  timeoutMs?: number;
}

const TRANSIENT_PG_CODES = new Set([
  "57014", // statement_timeout
  "08000", // connection_exception
  "08003",
  "08006",
  "08001",
  "08004",
  "53300", // too_many_connections
  "PGRST000",
  "PGRST001",
]);

const isTransientError = (error: any): boolean => {
  if (!error) return false;

  // Native fetch / network failures
  const name = error?.name;
  const msg = String(error?.message ?? "").toLowerCase();
  if (
    name === "TypeError" ||
    name === "AbortError" ||
    name === "TimeoutError" ||
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("load failed")
  ) {
    return true;
  }

  // Supabase / PostgREST style
  const code = error?.code ? String(error.code) : null;
  if (code && TRANSIENT_PG_CODES.has(code)) return true;

  // HTTP status from PostgREST (502/503/504) — sometimes surfaced as `status`
  const status = typeof error?.status === "number" ? error.status : null;
  if (status && status >= 500 && status <= 599) return true;

  return false;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const withTimeout = async <T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race<T>([
      fn(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          const e = new Error("Request timed out");
          (e as any).name = "TimeoutError";
          reject(e);
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export async function withRetry<T>(
  query: () => Promise<{ data: T | null; error: any | null }> | PromiseLike<{ data: T | null; error: any | null }>,
  opts: RetryOptions = {},
): Promise<RetryResult<T>> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const baseDelay = opts.baseDelayMs ?? 500;
  const maxDelay = opts.maxDelayMs ?? 4000;
  const timeoutMs = opts.timeoutMs ?? 8000;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await withTimeout(() => Promise.resolve(query()), timeoutMs);

      // Supabase returns { data, error }. Permanent errors → bail out.
      if (result?.error) {
        if (!isTransientError(result.error) || attempt === maxAttempts) {
          return {
            data: result.data ?? null,
            error: result.error,
            attempts: attempt,
            transientFailure: false,
          };
        }
        lastError = result.error;
      } else {
        return {
          data: (result?.data ?? null) as T | null,
          error: null,
          attempts: attempt,
          transientFailure: false,
        };
      }
    } catch (err: any) {
      // Thrown errors (network, timeout) — only retry if transient
      if (!isTransientError(err) || attempt === maxAttempts) {
        return {
          data: null,
          error: err,
          attempts: attempt,
          transientFailure: isTransientError(err),
        };
      }
      lastError = err;
    }

    // Backoff with jitter
    const delay = Math.min(maxDelay, baseDelay * 2 ** (attempt - 1));
    const jittered = Math.round(delay * (0.7 + Math.random() * 0.6));
    opts.onRetry?.(attempt, lastError);
    await sleep(jittered);
  }

  return {
    data: null,
    error: lastError,
    attempts: maxAttempts,
    transientFailure: true,
  };
}
