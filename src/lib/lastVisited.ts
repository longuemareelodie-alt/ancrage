// Persists the last visited emotion card and the user's reading position
// (scroll offset) so we can offer to resume from where they left off.

const STORAGE_KEY = "calm_last_visited_v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export interface LastVisited {
  emotion: string;
  /** Localised title cached at save time, used for the resume banner. */
  title?: string;
  /** Vertical scroll offset in px when the user left the page. */
  scrollY: number;
  /** Unix ms timestamp of the last update. */
  updatedAt: number;
}

export function readLastVisited(): LastVisited | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastVisited;
    if (!parsed.emotion) return null;
    if (Date.now() - (parsed.updatedAt ?? 0) > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeLastVisited(data: Omit<LastVisited, "updatedAt">) {
  if (typeof window === "undefined") return;
  try {
    const payload: LastVisited = { ...data, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearLastVisited() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
