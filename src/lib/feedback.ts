/**
 * Retours doux — vibration discrète + message rassurant.
 *
 * Règle Éclosia : chaque action importante reçoit une réponse, jamais une
 * popup agressive. Un toast discret + une micro-vibration suffisent.
 */
import { toast } from "sonner";
import { prefersReducedMotion } from "@/lib/motionPrefs";

type HapticKind = "light" | "success" | "warning";

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 8,
  success: [10, 40, 14],
  warning: [14, 60, 14],
};

/** Vibration très courte (ignorée si l'appareil ou la préférence ne le permet pas). */
export function haptic(kind: HapticKind = "light"): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (prefersReducedMotion()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {
    /* noop */
  }
}

/** Confirmation douce : « Support enregistré 🌸 ». */
export function confirmSoft(message: string, description?: string): void {
  haptic("success");
  toast.success(message, description ? { description } : undefined);
}

/** Information neutre, sans dramatiser. */
export function infoSoft(message: string, description?: string): void {
  haptic("light");
  toast(message, description ? { description } : undefined);
}

/** Contretemps — formulé sans culpabiliser, avec une porte de sortie. */
export function gentleError(
  message = "Ça n'a pas fonctionné",
  description = "Tu peux réessayer quand tu veux.",
): void {
  haptic("warning");
  toast.error(message, { description });
}
