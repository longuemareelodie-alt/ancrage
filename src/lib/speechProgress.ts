// Persists per-text audio playback progress so users can resume exactly where
// they left off (current sentence + elapsed seconds within the run).
//
// Two storage layers:
//   - localStorage: always-available cache (works offline, anonymous users).
//   - Supabase `speech_progress` table: cross-device sync for signed-in users.
//
// Strategy:
//   - Reads return the freshest of (local, cloud) by `updatedAt`.
//   - Writes go to localStorage immediately + best-effort to cloud (debounced).
//   - On auth state changes, we hydrate from the cloud and merge into local.
//
// Storage is keyed by a stable hash of the full text. Entries older than
// `MAX_AGE_MS` are discarded on read to keep localStorage clean.

import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "calm_speech_progress_v1";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const MAX_ENTRIES = 50;
const CLOUD_DEBOUNCE_MS = 1500;

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

// ---------- Cloud sync helpers ----------

let cachedUserId: string | null | undefined = undefined;

const getUserId = async (): Promise<string | null> => {
  if (cachedUserId !== undefined) return cachedUserId;
  try {
    const { data } = await supabase.auth.getSession();
    cachedUserId = data.session?.user?.id ?? null;
  } catch {
    cachedUserId = null;
  }
  return cachedUserId;
};

const pendingCloudWrites = new Map<string, ReturnType<typeof setTimeout>>();

const scheduleCloudUpsert = (textKey: string, progress: SpeechProgress) => {
  if (typeof window === "undefined") return;
  const existing = pendingCloudWrites.get(textKey);
  if (existing) clearTimeout(existing);
  const t = setTimeout(async () => {
    pendingCloudWrites.delete(textKey);
    const userId = await getUserId();
    if (!userId) return;
    try {
      await supabase
        .from("speech_progress")
        .upsert(
          {
            user_id: userId,
            text_key: textKey,
            sentence: progress.sentence,
            elapsed: progress.elapsed,
            total: progress.total,
            lang: progress.lang ?? null,
            updated_at: new Date(progress.updatedAt).toISOString(),
          },
          { onConflict: "user_id,text_key" },
        );
    } catch {
      /* offline / RLS / etc. — local storage remains source of truth */
    }
  }, CLOUD_DEBOUNCE_MS);
  pendingCloudWrites.set(textKey, t);
};

const flushAllPendingWrites = () => {
  for (const [key, timer] of pendingCloudWrites) {
    clearTimeout(timer);
    const store = readStore();
    const entry = store[key];
    if (entry) {
      // Re-schedule with zero delay by triggering immediately via fetch.
      const userId = cachedUserId;
      if (userId) {
        // Best-effort fire-and-forget.
        void supabase
          .from("speech_progress")
          .upsert(
            {
              user_id: userId,
              text_key: key,
              sentence: entry.sentence,
              elapsed: entry.elapsed,
              total: entry.total,
              lang: entry.lang ?? null,
              updated_at: new Date(entry.updatedAt).toISOString(),
            },
            { onConflict: "user_id,text_key" },
          );
      }
    }
  }
  pendingCloudWrites.clear();
};

// ---------- Public API ----------

export const getProgress = (text: string): SpeechProgress | null => {
  const store = readStore();
  return store[hashText(text)] ?? null;
};

export const saveProgress = (text: string, progress: Omit<SpeechProgress, "updatedAt">) => {
  const store = readStore();
  const key = hashText(text);
  const entry: SpeechProgress = { ...progress, updatedAt: Date.now() };
  store[key] = entry;
  writeStore(store);
  scheduleCloudUpsert(key, entry);
};

export const clearProgress = (text: string) => {
  const store = readStore();
  const key = hashText(text);
  if (store[key]) {
    delete store[key];
    writeStore(store);
  }
  // Best-effort: also remove from cloud.
  void (async () => {
    const userId = await getUserId();
    if (!userId) return;
    try {
      await supabase
        .from("speech_progress")
        .delete()
        .eq("user_id", userId)
        .eq("text_key", key);
    } catch {
      /* noop */
    }
  })();
};

/**
 * Fetch all cloud entries for the signed-in user and merge with local using
 * last-write-wins on `updatedAt`. Newer cloud entries override local; newer
 * local entries are pushed back to the cloud so all devices converge.
 */
export const hydrateFromCloud = async (): Promise<void> => {
  const userId = await getUserId();
  if (!userId) return;
  let rows: Array<{
    text_key: string;
    sentence: number;
    elapsed: number;
    total: number;
    lang: string | null;
    updated_at: string;
  }> = [];
  try {
    const { data, error } = await supabase
      .from("speech_progress")
      .select("text_key, sentence, elapsed, total, lang, updated_at")
      .eq("user_id", userId);
    if (error) return;
    rows = data ?? [];
  } catch {
    return;
  }

  const local = readStore();
  const toPush: Array<{ key: string; entry: SpeechProgress }> = [];

  // Cloud → local: take newer cloud entries.
  for (const r of rows) {
    const cloudUpdated = new Date(r.updated_at).getTime();
    const cur = local[r.text_key];
    if (!cur || cur.updatedAt < cloudUpdated) {
      local[r.text_key] = {
        sentence: r.sentence,
        elapsed: r.elapsed,
        total: r.total,
        lang: r.lang ?? undefined,
        updatedAt: cloudUpdated,
      };
    }
  }

  // Local → cloud: push entries that are newer than (or absent from) cloud.
  const cloudByKey = new Map(rows.map((r) => [r.text_key, new Date(r.updated_at).getTime()]));
  for (const key of Object.keys(local)) {
    const cloudTs = cloudByKey.get(key) ?? 0;
    if (local[key].updatedAt > cloudTs) {
      toPush.push({ key, entry: local[key] });
    }
  }

  writeStore(local);

  if (toPush.length > 0) {
    try {
      await supabase.from("speech_progress").upsert(
        toPush.map(({ key, entry }) => ({
          user_id: userId,
          text_key: key,
          sentence: entry.sentence,
          elapsed: entry.elapsed,
          total: entry.total,
          lang: entry.lang ?? null,
          updated_at: new Date(entry.updatedAt).toISOString(),
        })),
        { onConflict: "user_id,text_key" },
      );
    } catch {
      /* noop */
    }
  }

  // Notify any mounted UI so the "Reprendre" button refreshes.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("calm-speech-progress-hydrated"));
  }
};

// Wire up auth-state-driven hydration so devices stay in sync.
if (typeof window !== "undefined") {
  // Initial hydrate (deferred so it doesn't block first paint).
  setTimeout(() => {
    void hydrateFromCloud();
  }, 800);

  supabase.auth.onAuthStateChange((_event, session) => {
    const newUserId = session?.user?.id ?? null;
    if (newUserId !== cachedUserId) {
      cachedUserId = newUserId;
      if (newUserId) void hydrateFromCloud();
    }
  });

  // Flush any pending debounced writes when the page is hidden / unloaded so
  // we don't lose the very last position.
  const onHide = () => flushAllPendingWrites();
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("beforeunload", onHide);
}
