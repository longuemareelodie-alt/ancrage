import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GENTLE_BADGE_EVENT, type GentleBadge } from "@/lib/gentleBadges";
import { haptic } from "@/lib/feedback";

/**
 * Célébration discrète — jamais de confettis, jamais de bruit.
 *
 * Une carte qui apparaît en douceur, une micro-vibration, un petit mot,
 * puis elle s'efface d'elle-même.
 */
const GentleCelebration = () => {
  const [badge, setBadge] = useState<GentleBadge | null>(null);

  useEffect(() => {
    const onBadge = (e: Event) => {
      const detail = (e as CustomEvent<GentleBadge>).detail;
      if (!detail) return;
      setBadge(detail);
      haptic("success");
    };
    window.addEventListener(GENTLE_BADGE_EVENT, onBadge);
    return () => window.removeEventListener(GENTLE_BADGE_EVENT, onBadge);
  }, []);

  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(() => setBadge(null), 4600);
    return () => clearTimeout(timer);
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          key={badge.key}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          onClick={() => setBadge(null)}
          className="fixed inset-x-4 bottom-24 z-[60] mx-auto max-w-sm cursor-pointer rounded-2xl border border-primary/15 bg-card/95 p-4 shadow-soft-lg backdrop-blur-sm sm:bottom-8"
        >
          <div className="flex items-start gap-3">
            <motion.span
              aria-hidden
              className="text-2xl"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
            >
              {badge.emoji}
            </motion.span>
            <div className="min-w-0 space-y-0.5">
              <p className="font-serif text-sm font-semibold text-foreground">{badge.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{badge.word}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GentleCelebration;
