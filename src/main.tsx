import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initPerfMetrics } from "./lib/perfMetrics";
import { shouldDisableDecorativeMotion } from "./lib/motionPrefs";
import { applyTheme, watchSystemTheme } from "./lib/theme";

initPerfMetrics();

// Thème appliqué AVANT le premier render pour éviter tout flash de couleur.
applyTheme();
watchSystemTheme();

// Désactive les animations décoratives (box-shadow en boucle, transitions
// hover longues) sur appareils bas-de-gamme ou en `prefers-reduced-motion`.
// Posé sur <html> avant le premier render pour éviter tout flash d'animation.
if (shouldDisableDecorativeMotion()) {
  document.documentElement.classList.add("no-deco-motion");
}

createRoot(document.getElementById("root")!).render(<App />);


