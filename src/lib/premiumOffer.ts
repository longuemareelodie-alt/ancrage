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

/** Prix unique TTC de l'offre Premium, format court sans espace. */
export const PREMIUM_PRICE_SHORT = "39€";

/** Prix unique TTC de l'offre Premium, format long avec espace insécable typographique. */
export const PREMIUM_PRICE_LONG = "39 €";

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
