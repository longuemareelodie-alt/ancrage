/**
 * Traduit les messages d'erreur du service de connexion (en anglais) en
 * phrases simples en français. Un message inconnu n'est jamais montré brut :
 * on retombe sur le message de repli.
 */
const RULES: Array<[RegExp, string]> = [
  [/invalid login credentials|invalid_credentials|invalid email or password/i,
    "Adresse e-mail ou mot de passe incorrect."],
  [/email not confirmed/i,
    "Ton adresse e-mail n'est pas encore confirmée. Regarde dans ta boîte mail (et les indésirables)."],
  [/user not found/i, "Aucun compte n'existe avec cette adresse."],
  [/user already registered|already been registered/i, "Un compte existe déjà avec cette adresse."],
  [/password should be at least|password is too short|weak password|weak_password/i,
    "Le mot de passe doit contenir au moins 6 caractères."],
  [/new password should be different|same_password/i,
    "Choisis un mot de passe différent de l'ancien."],
  [/unable to validate email address|invalid format|email address .* is invalid/i,
    "Cette adresse e-mail n'est pas valide."],
  [/rate limit|too many requests|over_email_send_rate_limit|for security purposes, you can only request/i,
    "Trop d'essais d'affilée. Attends une minute puis réessaie."],
  [/session missing|auth session missing|jwt expired|token has expired|otp_expired|link is invalid or has expired/i,
    "Ce lien a expiré. Demande un nouveau lien."],
  [/failed to fetch|load failed|network ?error|networkerror/i,
    "Connexion internet impossible pour le moment. Vérifie ton réseau et réessaie."],
  [/signups not allowed|signup is disabled/i,
    "Les comptes sont créés après le paiement. Découvre l'offre sur la page d'accueil."],
];

export function authErrorFr(err: unknown, fallback = "Une erreur est survenue. Réessaie."): string {
  const raw =
    typeof err === "string"
      ? err
      : err && typeof err === "object"
        ? [(err as { code?: unknown }).code, (err as { message?: unknown }).message]
            .filter((v) => typeof v === "string")
            .join(" ")
        : "";
  if (!raw) return fallback;
  for (const [re, fr] of RULES) if (re.test(raw)) return fr;
  return fallback;
}
