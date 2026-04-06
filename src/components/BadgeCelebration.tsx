import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import type { BadgeDef } from "@/lib/streaks";

interface Props {
  badges: BadgeDef[];
  onDone: () => void;
}

const BadgeCelebration = ({ badges, onDone }: Props) => {
  useEffect(() => {
    if (badges.length === 0) return;
    const fire = (opts: confetti.Options) =>
      confetti({ ...opts, disableForReducedMotion: true });
    fire({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.5 } });
    setTimeout(() => fire({ particleCount: 40, spread: 60, origin: { x: 0.3, y: 0.6 } }), 300);

    const timer = setTimeout(onDone, 4000);
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
            🎉
          </motion.p>
          <p className="text-lg font-bold">Nouveau badge débloqué !</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.key}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3 + i * 0.15 }}
                className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 p-3"
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-xs font-semibold">{badge.label}</span>
                <span className="text-[10px] text-muted-foreground">{badge.description}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={onDone}
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Continuer
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BadgeCelebration;
