// Catalogue d'émotions enfant pour le module "Comment tu te sens ?"
// Couleurs en HSL pour respecter le design system (les nuances doux ici
// sont locales au module).

export type AgeBand = "0_3" | "3_6" | "6_9" | "9_12" | "12_plus";

export type EmotionKey =
  | "happy"
  | "sad"
  | "angry"
  | "scared"
  | "overwhelmed"
  | "unknown"
  | "frustrated"
  | "ashamed"
  | "lonely"
  | "misunderstood"
  | "empty"
  | "anxious"
  | "flooded";

export type Emotion = {
  key: EmotionKey;
  emoji: string;
  label: string;
  /** HSL color used for the soft halo behind the face. */
  hsl: string;
  /** When true, picking this emotion alone is a strong crisis signal (red/black). */
  crisisOnSelect?: boolean;
  parent: {
    /** Phrase à dire à l'enfant. */
    say: string;
    /** Geste concret à faire ensemble. */
    doTogether: string;
    /** Petit exercice (6–9, 9–12). */
    exercise?: string;
  };
  /** Outil d'expression proposé à l'enfant (9–12). */
  childOutlet?: string;
  /** Exercices autonomes pour l'ado (12+). */
  teenTools?: string[];
};

const DEFAULT_TEEN_TOOLS = [
  "Mets de la musique calme dans ton casque, 5 minutes.",
  "Respiration carrée 4-4-4-4, 5 cycles.",
  "Bois un grand verre d'eau, lentement.",
  "Écris ce qui te passe par la tête, sans te corriger.",
];

export const BASE_EMOTIONS: Emotion[] = [
  {
    key: "happy",
    emoji: "😊",
    label: "Je suis bien",
    hsl: "140 45% 70%",
    parent: {
      say: "« Je suis content·e que tu te sentes bien. Tu veux me raconter ? »",
      doTogether: "Profitez du moment, partagez un câlin ou un sourire.",
    },
  },
  {
    key: "sad",
    emoji: "😔",
    label: "Je suis triste",
    hsl: "210 60% 70%",
    parent: {
      say: "« Tu as le droit d'être triste. Je suis là, près de toi. »",
      doTogether: "Asseyez-vous à sa hauteur, proposez un câlin ou une main posée sur l'épaule.",
      exercise: "Respirez ensemble : 3 respirations lentes, main sur le ventre.",
    },
  },
  {
    key: "angry",
    emoji: "😠",
    label: "Je suis en colère",
    hsl: "0 65% 65%",
    crisisOnSelect: true,
    parent: {
      say: "« Ta colère est là, et c'est ok. Je reste calme avec toi. »",
      doTogether: "Mettez-le dans un endroit sûr, baissez la voix, attendez sans juger.",
      exercise: "Souffler fort dans les mains comme pour les réchauffer, 3 fois.",
    },
  },
  {
    key: "scared",
    emoji: "😨",
    label: "J'ai peur",
    hsl: "48 90% 65%",
    parent: {
      say: "« Tu as peur, c'est normal. Je suis là, tu n'es pas seul·e. »",
      doTogether: "Tenez sa main, restez près de lui sans forcer le contact.",
      exercise: "Nommer 3 choses qu'il voit, 2 qu'il entend, 1 qu'il touche.",
    },
  },
  {
    key: "overwhelmed",
    emoji: "🌊",
    label: "Je suis débordé",
    hsl: "0 0% 25%",
    crisisOnSelect: true,
    parent: {
      say: "« C'est trop pour toi là. On va ralentir ensemble. »",
      doTogether: "Allez dans un endroit calme, baissez la lumière et le bruit.",
      exercise: "Enroulez-le dans une couverture lourde ou un câlin serré.",
    },
  },
  {
    key: "unknown",
    emoji: "😶",
    label: "Je sais pas",
    hsl: "0 0% 65%",
    parent: {
      say: "« C'est ok de pas savoir. On va prendre le temps. »",
      doTogether: "Restez près de lui sans rien attendre, proposez un dessin libre.",
    },
  },
];

export const EXTENDED_EMOTIONS: Emotion[] = [
  ...BASE_EMOTIONS.filter((e) =>
    ["happy", "sad", "angry", "scared"].includes(e.key),
  ),
  {
    key: "frustrated",
    emoji: "😤",
    label: "Frustré",
    hsl: "20 70% 60%",
    parent: {
      say: "« Ce que tu vis est frustrant. Je comprends. »",
      doTogether: "Aidez-le à nommer ce qu'il voulait et ce qui n'a pas marché.",
      exercise: "Écrire ou dessiner ce qui l'agace, puis chiffonner la feuille.",
    },
  },
  {
    key: "ashamed",
    emoji: "😳",
    label: "Honteux",
    hsl: "330 50% 70%",
    parent: {
      say: "« Tu n'es pas une mauvaise personne. Je t'aime. »",
      doTogether: "Rassurez sans minimiser, parlez d'une situation où vous avez ressenti ça.",
    },
  },
  {
    key: "lonely",
    emoji: "🥺",
    label: "Seul",
    hsl: "230 35% 65%",
    parent: {
      say: "« Tu te sens seul·e. Je suis là, vraiment. »",
      doTogether: "Proposez un moment 1-1 sans écran, 10 minutes minimum.",
    },
  },
  {
    key: "misunderstood",
    emoji: "😞",
    label: "Incompris",
    hsl: "260 35% 65%",
    parent: {
      say: "« Tu as l'impression qu'on ne te comprend pas. Aide-moi à comprendre. »",
      doTogether: "Reformulez ce qu'il dit avec ses mots à lui, sans corriger.",
    },
  },
  {
    key: "empty",
    emoji: "😶‍🌫️",
    label: "Vide",
    hsl: "200 15% 55%",
    crisisOnSelect: true,
    parent: {
      say: "« Tu te sens vide. Je veux t'écouter, à ton rythme. »",
      doTogether: "Restez disponible. Si ça dure plusieurs jours, contactez un professionnel.",
    },
  },
  {
    key: "anxious",
    emoji: "😰",
    label: "Anxieux",
    hsl: "60 50% 60%",
    parent: {
      say: "« L'anxiété te serre. On va respirer ensemble. »",
      doTogether: "Posez vos mains sur ses épaules, regardez-le doucement.",
      exercise: "Respiration carrée : inspire 4s, retiens 4s, expire 4s, retiens 4s.",
    },
  },
  {
    key: "flooded",
    emoji: "🌊",
    label: "Débordé",
    hsl: "190 50% 50%",
    crisisOnSelect: true,
    parent: {
      say: "« C'est trop, je le vois. On met tout sur pause. »",
      doTogether: "Réduisez les stimulations : lumière, bruit, monde autour.",
      exercise: "Compter 10 expirations lentes, ensemble.",
    },
  },
];

export const OBSERVED_SIGNS_0_3 = [
  { key: "cries_nonstop", label: "Il pleure sans s'arrêter" },
  { key: "rolls_floor", label: "Il se roule par terre" },
  { key: "head_bang", label: "Il se tape la tête", crisis: true },
  { key: "withdraws", label: "Il se recroqueville" },
  { key: "refuses_contact", label: "Il refuse tout contact" },
  { key: "agitated", label: "Il est agité, court partout" },
] as const;

export const BODY_LOCATIONS = [
  { key: "belly", label: "Dans le ventre", emoji: "🫃" },
  { key: "head", label: "Dans la tête", emoji: "🧠" },
  { key: "throat", label: "Dans la gorge", emoji: "😶" },
  { key: "hands", label: "Dans les mains", emoji: "✋" },
  { key: "all", label: "Partout", emoji: "🌐" },
] as const;

export const INTENSITY_3 = [
  { value: 1, label: "Un peu", color: "48 90% 65%" },
  { value: 2, label: "Beaucoup", color: "30 90% 60%" },
  { value: 3, label: "Trop", color: "0 70% 55%" },
];

export const INTENSITY_5 = [
  { value: 1, label: "1", hint: "À peine" },
  { value: 2, label: "2", hint: "Un peu" },
  { value: 3, label: "3", hint: "Moyen" },
  { value: 4, label: "4", hint: "Beaucoup" },
  { value: 5, label: "5", hint: "Trop fort" },
];

/**
 * Détermine si une entrée doit être marquée comme "crise" — utilisé pour
 * afficher le bouton vers le module "Gérer une crise".
 */
export function isCrisisEntry(opts: {
  emotion?: EmotionKey;
  intensity?: number;
  intensityScale?: 3 | 5;
  signs?: string[];
}): boolean {
  if (opts.signs?.some((s) => s === "head_bang")) return true;
  if (opts.emotion) {
    const e = [...BASE_EMOTIONS, ...EXTENDED_EMOTIONS].find(
      (x) => x.key === opts.emotion,
    );
    if (e?.crisisOnSelect) return true;
  }
  if (opts.intensityScale === 3 && opts.intensity === 3) return true;
  if (opts.intensityScale === 5 && (opts.intensity ?? 0) >= 4) return true;
  return false;
}

export function getEmotion(key: EmotionKey | undefined | null): Emotion | undefined {
  if (!key) return undefined;
  return [...BASE_EMOTIONS, ...EXTENDED_EMOTIONS].find((e) => e.key === key);
}
