/**
 * Lexique central — Offre Premium (Ancrage)
 * ------------------------------------------
 * Toutes les mentions textuelles de l'offre Premium (nom, prix, libellés
 * « programme complet » / « accès complet », CTA de déblocage) doivent passer
 * par ce fichier afin d'éviter les incohérences d'affichage.
 *
 * Pour les chaînes traduites (FR/EN/DE/AR), voir aussi `src/i18n/locales/*.json`.
 * Ce fichier reste la source de vérité pour le code TSX en français qui n'utilise
 * pas i18n.
 */

/**
 * Prix unique TTC de l'offre Premium, exprimé en centimes EUR.
 * Source de vérité UNIQUE côté frontend — DOIT être synchronisé avec
 * `PRODUCT_CATALOG.premium.priceCents` dans
 * `supabase/functions/_shared/productCatalog.ts` (vérifié par un test).
 */
export const PREMIUM_PRICE_CENTS = 9700;

/** Devise unique de l'offre. */
export const PREMIUM_CURRENCY = "EUR" as const;

/** Valeur numérique en euros, dérivée des centimes (jamais hardcodée ailleurs). */
export const PREMIUM_PRICE_EUR = PREMIUM_PRICE_CENTS / 100;

/**
 * Format canonique d'affichage du prix Premium.
 *
 * Règle unique pour TOUTES les langues (FR, EN, DE, AR) :
 *   - pas de décimales pour un montant entier (57, pas 57,00)
 *   - séparateur entre montant et symbole = espace insécable (U+00A0)
 *   - symbole "€" toujours après le montant
 *
 * Résultat : `57 €` rendu de façon identique partout dans l'UI, sans
 * dépendre de la locale active (qui produirait "€57.00" en en-US, etc.).
 *
 * Si on doit un jour formater un montant non-entier, on utilise
 * `formatEurAmount()` plutôt qu'une concaténation à la main.
 */
export const formatEurAmount = (amount: number): string => {
  const hasFraction = !Number.isInteger(amount);
  const body = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
  return `${body}\u00A0€`;
};

/**
 * Prix unique au format canonique (ex: "57 €" avec espace insécable).
 * Les deux constantes pointent vers la MÊME chaîne — l'historique distinction
 * "short / long" est conservée pour ne pas casser les imports existants,
 * mais le rendu est désormais uniforme partout.
 */
export const PREMIUM_PRICE_LONG = formatEurAmount(PREMIUM_PRICE_EUR);
export const PREMIUM_PRICE_SHORT = PREMIUM_PRICE_LONG;

/** Nom commercial de l'offre. */
export const PREMIUM_OFFER_NAME = "Ancrage Premium";

/** Libellé canonique du périmètre de l'offre — à utiliser partout (UI, emails, PDF). */
export const PREMIUM_SCOPE_LABEL = "programme complet";

/** Variante « accès complet » (utilisée dans les contextes de déblocage / paywall). */
export const PREMIUM_FULL_ACCESS_LABEL = "accès complet";

/** Libellé long pour la promesse (rassurance, FAQ, CGV). */
export const PREMIUM_LIFETIME_LABEL = "accès à vie";

// ============================================================
// CTA — boutons d'action liés à l'offre Premium
// ============================================================

export const PREMIUM_CTA = {
  /** CTA principal payant (hero, paywall) */
  primary_paid: `Je récupère mon calme — ${PREMIUM_PRICE_LONG}`,

  /** CTA émotionnel alternatif (post preuve sociale) */
  feel_better: `Je veux me sentir mieux — ${PREMIUM_PRICE_SHORT}`,

  /** CTA de déblocage depuis une page bloquée */
  unlock_full_program: `Débloquer le ${PREMIUM_SCOPE_LABEL}`,

  /** CTA de déblocage depuis l'espace santé / fonctionnalités secondaires */
  unlock_full_access: `Débloquer l'${PREMIUM_FULL_ACCESS_LABEL}`,

  /** CTA d'activation depuis le profil */
  activate_lifetime: `Activer mon ${PREMIUM_LIFETIME_LABEL}`,

  /** CTA générique de découverte */
  discover_premium: `Découvrir l'offre ${PREMIUM_OFFER_NAME.replace("Ancrage ", "")}`,
} as const;
