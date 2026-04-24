import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ContextualFAQ, { EmotionKey } from "@/components/ContextualFAQ";

const emotions = [
  { emoji: "😰", label: "Je panique", path: "/emotion/panique", hook: "Ton corps essaie de te protéger" },
  { emoji: "⚡", label: "Hypervigilance", path: "/emotion/hypervigilance", hook: "Ton système est resté en alerte" },
  { emoji: "💭", label: "Rumination", path: "/emotion/rumination", hook: "Ton cerveau cherche une sortie" },
  { emoji: "😡", label: "Explosion", path: "/emotion/explosion", hook: "La pression est trop forte" },
  { emoji: "😶", label: "Vide", path: "/emotion/vide", hook: "Ton système s'est coupé pour tenir" },
  { emoji: "🔋", label: "Épuisée", path: "/emotion/epuisee", hook: "Tu as trop donné" },
];

const positiveEmotions = [
  { emoji: "🕊️", label: "Plus calme", path: "/emotion/calme", hook: "Tu peux profiter de ce moment" },
  { emoji: "☁️", label: "Apaisée", path: "/emotion/apaisee", hook: "Garde-le en toi" },
  { emoji: "✨", label: "Fière de moi", path: "/emotion/fiere", hook: "Tu mérites de le ressentir" },
];

const KNOWN_EMOTIONS: EmotionKey[] = [
  "panique", "hypervigilance", "rumination", "explosion", "vide", "epuisee",
  "calme", "apaisee", "fiere",
];

const extractEmotionKey = (path: string): EmotionKey => {
  const slug = path.split("/").pop() ?? "";
  return (KNOWN_EMOTIONS as string[]).includes(slug) ? (slug as EmotionKey) : "default";
};

const Emotions = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<{ path: string; key: EmotionKey } | null>(null);

  const handleSelect = (path: string) => {
    setSelected({ path, key: extractEmotionKey(path) });
  };

  const handleContinue = () => {
    if (selected) {
      const target = selected.path;
      setSelected(null);
      navigate(target);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8 text-center"
      >
        <div>
          <h1 className="text-2xl font-bold">Comment tu te sens là maintenant ?</h1>
          <p className="mt-2 text-primary font-medium">Ton corps peut redescendre maintenant</p>
          <p className="mt-1 text-muted-foreground">Choisis sans réfléchir</p>
        </div>

        {/* Negative emotions */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce qui monte en toi</p>
          {emotions.map((emotion, i) => (
            <motion.button
              key={emotion.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(emotion.path)}
              className="flex w-full items-center gap-4 rounded-xl bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <div>
                <span className="font-medium">{emotion.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{emotion.hook}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Positive emotions */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce qui va mieux</p>
          {positiveEmotions.map((emotion, i) => (
            <motion.button
              key={emotion.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(emotion.path)}
              className="flex w-full items-center gap-4 rounded-xl bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md border border-primary/10"
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <div>
                <span className="font-medium">{emotion.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{emotion.hook}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selected && (
          <ContextualFAQ
            emotion={selected.key}
            onContinue={handleContinue}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Emotions;
