import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Le petit mot inattendu.
 *
 * Quelques mots, jamais plus. Une fois par jour au maximum, et seulement une
 * fois sur deux : la surprise disparaît si elle devient une habitude.
 */
const WHISPERS = [
  "Tu fais déjà énormément.",
  "Merci d'être revenue aujourd'hui.",
  "Une seule petite étape suffit.",
  "Tu n'as pas besoin d'être parfaite.",
  "Respire.",
  "Rien d'urgent ici.",
  "Tu as le droit de t'arrêter là.",
];

const KEY = "eclosia_whisper_day";

const SoftWhisper = () => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {
      /* noop */
    }
    if (seen === today) return;
    try {
      localStorage.setItem(KEY, today);
    } catch {
      /* noop */
    }
    // Une surprise ne se planifie pas : un jour sur deux environ.
    if (Math.random() < 0.5) return;
    const index = Number(today.replace(/-/g, "")) % WHISPERS.length;
    const timer = setTimeout(() => setText(WHISPERS[index]), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => setText(null), 6000);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <AnimatePresence>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => setText(null)}
          className="cursor-default rounded-2xl bg-primary/5 px-4 py-3 text-center font-serif text-sm text-primary/90"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default SoftWhisper;
