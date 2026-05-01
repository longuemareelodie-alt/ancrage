import { motion } from "framer-motion";
import { forwardRef, ReactNode, useMemo } from "react";
import { shouldDisableDecorativeMotion, prefersReducedMotion } from "@/lib/motionPrefs";

// Transitions de route — pensées pour le passage micro-scène → page d'état.
// L'exit est très court (≈80ms) pour éviter le "temps mort" perçu entre
// la sortie de l'ancienne page et l'entrée de la nouvelle ; l'entrée
// reste douce (≈260ms) pour garder une sensation fluide et incarnée.
//
// Sur appareils bas-de-gamme ou en `prefers-reduced-motion`, on bascule sur
// un cross-fade quasi-instantané sans translation : pas de promotion GPU
// inutile, pas de repaint plein écran, pas de clignotement perçu.
const standardVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.08, ease: "easeOut" } },
} as const;

const reducedVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12, ease: "linear" } },
  exit: { opacity: 0, transition: { duration: 0 } },
} as const;

/**
 * PageTransition wraps a route element with an enter/exit animation.
 *
 * It uses `forwardRef` so it can be used as a direct child of
 * `<AnimatePresence>`, which attaches a ref to its children to track
 * mount/unmount. Without `forwardRef`, React logs:
 *   "Function components cannot be given refs."
 */
const PageTransition = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => {
    // Évalué une fois au montage : les capacités hardware ne changent pas
    // pendant la durée de vie de la SPA, et la préférence OS est lue une fois.
    const variants = useMemo(
      () => (shouldDisableDecorativeMotion() ? reducedVariants : standardVariants),
      [],
    );

    // En reduced-motion strict, on n'anime pas du tout le translate : on garde
    // un fade très court pour éviter le "snap" brutal sans induire de saccade.
    const reduced = prefersReducedMotion();

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        // `will-change` indique au compositeur de promouvoir le layer pendant
        // la transition uniquement. On ne le laisse pas en permanence pour ne
        // pas garder de couche GPU inutile après l'anim.
        style={reduced ? undefined : { willChange: "opacity, transform" }}
        onAnimationComplete={(definition) => {
          // Retire le `will-change` une fois l'enter terminée pour libérer le
          // layer GPU (économise mémoire vidéo sur appareils mobiles).
          if (definition === "animate" && ref && typeof ref !== "function" && ref.current) {
            ref.current.style.willChange = "auto";
          }
        }}
      >
        {children}
      </motion.div>
    );
  },
);

PageTransition.displayName = "PageTransition";

export default PageTransition;
