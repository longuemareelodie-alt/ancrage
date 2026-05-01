/**
 * Motion preferences — détecte si on doit réduire/désactiver les transitions.
 *
 * Deux signaux sont combinés :
 *  1. `prefers-reduced-motion` (préférence OS / accessibilité — toujours respectée).
 *  2. Heuristique « low-end mobile » : peu de cœurs CPU + peu de RAM.
 *     Sur ces appareils, animer opacity/translate plein écran et box-shadow
 *     en boucle provoque clignotements et saccades — on bascule alors sur
 *     une transition instantanée (ou très courte) pour éviter l'effet.
 *
 * L'évaluation est faite une seule fois au chargement (les capacités hardware
 * ne changent pas) puis mise en cache pour éviter tout coût en runtime.
 */

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number;
};

let cachedReducedMotion: boolean | null = null;
let cachedLowEnd: boolean | null = null;

/** True si l'utilisateur a activé `prefers-reduced-motion` au niveau OS. */
export function prefersReducedMotion(): boolean {
  if (cachedReducedMotion !== null) return cachedReducedMotion;
  if (typeof window === "undefined" || !window.matchMedia) {
    cachedReducedMotion = false;
    return false;
  }
  cachedReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return cachedReducedMotion;
}

/**
 * Heuristique appareil bas-de-gamme : ≤ 4 cœurs **et** ≤ 4 Go RAM.
 * On exige les deux pour éviter les faux positifs (un MacBook M-series est
 * « 8 cœurs » mais `deviceMemory` est plafonné à 8 par la spec).
 */
export function isLowEndDevice(): boolean {
  if (cachedLowEnd !== null) return cachedLowEnd;
  if (typeof navigator === "undefined") {
    cachedLowEnd = false;
    return false;
  }
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as NavigatorWithDeviceMemory).deviceMemory ?? 8;
  cachedLowEnd = cores <= 4 && memory <= 4;
  return cachedLowEnd;
}

/**
 * True si on doit COUPER les animations non-essentielles (boucles infinies
 * type `calm-breathe`, animations décoratives sur cartes, etc.).
 */
export function shouldDisableDecorativeMotion(): boolean {
  return prefersReducedMotion() || isLowEndDevice();
}
