// Gestion des activités favorites (stockage local).
const KEY = "lies.activites.favorites.v1";

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("activities-favorites-changed"));
  } catch {
    /* noop */
  }
  return next;
}

export function subscribeFavorites(cb: (ids: string[]) => void): () => void {
  const handler = () => cb(getFavorites());
  window.addEventListener("activities-favorites-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("activities-favorites-changed", handler);
    window.removeEventListener("storage", handler);
  };
}
