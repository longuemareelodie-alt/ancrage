/**
 * Lexique central — Ancrage / Digital Maman Libre
 * ---------------------------------------------------
 * RÈGLE D'OR : tout texte visible par l'utilisatrice (CTA, titre, réassurance,
 * confirmation, sous-titre) doit utiliser ce vocabulaire ou y faire référence.
 *
 * Axe narratif unique : MODE SURVIE → CALME
 *   Avant : "mode survie" / "système en alerte" / "épuisée"
 *   Après : "calme" / "sécurité" / "ancrée"
 *   Mécanique : "ancrage" (geste, exercice, réflexe)
 *
 * À NE PAS UTILISER (ambigu, médicalisé ou hors-axe) :
 *   - "guérir", "thérapie", "soigner"   → on parle de régulation, de retour
 *   - "performance", "objectif"          → on parle d'ancrage, de réflexe
 *   - "lutter", "combattre"              → on parle de redescendre, sortir
 *   - "stress" seul                      → préférer "alerte" / "mode survie"
 */

// ============================================================
// 1. AXE NARRATIF — vocabulaire de référence
// ============================================================

export const LEXICON = {
  // L'état AVANT (à nommer sans dramatiser)
  before: {
    state: "mode survie",
    body: "système en alerte",
    feeling: "épuisée",
    inner: "tout tourne dans ta tête",
  },

  // L'état APRÈS (la promesse)
  after: {
    state: "calme",
    body: "en sécurité",
    feeling: "ancrée",
    inner: "tu retrouves ton souffle",
  },

  // La mécanique — ce qui fait le pont
  mechanism: {
    noun: "ancrage", // un ancrage / les ancrages
    verb: "redescendre", // faire redescendre ton système
    duration: "30 secondes", // référence répétée
  },
} as const;

// ============================================================
// 2. CTA — boutons d'action
// ============================================================
// Règle : le verbe doit appartenir à la famille « sortir / récupérer / ancrer ».
// On a 3 niveaux d'engagement :

export const CTA_LIBRARY = {
  /** Action immédiate, gratuite, 30s — top of funnel */
  primary_free: "Sortir du mode survie · 30 s",

  /** Variante émotionnelle (testimonials, après preuve sociale) */
  primary_emotional: "Je récupère mon calme",

  /** Engagement payant — on assume la promesse complète */
  primary_paid: "Je récupère mon calme — 39 €",

  /** Action douce post-exercice */
  secondary_anchor: "Ancrer ce calme",

  /** Reprise / continuité */
  secondary_resume: "Reprendre mon ancrage",

} as const;

// ============================================================
// 3. PROMESSES — sous-titres / hero / sections
// ============================================================

export const PROMISE_LIBRARY = {
  /** Hero / slogan court */
  short: "Du mode survie au calme — en 30 secondes.",

  /** Sous-titre explicatif */
  long: "Des ancrages courts pour faire redescendre ton système nerveux, où que tu sois.",

  /** Identité cible */
  identity: "la maman ancrée",

  /** Transformation (témoignages, timeline) */
  transformation: "Sortir du mode survie. Devenir la maman ancrée.",
} as const;

// ============================================================
// 4. RÉASSURANCES — micro-textes sous les CTA
// ============================================================
// Règle : 3 leviers possibles — temps, gratuité, contrôle.
// On en combine 1 ou 2, jamais 3 (sinon ça sonne défensif).

export const REASSURANCE_LIBRARY = {
  /** Top of funnel — premier contact */
  free_first:
    "Paiement unique · accès à vie.",

  /** Mid funnel — après preuve */
  free_short: "30 secondes pour essayer. Tu gardes la main.",

  /** Avant un exercice — rassure sur la durée et le contrôle */
  exercise_safe:
    "Aucun compte requis · pause possible à chaque étape.",

  /** Après une action — confirme le passage */
  after_action: "Tu es en sécurité. Rien à valider, rien à prouver.",

  /** Avant paiement — lève l'objection prix */
  paid_safe:
    "Une seule fois — pas d'abonnement caché. 14 jours pour changer d'avis.",
} as const;

// ============================================================
// 5. CONFIRMATIONS — feedback après clic / validation
// ============================================================
// Règle : toujours dans la famille « sécurité » ou « ancré », jamais
// « bravo / félicitations » (qui crée une logique de performance).

export const CONFIRMATION_LIBRARY = {
  /** Micro-confirmation après un clic CTA (CTAButton confirmSafe) */
  click_safe: "Tu es en sécurité",

  /** Validation d'un exercice / d'une étape du parcours */
  step_done: "Ancré ✓",

  /** Fin d'un jour d'initiation */
  day_done: "Tu as ancré ce jour.",

  /** Fin d'un parcours complet */
  journey_done: "Tu es la maman ancrée.",
} as const;

// ============================================================
// 6. HELPERS — pour usage typé dans les composants
// ============================================================

export type CTAKey = keyof typeof CTA_LIBRARY;
export type ReassuranceKey = keyof typeof REASSURANCE_LIBRARY;
export type ConfirmationKey = keyof typeof CONFIRMATION_LIBRARY;

export const cta = (key: CTAKey) => CTA_LIBRARY[key];
export const reassure = (key: ReassuranceKey) => REASSURANCE_LIBRARY[key];
export const confirm = (key: ConfirmationKey) => CONFIRMATION_LIBRARY[key];
