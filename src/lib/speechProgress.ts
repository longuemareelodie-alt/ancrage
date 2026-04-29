// Persists per-text audio playback progress so users can resume exactly where
// they left off (current sentence + elapsed seconds within the run).
//
// Storage is keyed by a stable hash of the full text. Entries older than
// `MAX_AGE_MS` are discarded on read to keep localStorage clean.

const STORAGE_KEY = "calm_speech_progress_v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_ENTRIES = 50;

export interface SpeechProgress {
  sentence: number;
  elapsed: number; // seconds within the current run
  total: number; // estimated total seconds (for UI)
  lang?: string;
  updatedAt: number;
}

type Store = Record<string, SpeechProgress>;

// Lightweight, deterministic 32-bit hash (FNV-1a) — sufficient for keying.
export const hashText = (text: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36) + "_" + text.length.toString(36);
};

const readStore = (): Store => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object") return {};
    const now = Date.now();
    let mutated = false;
    for (const k of Object.keys(parsed)) {
      const e = parsed[k];
      if (!e || typeof e.updatedAt !== "number" || now - e.updatedAt > MAX_AGE_MS) {
        delete parsed[k];
        mutated = true;
      }
    }
    if (mutated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        /* noop */
      }
    }
    return parsed;
  } catch {
    return {};
  }
};

const writeStore = (store: Store) => {
  if (typeof window === "undefined") return;
  try {
    // Cap entry count: keep newest by updatedAt.
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys
        .map((k) => [k, store[k].updatedAt] as const)
        .sort((a, b) => b[1] - a[1])
        .slice(0, MAX_ENTRIES);
      const trimmed: Store = {};
      for (const [k] of sorted) trimmed[k] = store[k];
      store = trimmed;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* noop */
  }
};

export const getProgress = (text: string): SpeechProgress | null => {
  const store = readStore();
  return store[hashText(text)] ?? null;
};

export const saveProgress = (text: string, progress: Omit<SpeechProgress, "updatedAt">) => {
  const store = readStore();
  store[hashText(text)] = { ...progress, updatedAt: Date.now() };
  writeStore(store);
};

export const clearProgress = (text: string) => {
  const store = readStore();
  const key = hashText(text);
  if (store[key]) {
    delete store[key];
    writeStore(store);
  }
};
