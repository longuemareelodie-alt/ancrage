/**
 * Suivi des liens d'ambassadrices.
 *
 * Quand une visiteuse arrive avec `?ref=ECL-XXXXXX`, on stocke le code
 * en cookie 90 jours + localStorage. Au moment du paiement, on rattache
 * le code à la commande pour attribuer la commission.
 */

const COOKIE_NAME = "eclosia_ref";
const STORAGE_KEY = "eclosia_ref";
const TTL_DAYS = 90;
const CODE_PATTERN = /^ECL-[A-Z0-9]{4,12}$/;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const setCookie = (value: string, days: number) => {
  if (!isBrowser()) return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const readCookie = (): string | null => {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Lit `?ref=` dans l'URL courante et le persiste si valide.
 * Idempotent : ne réécrit pas si le code est déjà stocké.
 */
export const captureReferralCodeFromUrl = (): string | null => {
  if (!isBrowser()) return null;
  try {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("ref");
    if (!raw) return getStoredReferralCode();

    const normalized = raw.trim().toUpperCase();
    if (!CODE_PATTERN.test(normalized)) return getStoredReferralCode();

    setCookie(normalized, TTL_DAYS);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      /* localStorage indisponible */
    }
    return normalized;
  } catch {
    return getStoredReferralCode();
  }
};

/**
 * Récupère le code stocké (cookie en priorité, fallback localStorage).
 */
export const getStoredReferralCode = (): string | null => {
  if (!isBrowser()) return null;
  const fromCookie = readCookie();
  if (fromCookie && CODE_PATTERN.test(fromCookie)) return fromCookie;
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage && CODE_PATTERN.test(fromStorage)) return fromStorage;
  } catch {
    /* ignore */
  }
  return null;
};

/**
 * Efface le code après attribution réussie d'une commission.
 */
export const clearReferralCode = () => {
  if (!isBrowser()) return;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
