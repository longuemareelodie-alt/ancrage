/**
 * Freemium policy — Ancrage
 * --------------------------
 * Trois niveaux d'accès :
 *  - "guest"     : non connecté
 *  - "freemium"  : connecté mais ni premium ni grandfathered
 *  - "paid"      : premium OU grandfathered (cf. paywallPolicy.ts)
 *
 * Règles freemium :
 *  - Check-in émotionnel : 3 jours distincts maximum
 *  - 1 ancrage corporel visible / 12
 *  - 2 signes LSF visibles / catalogue
 *  - 1 activité enfant visible / catalogue
 *  - Module "Comment tu te sens" : 1 utilisation
 *  - Communauté : lecture seule
 */

import { useAuth } from "@/contexts/AuthContext";
import { ALL_LSF_SIGNS } from "@/data/lsfCatalog";
import { ACTIVITIES } from "@/data/activitiesCatalog";

export type AccessTier = "guest" | "freemium" | "paid";

export const FREEMIUM_LIMITS = {
  checkinDays: 3,
  ancrages: 1,
  lsfSigns: 2,
  childActivities: 1,
  feelingsUses: 1,
} as const;

/** Clés d'émotions accessibles en freemium (1 / total). */
export const FREEMIUM_FREE_EMOTIONS = new Set<string>(
  ALL_EMOTIONS.slice(0, FREEMIUM_LIMITS.ancrages).map((e) => e.id),
);

/** Clés de signes LSF accessibles en freemium (2 / catalogue). */
export const FREEMIUM_FREE_LSF_KEYS = new Set<string>(
  ALL_LSF_SIGNS.slice(0, FREEMIUM_LIMITS.lsfSigns).map((s) => s.key),
);

/** IDs d'activités enfant accessibles en freemium (1 / catalogue). */
export const FREEMIUM_FREE_ACTIVITY_IDS = new Set<string>(
  ACTIVITIES.slice(0, FREEMIUM_LIMITS.childActivities).map((a) => a.id),
);

/**
 * Hook central — renvoie le niveau d'accès courant.
 * Retourne `null` tant que l'éligibilité n'est pas résolue (évite tout flash).
 */
export const useAccessTier = (): AccessTier | null => {
  const { user, loading, isPaid, eligibilityPhase } = useAuth();
  if (loading) return null;
  if (!user) return "guest";
  if (eligibilityPhase !== "ready") return null;
  return isPaid ? "paid" : "freemium";
};

/** Helper synchrone : vrai si l'utilisateur est limité par le freemium. */
export const isFreemiumLimited = (tier: AccessTier | null): boolean =>
  tier === "freemium" || tier === "guest";
