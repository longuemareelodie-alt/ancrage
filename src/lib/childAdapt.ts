/**
 * Adaptation à l'enfant : l'âge oriente, le profil de communication décide.
 * Ces réglages servent uniquement à présenter l'interface, jamais à évaluer.
 */
export type AgeBand = "petit" | "enfant" | "ado";

export type ChildComm = {
  id: string;
  first_name: string;
  nickname?: string | null;
  birth_date?: string | null;
  communication_modes?: string[] | null;
  question_prefs?: string[] | null;
  answer_prefs?: string[] | null;
  picto_mode?: string | null;
  picto_show_text?: boolean | null;
  max_choices?: number | null;
};

export const COMMUNICATION_MODES = [
  { id: "parle-facilement", emoji: "🗣️", label: "Je parle facilement" },
  { id: "parle-ressenti-difficile", emoji: "💬", label: "Je parle mais j'ai parfois du mal à expliquer ce que je ressens" },
  { id: "phrases-courtes", emoji: "🧩", label: "Je parle surtout avec des phrases courtes" },
  { id: "pictogrammes", emoji: "🖼️", label: "J'utilise des pictogrammes / images" },
  { id: "photos", emoji: "📸", label: "Je comprends mieux avec des photos" },
  { id: "gestes", emoji: "✋", label: "J'utilise des gestes / signes" },
  { id: "outil", emoji: "📱", label: "J'utilise un outil de communication" },
  { id: "peu-de-mots", emoji: "🤐", label: "Je communique peu avec les mots" },
  { id: "parent-precise", emoji: "❓", label: "Mon parent préfère préciser" },
];

export const QUESTION_PREFS = [
  { id: "tres-courtes", label: "Questions très courtes" },
  { id: "une-a-la-fois", label: "Une question à la fois" },
  { id: "pictogrammes", label: "Avec pictogrammes" },
  { id: "photos", label: "Avec photos" },
  { id: "exemples", label: "Avec exemples concrets" },
  { id: "choix", label: "Avec choix de réponses" },
  { id: "oui-non", label: "Avec réponses Oui / Non" },
  { id: "audio", label: "Avec lecture audio" },
  { id: "repetition", label: "Avec répétition possible" },
  { id: "temps", label: "Avec temps de réponse suffisant" },
];

export const ANSWER_PREFS = [
  { id: "texte", emoji: "📝", label: "Texte" },
  { id: "pictogrammes", emoji: "🖼️", label: "Pictogrammes" },
  { id: "photos", emoji: "📸", label: "Photos" },
  { id: "voix", emoji: "🎙️", label: "Voix" },
  { id: "gestes", emoji: "✋", label: "Gestes / signes" },
  { id: "oui-non", emoji: "👍", label: "Oui / Non" },
  { id: "choix", emoji: "🔘", label: "Choix multiples" },
];

export const PICTO_MODES = [
  { id: "jamais", label: "Jamais" },
  { id: "parfois", label: "Parfois" },
  { id: "souvent", label: "Souvent" },
  { id: "toujours", label: "Toujours" },
];

/** Âge calculé à partir de la date de naissance — jamais saisi à la main. */
export function ageOf(birth?: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth + "T12:00:00");
  if (Number.isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}

export const ageLabel = (birth?: string | null) => {
  const a = ageOf(birth);
  return a === null ? null : `${a} an${a > 1 ? "s" : ""}`;
};

export function ageBand(birth?: string | null): AgeBand {
  const a = ageOf(birth);
  if (a === null) return "enfant";
  if (a < 7) return "petit";
  if (a < 12) return "enfant";
  return "ado";
}

export type Presentation = {
  band: AgeBand;
  visual: boolean;
  showText: boolean;
  maxChoices: number;
  short: boolean;
  big: boolean;
  audio: boolean;
};

/** Même âge ≠ même interface : le profil de communication prime. */
export function presentationFor(c: ChildComm | null): Presentation {
  const band = ageBand(c?.birth_date);
  const modes = c?.communication_modes ?? [];
  const q = c?.question_prefs ?? [];
  const pm = c?.picto_mode ?? "parfois";
  const needsVisual =
    modes.some((m) => ["pictogrammes", "photos", "gestes", "outil", "peu-de-mots", "phrases-courtes"].includes(m)) ||
    q.includes("pictogrammes");
  const visual = pm === "toujours" || pm === "souvent" || (pm === "parfois" && (needsVisual || band === "petit"));
  const short = q.includes("tres-courtes") || modes.includes("phrases-courtes") || modes.includes("peu-de-mots") || band === "petit";
  const byAge = band === "petit" ? 3 : band === "enfant" ? 4 : 6;
  const maxChoices = Math.max(2, Math.min(8, c?.max_choices ?? (short ? Math.min(byAge, 4) : byAge)));
  return {
    band,
    visual: pm === "jamais" ? false : visual,
    showText: c?.picto_show_text ?? true,
    maxChoices,
    short,
    big: visual || band === "petit",
    audio: q.includes("audio") || modes.includes("peu-de-mots") || band === "petit",
  };
}
