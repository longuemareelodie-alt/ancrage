// Données et persistance du parcours "7 jours pour devenir la maman ancrée"
// Stocké en localStorage : aucun appel réseau, fonctionne hors-ligne.

export interface InitiationDay {
  day: number;
  emoji: string;
  title: string;
  intention: string; // 1 phrase — pourquoi cette journée
  action: string; // L'action UNIQUE de la journée
  duration: string; // "2 min", "5 min"…
  why: string; // Mini explication (2 lignes max)
  prompt: string; // Question d'ancrage à se poser le soir
}

export const INITIATION_DAYS: InitiationDay[] = [
  {
    day: 1,
    emoji: "🌬️",
    title: "Revenir dans ton corps",
    intention: "Avant de comprendre, on respire.",
    action: "3 respirations longues — inspire 4s, expire 6s.",
    duration: "2 min",
    why: "L'expiration plus longue active ton système calmant. C'est le tout premier signal envoyé à ton cerveau : « je suis en sécurité ».",
    prompt: "Qu'est-ce qui s'est relâché, même légèrement, dans ton corps ?",
  },
  {
    day: 2,
    emoji: "📍",
    title: "Nommer ce que tu ressens",
    intention: "Ce qui est nommé pèse moins lourd.",
    action: "Écris en 1 mot l'émotion qui dominait ta journée.",
    duration: "1 min",
    why: "Mettre un mot sur une émotion désamorce une partie de sa charge — c'est mesuré dans les études en neurosciences (affect labeling).",
    prompt: "Cette émotion essayait de te dire quoi ?",
  },
  {
    day: 3,
    emoji: "🛑",
    title: "Choisir un seul non",
    intention: "Te protéger, c'est aussi soustraire.",
    action: "Identifie une chose que tu vas refuser cette semaine (un message, une tâche, une attente).",
    duration: "3 min",
    why: "Un seul « non » bien placé libère plus d'énergie que dix « oui » épuisants.",
    prompt: "Qu'est-ce que ce « non » te rend disponible pour faire ?",
  },
  {
    day: 4,
    emoji: "💧",
    title: "Boire ton verre d'eau",
    intention: "Le soin commence par le minuscule.",
    action: "Bois un verre d'eau lentement, sans téléphone, en regardant un point fixe.",
    duration: "2 min",
    why: "Une micro-pause sensorielle suffit à interrompre le pilotage automatique.",
    prompt: "À quoi ressemble une seconde de présence pure ?",
  },
  {
    day: 5,
    emoji: "🤍",
    title: "Une phrase douce pour toi",
    intention: "La voix intérieure peut être une alliée.",
    action: "Écris une phrase que tu aurais aimé entendre aujourd'hui — adresse-la-toi.",
    duration: "3 min",
    why: "L'auto-compassion est un facteur protecteur reconnu contre l'épuisement maternel.",
    prompt: "Que change-t-elle, cette phrase, si tu la relis demain matin ?",
  },
  {
    day: 6,
    emoji: "🌙",
    title: "Fermer ta journée",
    intention: "On ne dort pas bien sur un cerveau ouvert.",
    action: "Note 1 chose réussie + 1 chose à laisser pour demain.",
    duration: "3 min",
    why: "Un rituel de clôture aide ton cerveau à passer du mode « en charge » au mode « repos ».",
    prompt: "Qu'est-ce que tu choisis de ne pas porter cette nuit ?",
  },
  {
    day: 7,
    emoji: "🌳",
    title: "Reconnaître l'ancrage",
    intention: "Tu as déjà commencé à changer.",
    action: "Relis tes 6 réponses. Souligne la phrase qui te ressemble le plus aujourd'hui.",
    duration: "5 min",
    why: "Voir la trace concrète d'une semaine d'attention à toi est ce qui transforme une intention en identité.",
    prompt: "Si cette femme-là devenait ton point de départ, que ferais-tu différemment demain ?",
  },
];

const STORAGE_KEY = "initiation7j:v1";

export interface InitiationState {
  startedAt: string | null; // ISO date
  completed: Record<number, { completedAt: string; note: string }>;
}

const empty = (): InitiationState => ({ startedAt: null, completed: {} });

export function loadState(): InitiationState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return {
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : null,
      completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {},
    };
  } catch {
    return empty();
  }
}

export function saveState(state: InitiationState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage pleine ou bloquée : on ignore silencieusement
  }
}

export function markDayComplete(day: number, note: string): InitiationState {
  const state = loadState();
  const next: InitiationState = {
    startedAt: state.startedAt ?? new Date().toISOString(),
    completed: {
      ...state.completed,
      [day]: { completedAt: new Date().toISOString(), note: note.slice(0, 500) },
    },
  };
  saveState(next);
  return next;
}

export function resetState(): InitiationState {
  const fresh = empty();
  saveState(fresh);
  return fresh;
}

export function completedCount(state: InitiationState): number {
  return Object.keys(state.completed).length;
}
