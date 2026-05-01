import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

/**
 * RouteTransition — overlay plein écran pour combler le "temps mort"
 * entre un clic (ex: micro-scène) et l'apparition de la page d'état.
 *
 * Flow :
 * 1. clic → overlay fade-in (180ms)
 * 2. navigate() → React monte la nouvelle route
 * 3. au mount de la nouvelle route, overlay fade-out (220ms)
 *
 * Résultat : aucun flash blanc, transition continue.
 */

type Ctx = {
  navigateWithTransition: (to: string) => void;
};

const RouteTransitionContext = createContext<Ctx | null>(null);

export const useRouteTransition = () => {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    // Fallback no-op si le provider n'enveloppe pas l'arbre
    return {
      navigateWithTransition: (to: string) => {
        window.location.href = to;
      },
    };
  }
  return ctx;
};

export const RouteTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const navigateWithTransition = useCallback(
    (to: string) => {
      // Liens externes ou auth → redirection brute (déclenche un reload)
      if (to.startsWith("http") || to.startsWith("/auth")) {
        setActive(true);
        // petit délai pour laisser l'overlay apparaître avant la redirection
        window.setTimeout(() => {
          window.location.href = to;
        }, 180);
        return;
      }
      setActive(true);
      // navigue immédiatement ; l'overlay reste visible le temps du mount
      window.setTimeout(() => {
        navigate(to);
        // laisse la nouvelle page se peindre puis on retire l'overlay
        window.setTimeout(() => setActive(false), 220);
      }, 160);
    },
    [navigate],
  );

  // garde-fou : si l'overlay reste bloqué (>1.2s), on le force à off
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), 1200);
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <RouteTransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="route-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background"
            aria-hidden
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </RouteTransitionContext.Provider>
  );
};
