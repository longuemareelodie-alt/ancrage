// Module 3 — Gérer une crise.
// Matrice : contexte (maison / extérieur) × profil parent × situation.
// Les étapes sont volontairement courtes et actionnables.

export type CrisisContext = "maison" | "exterieur";
export type CrisisParent = "maman" | "papa" | "deux";
export type CrisisSituation =
  | "un-enfant-avec-fratrie"
  | "plusieurs-en-crise"
  | "exterieur-seul-plusieurs";

export type CrisisScenario = {
  steps: string[];
  apresEnfant: string[];
  apresFratrie: string[];
  apresParent: string[];
};

export const SITUATION_LABELS: Record<CrisisSituation, string> = {
  "un-enfant-avec-fratrie": "Un enfant en crise, d'autres enfants présents",
  "plusieurs-en-crise": "Plusieurs enfants en crise en même temps",
  "exterieur-seul-plusieurs": "Seul·e à l'extérieur avec plusieurs enfants",
};

const baseSteps = (parent: CrisisParent, context: CrisisContext, situation: CrisisSituation): string[] => {
  const isExt = context === "exterieur";
  const isAlone = parent !== "deux";

  if (situation === "exterieur-seul-plusieurs" || (isExt && isAlone)) {
    return [
      "Stop. Mettez-vous physiquement entre l'enfant en crise et le danger (route, escalier, foule).",
      "Baissez-vous à sa hauteur, voix basse et lente. Pas d'explication, juste votre présence.",
      "Mettez les autres enfants en sécurité immédiate : main sur l'épaule, contre vous ou assis tout près.",
      "Sortez la carte d'aide « Mon enfant a besoin d'aide » si quelqu'un peut tenir la fratrie.",
      "Réduisez les stimuli : casque, capuche, coin calme, voiture à proximité si possible.",
      "Attendez la décharge sans forcer le contact physique. Restez là, c'est suffisant.",
      "Quand le corps se relâche : eau, doudou, retour vers un endroit familier.",
    ];
  }

  if (situation === "plusieurs-en-crise") {
    return [
      "Respirez 3 fois. Vous ne pourrez pas tout faire en même temps, et c'est normal.",
      "Sécurisez l'espace : éloignez les objets dangereux, fermez la porte de la pièce.",
      isAlone
        ? "Choisissez un enfant à apaiser en premier (le plus jeune ou le plus en danger)."
        : "Répartissez-vous : un parent par enfant, sans commenter l'autre.",
      "Pour l'autre enfant : un mot, un coussin, un coin calme. Vous reviendrez.",
      "Voix basse, gestes lents, pas de questions. Présence > parole.",
      "Acceptez que l'épisode dure. Votre calme est leur ancre.",
    ];
  }

  // un-enfant-avec-fratrie
  return [
    "Posez la fratrie dans un endroit sûr (canapé, autre pièce, écran exceptionnellement OK).",
    "Allez vers l'enfant en crise. Distance respectueuse, à sa hauteur.",
    "Pas de « calme-toi », pas de « pourquoi ». Juste : « Je suis là. »",
    "Réduisez les stimuli (lumière, son, vêtements qui serrent).",
    "Si contact physique accepté : main sur le dos, pression ferme et constante.",
    "Attendez. La décharge dure ce qu'elle dure. Vous tenez.",
    "Quand le corps se relâche : eau, mots simples, transition douce.",
  ];
};

const baseApresEnfant = [
  "Eau, mouchage, position confortable.",
  "Pas de débrief immédiat. Le cerveau a besoin de redescendre.",
  "Plus tard (parfois le lendemain) : « Tu te souviens ? Qu'est-ce qui était trop ? »",
  "Validez sans juger : « C'était trop fort, c'est ok que ça soit sorti comme ça. »",
];

const baseApresFratrie = [
  "Reconnaissez ce qu'ils ou elles ont vu : « Ça a été impressionnant, hein ? »",
  "Expliquez sans dramatiser : « Le cerveau de ton frère/ta sœur s'est emballé, comme un orage. »",
  "Rappelez-leur qu'ils ou elles ne sont pas responsables et n'ont rien à « réparer ».",
  "Donnez un moment pour eux ensuite (lecture, câlin, jeu seul·e avec vous).",
];

const baseApresParent = [
  "Vous avez tenu. C'est immense. Reconnaissez-le.",
  "Hydratez-vous, mangez quelque chose. Le corps a vécu une décharge aussi.",
  "Notez (mentalement ou dans le journal) : qu'est-ce qui a précédé ? Quel signal manqué ?",
  "Ne faites pas de bilan ce soir. Un échange à froid, dans 24-48h, avec votre conjoint·e ou un proche.",
  "Si les épisodes se rapprochent ou vous épuisent : parlez-en à un professionnel. Vous n'avez pas à porter ça seul·e.",
];

export function getScenario(context: CrisisContext, parent: CrisisParent, situation: CrisisSituation): CrisisScenario {
  return {
    steps: baseSteps(parent, context, situation),
    apresEnfant: baseApresEnfant,
    apresFratrie: baseApresFratrie,
    apresParent: baseApresParent,
  };
}

export const CRISIS_TROUBLES_COVERED = [
  "TSA",
  "TDAH",
  "Épilepsie",
  "Surdité",
  "Tous troubles du comportement",
];
