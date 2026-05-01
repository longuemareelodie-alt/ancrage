import { motion } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// Transitions de route — pensées pour le passage micro-scène → page d'état.
// L'exit est très court (≈80ms) pour éviter le "temps mort" perçu entre
// la sortie de l'ancienne page et l'entrée de la nouvelle ; l'entrée
// reste douce (≈260ms) pour garder une sensation fluide et incarnée.
const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.08, ease: "easeOut" } },
};

/**
 * PageTransition wraps a route element with an enter/exit animation.
 *
 * It uses `forwardRef` so it can be used as a direct child of
 * `<AnimatePresence>`, which attaches a ref to its children to track
 * mount/unmount. Without `forwardRef`, React logs:
 *   "Function components cannot be given refs."
 */
const PageTransition = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <motion.div
      ref={ref}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  ),
);

PageTransition.displayName = "PageTransition";

export default PageTransition;
