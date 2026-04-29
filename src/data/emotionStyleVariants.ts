import type { ActionStyle } from "@/lib/actionStyle";

export interface StepVariant {
  free: string[];
  locked: string[];
}

export type EmotionStyleVariants = {
  breathing: StepVariant;
  sensory: StepVariant;
};

/**
 * Variantes "respiration" vs "ancrage sensoriel" pour les pages émotions
 * à forte charge. Si la préférence est "any", on retombe sur les étapes
 * issues d'i18n (par défaut côté EmotionDetail).
 */
export const EMOTION_STYLE_VARIANTS: Record<string, EmotionStyleVariants> = {
  panique: {
    breathing: {
      free: [
        "Inspire 4 secondes par le nez",
        "Expire 6 secondes par la bouche",
      ],
      locked: [
        "Pose une main sur ton cœur",
        "Répète le cycle 5 fois",
        "Allonge encore l'expiration",
      ],
    },
    sensory: {
      free: [
        "Regarde autour de toi",
        "Nomme 5 objets que tu vois",
      ],
      locked: [
        "Touche une surface froide",
        "Sens tes pieds dans tes chaussures",
        "Écoute le son le plus lointain",
      ],
    },
  },
  hypervigilance: {
    breathing: {
      free: [
        "Inspire 3 secondes",
        "Expire 6 secondes, lèvres pincées",
      ],
      locked: [
        "Relâche les épaules à chaque expiration",
        "Pose une main sur le ventre",
        "Continue 1 minute",
      ],
    },
    sensory: {
      free: [
        "Regarde 3 choses autour de toi",
        "Écoute 2 sons précis",
      ],
      locked: [
        "Touche un objet et décris sa texture",
        "Sens la température de l'air",
        "Pose les pieds bien à plat",
      ],
    },
  },
  rumination: {
    breathing: {
      free: [
        "Inspire 4 secondes",
        "Expire 8 secondes en soufflant doucement",
      ],
      locked: [
        "À chaque expiration, dis « stop »",
        "Recommence 4 fois",
        "Reviens à ta respiration dès qu'une pensée passe",
      ],
    },
    sensory: {
      free: [
        "Fixe un point devant toi",
        "Décris-le mentalement (couleur, forme)",
      ],
      locked: [
        "Touche un objet proche",
        "Nomme 3 sensations dans ton corps",
        "Reviens au point fixe",
      ],
    },
  },
  explosion: {
    breathing: {
      free: [
        "Inspire profondément par le nez",
        "Expire fort par la bouche, longuement",
      ],
      locked: [
        "Répète 5 fois",
        "Allonge l'expiration à chaque cycle",
        "Pose une main sur le ventre",
      ],
    },
    sensory: {
      free: [
        "Serre tes poings 5 secondes",
        "Relâche d'un coup",
      ],
      locked: [
        "Appuie fort tes pieds dans le sol",
        "Passe les mains sous l'eau froide",
        "Secoue les bras pour décharger",
      ],
    },
  },
};

export function hasStyleVariants(key: string): boolean {
  return key in EMOTION_STYLE_VARIANTS;
}

export function getStyleVariant(
  key: string,
  style: ActionStyle,
): StepVariant | null {
  const v = EMOTION_STYLE_VARIANTS[key];
  if (!v) return null;
  if (style === "breathing") return v.breathing;
  if (style === "sensory") return v.sensory;
  return null;
}
