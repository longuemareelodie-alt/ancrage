import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { shouldDisableDecorativeMotion } from "@/lib/motionPrefs";

const SEEN_KEY = "eclosia_splash_seen";

/**
 * Première ouverture émotionnelle : un souffle, le nom, puis l'app.
 * Affichée une seule fois par appareil (et jamais en reduced-motion).
 */
const SplashScreen = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (shouldDisableDecorativeMotion()) return false;
    try {
      return localStorage.getItem(SEEN_KEY) !== "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) return;
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* noop */
    }
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      role="status"
      aria-label="Bienvenue sur Éclosia"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      onClick={() => setVisible(false)}
    >
      {/* Respiration : un cercle qui s'ouvre lentement, comme une inspiration. */}
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: [0.82, 1.04, 0.96], opacity: [0, 1, 1] }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.6, 1] }}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/15"
      >
        <span className="text-4xl" aria-hidden="true">
          🌸
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 font-serif text-3xl text-foreground"
      >
        Éclosia
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="mt-2 text-sm text-muted-foreground"
      >
        Respire. Tu es au bon endroit.
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
