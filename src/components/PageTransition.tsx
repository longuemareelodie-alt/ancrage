import { motion } from "framer-motion";
import { forwardRef, ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
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
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  ),
);

PageTransition.displayName = "PageTransition";

export default PageTransition;
