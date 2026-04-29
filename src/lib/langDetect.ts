// Lightweight FR/EN language detector for short snippets.
//
// Goal: provide a fast, dependency-free hint so the sentence splitter can
// pick the right abbreviation set. Returns a confidence score in [0, 1]
// where ~0.5 means "uncertain" — callers should then treat both languages
// as plausible and pick a fallback strategy.

export type DetectedLang = "fr" | "en";

export interface DetectionResult {
  lang: DetectedLang;
  confidence: number; // 0..1
  scores: { fr: number; en: number };
}

// Common short stopwords. Kept intentionally small + high-signal.
const FR_STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "d", "au", "aux",
  "et", "ou", "mais", "donc", "or", "ni", "car",
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
  "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "votre", "leur",
  "ce", "cet", "cette", "ces",
  "que", "qui", "quoi", "dont", "où",
  "pas", "ne", "n", "plus", "très", "bien",
  "est", "sont", "était", "été", "avoir", "être", "fait", "faire",
  "avec", "sans", "pour", "par", "dans", "sur", "sous", "vers", "chez",
  "aussi", "alors", "comme", "même", "tout", "tous", "toute", "toutes",
  "oui", "non",
]);

const EN_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "so", "nor", "yet",
  "i", "you", "he", "she", "it", "we", "they",
  "my", "your", "his", "her", "its", "our", "their",
  "this", "that", "these", "those",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "have", "has", "had", "do", "does", "did",
  "with", "without", "for", "from", "by", "in", "on", "at", "to", "of",
  "as", "if", "than", "then", "also", "very", "just",
  "not", "no", "yes",
  "what", "which", "who", "whom", "when", "where", "why", "how",
]);

// Diacritics strongly associated with French (sample, not exhaustive).
const FR_DIACRITIC_RE = /[àâäçéèêëîïôöùûüÿœæ]/i;

// Bi-grams commonly seen in French only ("qu", "ll", "ou", "tion", "eux"…).
// Kept very small to avoid over-fitting; mostly disambiguates short snippets.
const FR_HINTS = ["c'", "qu'", "j'", "n'", "d'", "l'", "ç", " œ", " est ", " et ", " une "];
const EN_HINTS = [" the ", " of ", " and ", " is ", " to ", " in ", "'s ", "'re ", "'ve ", "n't"];

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-zà-ÿœæ' ]+/gi, " ")
    .split(/\s+/)
    .filter(Boolean);

export function detectLang(input: string): DetectionResult {
  if (!input || !input.trim()) {
    return { lang: "fr", confidence: 0, scores: { fr: 0, en: 0 } };
  }

  const lower = ` ${input.toLowerCase()} `;
  const tokens = tokenize(input);

  let fr = 0;
  let en = 0;

  // Stopword votes.
  for (const t of tokens) {
    if (FR_STOPWORDS.has(t)) fr += 2;
    if (EN_STOPWORDS.has(t)) en += 2;
  }

  // Hint substrings.
  for (const h of FR_HINTS) if (lower.includes(h)) fr += 1;
  for (const h of EN_HINTS) if (lower.includes(h)) en += 1;

  // Diacritics → strong FR signal (they basically don't appear in EN).
  if (FR_DIACRITIC_RE.test(input)) fr += 4;

  const total = fr + en;
  if (total === 0) {
    return { lang: "fr", confidence: 0, scores: { fr, en } };
  }
  const lang: DetectedLang = fr >= en ? "fr" : "en";
  // Confidence = how dominant the winner is, with a sample-size penalty
  // for very short inputs (few tokens → low confidence).
  const dominance = Math.abs(fr - en) / total; // 0..1
  const sampleBoost = Math.min(1, tokens.length / 12); // <12 tokens → penalised
  const confidence = Math.max(0, Math.min(1, dominance * sampleBoost));
  return { lang, confidence, scores: { fr, en } };
}

/**
 * Convenience: returns the detected language only when confidence ≥ threshold,
 * otherwise `null` so callers can apply a fallback strategy.
 */
export function detectLangOrUncertain(
  input: string,
  threshold = 0.25,
): DetectedLang | null {
  const res = detectLang(input);
  return res.confidence >= threshold ? res.lang : null;
}
