// Helpers to build external LSF dictionary video URLs for any sign label.
// Sématos est la source par défaut (stable, vraies vidéos de signeurs sourds).
// Elix (dico.elix-lsf.fr) est proposé en alternative.

const normalize = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[·•→]/g, " ")
    .replace(/\s*\([^)]*\)\s*/g, " ") // drop parenthetical hints
    .replace(/[/]/g, " ")
    .replace(/['']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Garde le premier mot significatif pour l'URL Elix (ex: "Mal / douleur" → "mal"). */
const firstWord = (label: string) => normalize(label).split(" ")[0] ?? "";

/** Sématos dictionary search — page de résultats vidéos. */
export function sematosSearchUrl(label: string): string {
  const q = encodeURIComponent(normalize(label));
  return `https://www.sematos.eu/lsf.html?q=${q}`;
}

/** Elix — Le Dico Elix LSF (dico.elix-lsf.fr/dictionnaire/<mot>). */
export function elixSearchUrl(label: string): string {
  const word = firstWord(label);
  if (!word) return "https://dico.elix-lsf.fr/";
  return `https://dico.elix-lsf.fr/dictionnaire/${encodeURIComponent(word)}`;
}

/** Lien vidéo principal utilisé dans l'UI (Sématos, le plus fiable). */
export const lsfVideoUrl = sematosSearchUrl;
