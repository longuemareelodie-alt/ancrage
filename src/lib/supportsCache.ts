import { SupportItem } from "@/data/supportTemplates";

// Cache local des supports : une salle d'attente sans réseau ne doit jamais
// empêcher un parent de sortir la routine du coucher.
const KEY = "eclosia.studio.supports.cache.v1";

export type CachedSupport = {
  id: string;
  title: string;
  support_type: string;
  profile_id: string | null;
  is_favorite: boolean;
  archived: boolean;
  updated_at: string;
  use_count?: number;
  content?: { items?: SupportItem[] } | null;
};

export function cacheSupports(list: CachedSupport[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* noop */
  }
}

export function readCachedSupports(): CachedSupport[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as CachedSupport[]) : [];
  } catch {
    return [];
  }
}

export function readCachedSupport(id: string): CachedSupport | null {
  return readCachedSupports().find((s) => s.id === id) ?? null;
}

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
