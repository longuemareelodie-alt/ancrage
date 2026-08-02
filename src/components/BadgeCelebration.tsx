import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { haptic } from "@/lib/feedback";
import type { BadgeDef } from "@/lib/streaks";

interface Props {
  badges: BadgeDef[];
  onDone: () => void;
}

/**
 * Célébration d'étape — douce et silencieuse.
 * Jamais de confettis, jamais d'effet bruyant : une animation, une vibration
 * discrète, un petit mot.
 */
const BadgeCelebration = ({ badges, onDone }: Props) => {
  useEffect(() => {
    if (badges.length === 0) return;
    haptic("success");
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [badges, onDone]);

  if (badges.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onDone}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="mx-4 max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl"
          >
            💜
          </motion.p>
          <p className="text-lg font-bold">Tu sors du mode survie</p>
          <p className="text-sm text-muted-foreground">Un ancrage de plus — tu es en sécurité</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.key}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 + i * 0.15 }}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 p-4"
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-sm font-semibold">{badge.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight max-w-[180px]">{badge.description}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={onDone}
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Ancrer ce calme 💛
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeCelebration;
