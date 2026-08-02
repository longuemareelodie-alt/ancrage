import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Enveloppe mobile native d'Éclosia.
 *
 * Le web reste la source de vérité : l'app native charge la même interface.
 * Cette base est nécessaire pour ajouter ensuite les widgets iPhone et
 * l'écran de verrouillage (App Group + WidgetKit côté Xcode).
 */
const config: CapacitorConfig = {
  appId: "app.lovable.9158380429564a40a5e0d906c7eb1aa5",
  appName: "eclosiia",
  webDir: "dist",
  server: {
    url: "https://91583804-2956-4a40-a5e0-d906c7eb1aa5.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: {
    // Fond crème pour éviter tout flash blanc au lancement.
    backgroundColor: "#FDF8F3",
    contentInset: "always",
  },
  android: {
    backgroundColor: "#FDF8F3",
  },
};

export default config;
