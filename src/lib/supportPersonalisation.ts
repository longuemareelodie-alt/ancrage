// Personnalisation d'un support : ce que l'on demande AVANT de créer,
// pour que le support arrive déjà adapté à l'enfant.
export type Personalisation = {
  childId: string | null;
  ageBand: string;
  language: string;
  objective: string;
  context: string;
};

export const AGE_BANDS = ["2-3 ans", "4-5 ans", "6-8 ans", "9-12 ans", "13 ans et +"];

export const LANGUAGE_LEVELS = [
  "Pas encore de mots",
  "Quelques mots",
  "Phrases simples",
  "Parle bien",
];

export const OBJECTIVES = [
  "Faire seul",
  "Se repérer dans le temps",
  "Rester calme",
  "Comprendre ce qui va arriver",
  "Se motiver",
  "Communiquer",
];

export const CONTEXTS = [
  "Le matin",
  "Le soir",
  "L'école",
  "Les repas",
  "La toilette",
  "Les devoirs",
  "Les sorties",
  "Les rendez-vous",
];

export const EMPTY_PERSONALISATION: Personalisation = {
  childId: null,
  ageBand: "",
  language: "",
  objective: "",
  context: "",
};

const KEY = "eclosia.studio.personalisation.v1";

/** On mémorise le dernier réglage : le parent ne redonne pas dix fois la même info. */
export function loadPersonalisation(): Personalisation {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PERSONALISATION;
    return { ...EMPTY_PERSONALISATION, ...(JSON.parse(raw) as Partial<Personalisation>) };
  } catch {
    return EMPTY_PERSONALISATION;
  }
}

export function savePersonalisation(p: Personalisation) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* noop */
  }
}

/** Résumé lisible, affiché sous le titre du support. */
export function describePersonalisation(p: Partial<Personalisation> | null | undefined): string {
  if (!p) return "";
  return [p.ageBand, p.language, p.objective, p.context].filter(Boolean).join(" · ");
}

/** Retour haptique très léger : une confirmation sentie, jamais bruyante. */
export function softHaptic(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* noop */
  }
}
