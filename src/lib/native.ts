import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

/**
 * Pont entre l'app web et l'enveloppe native.
 *
 * Règle : l'app doit fonctionner exactement pareil dans un navigateur.
 * Tout appel natif est donc optionnel et ne lève jamais d'erreur bloquante.
 */

/** App Group iOS partagé entre l'app et les widgets (à créer dans Xcode). */
export const IOS_APP_GROUP = "group.app.lovable.eclosia";

export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === "ios";

/** Données minimales lues par les widgets iPhone et l'écran de verrouillage. */
export interface WidgetSnapshot {
  /** Prénom ou façon d'être appelée, pour la salutation du widget. */
  greetingName: string | null;
  /** Émotion déposée aujourd'hui, ou null si rien encore. */
  todayEmotion: string | null;
  /** Priorité la plus douce à afficher (une seule phrase courte). */
  nextPriority: string | null;
  /** Nombre de priorités restantes aujourd'hui. */
  remainingCount: number;
  /** Phrase rassurante affichée quand tout est calme. */
  calmPhrase: string;
  /** Horodatage ISO de la dernière écriture. */
  updatedAt: string;
}

const SNAPSHOT_KEY = "eclosia_widget_snapshot";

/**
 * Écrit l'instantané dans le stockage partagé.
 * Sur iOS, avec l'App Group configuré, les widgets WidgetKit lisent la même
 * clé via `UserDefaults(suiteName: IOS_APP_GROUP)`.
 */
export async function writeWidgetSnapshot(
  snapshot: Omit<WidgetSnapshot, "updatedAt">,
): Promise<void> {
  const payload: WidgetSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
  try {
    await Preferences.set({
      key: SNAPSHOT_KEY,
      value: JSON.stringify(payload),
    });
  } catch {
    // Le web n'a pas de widgets : on ignore silencieusement.
  }
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  try {
    const { value } = await Preferences.get({ key: SNAPSHOT_KEY });
    return value ? (JSON.parse(value) as WidgetSnapshot) : null;
  } catch {
    return null;
  }
}

/**
 * Réglages natifs d'ambiance : barre de statut assortie au thème et
 * disparition douce du splash screen.
 */
export async function initNativeShell(): Promise<void> {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const dark = document.documentElement.classList.contains("dark");
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: dark ? "#141A2B" : "#FDF8F3" });
    }
  } catch {
    // Plugin absent ou non supporté : sans conséquence.
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch {
    // Idem.
  }
}
