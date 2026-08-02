/**
 * Badges émotionnels — privés, jamais compétitifs.
 *
 * Ils ne sont montrés qu'à la personne concernée, ne se comparent à rien et
 * ne se perdent jamais. Ils marquent un moment, pas une performance.
 */

export interface GentleBadge {
  key: string;
  emoji: string;
  label: string;
  /** Un petit mot, écrit comme par une personne. */
  word: string;
}

export const GENTLE_BADGES: GentleBadge[] = [
  {
    key: "first_breath",
    emoji: "🌸",
    label: "Première respiration",
    word: "Tu viens de prendre un instant pour toi. C'est déjà énorme.",
  },
  {
    key: "first_journal",
    emoji: "📖",
    label: "Premier journal",
    word: "Chaque histoire commence quelque part. La tienne aussi.",
  },
  {
    key: "first_emotion",
    emoji: "💛",
    label: "Première émotion posée",
    word: "Mettre un mot dessus, c'est déjà l'alléger un peu.",
  },
  {
    key: "week_emotions",
    emoji: "❤️",
    label: "Une semaine d'émotions",
    word: "Sept jours à t'écouter. Merci d'être revenue.",
  },
  {
    key: "first_routine",
    emoji: "✨",
    label: "Première routine",
    word: "Les petites habitudes créent les grands progrès.",
  },
  {
    key: "ten_routines",
    emoji: "🌱",
    label: "Dix routines créées",
    word: "Tu construis quelque chose de solide, sans bruit.",
  },
  {
    key: "first_child",
    emoji: "👨‍👩‍👧",
    label: "Premier enfant ajouté",
    word: "Son univers a maintenant une place ici.",
  },
  {
    key: "first_pdf",
    emoji: "🖨️",
    label: "Premier support imprimé",
    word: "Un outil de moins à inventer. Tu peux souffler.",
  },
  {
    key: "first_appointment",
    emoji: "📅",
    label: "Premier rendez-vous noté",
    word: "C'est posé. Tu n'as plus besoin d'y penser.",
  },
  {
    key: "first_goal",
    emoji: "🎯",
    label: "Premier objectif atteint",
    word: "Regarde le chemin parcouru, pas ce qui reste.",
  },
];

const STORAGE_KEY = "eclosia_gentle_badges";
export const GENTLE_BADGE_EVENT = "eclosia:gentle-badge";

export function getUnlockedKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

export function isUnlocked(key: string): boolean {
  return getUnlockedKeys().includes(key);
}

export function getBadge(key: string): GentleBadge | undefined {
  return GENTLE_BADGES.find((b) => b.key === key);
}

/**
 * Débloque un badge la première fois seulement, et déclenche la célébration
 * discrète. Ne fait rien si le badge est déjà acquis (jamais de répétition).
 */
export function celebrate(key: string): void {
  const badge = getBadge(key);
  if (!badge) return;
  const unlocked = getUnlockedKeys();
  if (unlocked.includes(key)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked, key]));
  } catch {
    /* stockage indisponible : on célèbre quand même */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<GentleBadge>(GENTLE_BADGE_EVENT, { detail: badge }));
  }
}
