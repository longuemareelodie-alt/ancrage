import type { BrainState } from "@/hooks/usePulseState";

/**
 * Voix douces d'Éclosia.
 * Chaque enfant garde la même voix (repère stable), et le ton suit son état du jour.
 */
export const SOFT_VOICES = ["Kore", "Aoede", "Callirrhoe", "Leda", "Zephyr", "Vindemiatrix"] as const;
export type SoftVoice = (typeof SOFT_VOICES)[number];

/** Voix stable pour un enfant : même identifiant → même voix, toujours. */
export const voiceForChild = (profileId: string): SoftVoice => {
  let sum = 0;
  for (let i = 0; i < profileId.length; i += 1) sum = (sum + profileId.charCodeAt(i)) % 997;
  return SOFT_VOICES[sum % SOFT_VOICES.length];
};

/** Le ton s'adapte à l'état : jamais euphorique, jamais plaintif. */
export const STYLE_FOR_STATE: Record<BrainState, string> = {
  go: "Dis d'une voix claire, chaleureuse et posée, en français",
  moyen: "Dis d'une voix douce et tranquille, sans presser, en français",
  sature: "Dis très lentement, d'une voix basse et rassurante, en français",
  ko: "Dis dans un murmure très doux, lentement, comme pour apaiser, en français",
};

export const NEUTRAL_STYLE = "Dis d'une voix douce, calme et chaleureuse, en français";
