import { useEffect } from "react";
import { writeWidgetSnapshot, isNative } from "@/lib/native";
import type { TodaySnapshot } from "@/hooks/useTodayFeed";

/** Phrases affichées par le widget quand il n'y a rien à porter aujourd'hui. */
const CALM_PHRASES = [
  "Rien d'urgent aujourd'hui. Tu peux souffler.",
  "Tout est à jour. Prends ce moment pour toi.",
  "Aucune échéance. C'est déjà beaucoup.",
];

/**
 * Recopie l'essentiel d'« Aujourd'hui » dans le stockage partagé, pour que le
 * widget iPhone et l'écran de verrouillage affichent la même chose que l'app,
 * sans jamais réveiller le parent avec une liste de choses à faire.
 */
export function useWidgetSync(feed: TodaySnapshot) {
  useEffect(() => {
    if (!isNative() || feed.loading) return;

    const first = feed.now[0];
    const phrase =
      CALM_PHRASES[new Date().getDate() % CALM_PHRASES.length];

    void writeWidgetSnapshot({
      greetingName: feed.firstName || null,
      todayEmotion: feed.checkedInToday ? feed.lastEmotion : null,
      nextPriority: first ? first.label : null,
      remainingCount: feed.now.length,
      calmPhrase: phrase,
    });
  }, [
    feed.loading,
    feed.firstName,
    feed.checkedInToday,
    feed.lastEmotion,
    feed.now,
  ]);
}
