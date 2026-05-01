import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * RouteTransition — overlay léger qui couvre le micro-creux entre un clic
 * (ex: micro-scène "Tu te reconnais ?") et l'apparition de la page d'état
 * (/calme, /post-flow…).
 *
 * Pourquoi : `AnimatePresence mode="wait"` + un éventuel loader de garde
 * (PaidRoute / ProtectedRoute) crée une fraction de seconde de "temps mort"
 * blanc. L'overlay (fade-in primary doux) maintient la continuité visuelle.
 *
 * Usage :
 *   const { navigateWithTransition } = useRouteTransition();
 *   onClick={() => navigateWithTransition("/calme")}
 */

type Ctx = {
  navigateWithTransition: (to: string) => void;
};

const RouteTransitionContext = createContext<Ctx | null>(null);

export const useRouteTransition = () => {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    return {
      navigateWithTransition: (to: string) => {
        if (to.startsWith("http")) window.location.href = to;
        else window.location.href = to;
      },
    };
  }
  return ctx;
};

export const RouteTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const navigateWithTransition = useCallback(
    (to: string) => {
      // Liens externes
      if (to.startsWith("http")) {
        window.location.href = to;
        return;
      }
      setActive(true);
      startedAtRef.current = performance.now();
      // navigate immédiat — l'overlay couvre la transition
      navigate(to);
    },
    [navigate],
  );

  // À chaque changement de route, on retire l'overlay après un délai minimal
  // garantissant que la nouvelle page a eu le temps de monter et de jouer
  // sa propre animation d'entrée.
  useEffect(() => {
    if (!active) return;
    const elapsed = startedAtRef.current ? performance.now() - startedAtRef.current : 0;
    // overlay visible au minimum 220ms, max ~500ms pour rester fluide
    const remaining = Math.max(220 - elapsed, 120);
    const id = window.setTimeout(() => setActive(false), remaining);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Garde-fou : jamais bloqué plus de 800ms
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setActive(false), 800);
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
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm"
            aria-hidden
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </RouteTransitionContext.Provider>
  );
};
