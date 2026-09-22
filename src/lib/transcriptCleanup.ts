/**
 * Nettoyage douce du texte dicté.
 * On enlève les hésitations, les mots répétés et on comprend les corrections
 * dites à voix haute (« non, plutôt… », « efface », « pardon »).
 * Aucune donnée n'est inventée : on ne fait que retirer ou couper.
 */

const FILLERS = new Set([
  "euh",
  "euhh",
  "heu",
  "hum",
  "hmm",
  "ben",
  "bah",
  "bon",
  "voilà",
  "genre",
  "quoi",
  "donc",
  "alors",
]);

/** Expressions qui annulent tout ce qui précède. */
const RESTART = /\b(?:efface tout|recommence|annule tout|oublie tout|reprends? du début)\b/i;

/** Expressions qui annulent seulement la fin de la phrase. */
const CORRECTION =
  /\b(?:non(?:,)? (?:plutôt|pardon|en fait|attends)|pardon(?:,)? (?:plutôt|non)?|enfin non|je veux dire|plutôt)\b/i;

/** Ponctuation dictée à voix haute. */
const SPOKEN_PUNCT: [RegExp, string][] = [
  [/\bvirgule\b/gi, ","],
  [/\bpoint d'interrogation\b/gi, "?"],
  [/\bpoint d'exclamation\b/gi, "!"],
  [/\bpoint\b/gi, "."],
];

const collapse = (text: string) =>
  text
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

export function cleanTranscript(raw: string, options?: { punctuation?: boolean }): string {
  let text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "";

  // « Efface tout » → on ne garde que ce qui vient après.
  const restart = text.split(RESTART);
  if (restart.length > 1) text = restart[restart.length - 1].trim();

  // « Non, plutôt … » → on ne garde que la correction.
  const corrected = text.split(CORRECTION);
  if (corrected.length > 1) {
    const tail = corrected[corrected.length - 1].trim();
    if (tail) text = tail;
  }

  if (options?.punctuation !== false)
    for (const [pattern, mark] of SPOKEN_PUNCT) text = text.replace(pattern, mark);

  const words = text.split(" ").filter(Boolean);
  const kept: string[] = [];
  for (const word of words) {
    const bare = word.toLowerCase().replace(/[^a-zàâäéèêëîïôöùûüç']/g, "");
    if (bare && FILLERS.has(bare)) continue;
    const previous = kept[kept.length - 1]?.toLowerCase();
    // mot bégayé deux fois de suite (« appeler appeler le médecin »)
    if (previous && previous === word.toLowerCase()) continue;
    kept.push(word);
  }

  let out = collapse(kept.join(" "));
  if (!out) return "";
  out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

/** Découpe en mots pour pouvoir en retirer un d'un simple appui. */
export const toWords = (text: string) => text.split(/\s+/).filter(Boolean);

/** Retire le mot à cet index et recompose une phrase propre. */
export function removeWordAt(text: string, index: number): string {
  const words = toWords(text);
  words.splice(index, 1);
  const out = collapse(words.join(" "));
  return out ? out.charAt(0).toUpperCase() + out.slice(1) : "";
}
