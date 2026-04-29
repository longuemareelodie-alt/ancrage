import { supabase } from "@/integrations/supabase/client";

export type ResolvedStyle = "breathing" | "sensory";

/**
 * Émotions où la respiration est prioritaire (système en hyper-activation,
 * besoin de faire redescendre via le souffle).
 */
const BREATHING_FIRST = new Set([
  "anxieuse",
  "oppressee",
  "panique",
  "hypervigilance",
  "explosion",
  "colere",
  "survie",
  "triste",
]);

/**
 * Émotions où l'ancrage sensoriel est prioritaire (dissociation, brouillard
 * mental, rumination — besoin de revenir dans le corps).
 */
const SENSORY_FIRST = new Set([
  "vide",
  "submergee",
  "perdue",
  "surmenage",
  "rumination",
  "epuisee",
]);

function fallbackByDate(): ResolvedStyle {
  const day = Math.floor(Date.now() / 86_400_000);
  return day % 2 === 0 ? "breathing" : "sensory";
}

export function resolveAutoStyle(emotionId: string | null | undefined): ResolvedStyle {
  if (emotionId && BREATHING_FIRST.has(emotionId)) return "breathing";
  if (emotionId && SENSORY_FIRST.has(emotionId)) return "sensory";
  return fallbackByDate();
}

/**
 * Récupère l'humeur du jour depuis le dernier check-in (cache local pour
 * éviter un appel réseau à chaque page émotion).
 */
const CACHE_KEY = "calm_today_emotion";

interface CachedEmotion {
  date: string; // YYYY-MM-DD
  emotionId: string | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayEmotion(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CachedEmotion;
      if (parsed.date === todayKey()) return parsed.emotionId;
    }
  } catch {
    /* ignore */
  }

  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("emotion_checkins")
      .select("emotion, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
    const emotionId = data?.[0]?.emotion ?? null;
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: todayKey(), emotionId } satisfies CachedEmotion),
    );
    return emotionId;
  } catch {
    return null;
  }
}

export async function resolveAutoStyleFromToday(): Promise<ResolvedStyle> {
  const emotion = await getTodayEmotion();
  return resolveAutoStyle(emotion);
}
