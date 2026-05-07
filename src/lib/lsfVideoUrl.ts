// Helpers to build external LSF dictionary video URLs for any sign label.
// Elix is the primary source (vraies vidéos de signeurs sourds, gratuit).
// Sématos est proposé comme fallback alternatif.

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

/** Elix dictionary search — opens a page listing video results for the term. */
export function elixSearchUrl(label: string): string {
  const q = encodeURIComponent(normalize(label));
  return `https://dico.elix.com/search?q=${q}`;
}

/** Sématos dictionary search — alternative source. */
export function sematosSearchUrl(label: string): string {
  const q = encodeURIComponent(normalize(label));
  return `https://www.sematos.eu/lsf.html?q=${q}`;
}

/** Default external video link used by the UI. */
export const lsfVideoUrl = elixSearchUrl;
