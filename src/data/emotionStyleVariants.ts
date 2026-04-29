import type { ActionStyle } from "@/lib/actionStyle";

export interface Step {
  text: string;
  /** Mini explication de ce que cette consigne change selon le style. */
  hint?: string;
}

export interface StepVariant {
  free: Step[];
  locked: Step[];
}

export type EmotionStyleVariants = {
  breathing: StepVariant;
  sensory: StepVariant;
};

const B = (text: string, hint?: string): Step => ({ text, hint });

/**
 * Variantes "respiration" vs "ancrage sensoriel" pour les pages émotions
 * à forte charge. Si la préférence est "any", on retombe sur les étapes
 * issues d'i18n (par défaut côté EmotionDetail).
 */
export const EMOTION_STYLE_VARIANTS: Record<string, EmotionStyleVariants> = {
  panique: {
    breathing: {
      free: [
        B("Inspire 4 secondes par le nez", "Active le nerf vague et freine l'alerte."),
        B("Expire 6 secondes par la bouche", "L'expiration longue calme le rythme cardiaque."),
      ],
      locked: [
        B("Pose une main sur ton cœur", "Crée un repère tactile pour suivre ton souffle."),
        B("Répète le cycle 5 fois", "La répétition stabilise le système nerveux."),
        B("Allonge encore l'expiration", "Plus l'expiration est longue, plus l'alarme baisse."),
      ],
    },
    sensory: {
      free: [
        B("Regarde autour de toi", "Sortir du tunnel mental en réactivant la vue."),
        B("Nomme 5 objets que tu vois", "Forcer le langage coupe la spirale émotionnelle."),
      ],
      locked: [
        B("Touche une surface froide", "Le froid réveille les capteurs et ramène ici."),
        B("Sens tes pieds dans tes chaussures", "Ancre ton corps dans le sol, pas dans la tête."),
        B("Écoute le son le plus lointain", "Élargir l'attention dilue la peur centrée."),
      ],
    },
  },
  hypervigilance: {
    breathing: {
      free: [
        B("Inspire 3 secondes", "Inspiration courte pour ne pas suractiver."),
        B("Expire 6 secondes, lèvres pincées", "Le souffle freiné apaise le système en alerte."),
      ],
      locked: [
        B("Relâche les épaules à chaque expiration", "Synchronise détente musculaire et souffle."),
        B("Pose une main sur le ventre", "Vérifie que tu respires bas, pas dans la poitrine."),
        B("Continue 1 minute", "Donne au corps le temps de redescendre."),
      ],
    },
    sensory: {
      free: [
        B("Regarde 3 choses autour de toi", "Re-scanner l'espace dit au cerveau : pas de danger."),
        B("Écoute 2 sons précis", "Cible l'attention au lieu de balayer en alerte."),
      ],
      locked: [
        B("Touche un objet et décris sa texture", "Le toucher détourné apaise la veille interne."),
        B("Sens la température de l'air", "Une sensation neutre recadre le système."),
        B("Pose les pieds bien à plat", "Le contact au sol envoie un signal de stabilité."),
      ],
    },
  },
  rumination: {
    breathing: {
      free: [
        B("Inspire 4 secondes", "Pose un cadre régulier pour casser la boucle."),
        B("Expire 8 secondes en soufflant doucement", "L'expiration longue dilue la pensée."),
      ],
      locked: [
        B("À chaque expiration, dis « stop »", "Un mot-ancre interrompt le scénario mental."),
        B("Recommence 4 fois", "La répétition recâble l'attention sur le souffle."),
        B("Reviens à ta respiration dès qu'une pensée passe", "Pas besoin de chasser, juste revenir."),
      ],
    },
    sensory: {
      free: [
        B("Fixe un point devant toi", "Stabilise le regard pour stabiliser le mental."),
        B("Décris-le mentalement (couleur, forme)", "La description occupe la zone qui rumine."),
      ],
      locked: [
        B("Touche un objet proche", "Le toucher concret coupe l'abstraction."),
        B("Nomme 3 sensations dans ton corps", "Sortir de la tête, revenir dans le corps."),
        B("Reviens au point fixe", "Boucle sensorielle qui remplace la boucle mentale."),
      ],
    },
  },
  explosion: {
    breathing: {
      free: [
        B("Inspire profondément par le nez", "Crée de l'espace avant la décharge."),
        B("Expire fort par la bouche, longuement", "Le souffle long évacue la tension thoracique."),
      ],
      locked: [
        B("Répète 5 fois", "Plusieurs cycles pour faire baisser la pression."),
        B("Allonge l'expiration à chaque cycle", "Plus c'est long, plus le système se calme."),
        B("Pose une main sur le ventre", "Garantit une respiration basse, pas un blocage."),
      ],
    },
    sensory: {
      free: [
        B("Serre tes poings 5 secondes", "Décharger la tension par le muscle, pas la voix."),
        B("Relâche d'un coup", "Le contraste signale au corps : la pression baisse."),
      ],
      locked: [
        B("Appuie fort tes pieds dans le sol", "Évacuer vers le bas plutôt que d'exploser."),
        B("Passe les mains sous l'eau froide", "Le froid coupe net la montée d'adrénaline."),
        B("Secoue les bras pour décharger", "Imite ce que fait le corps après un stress."),
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
