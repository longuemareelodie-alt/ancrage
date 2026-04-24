import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ContextualFAQ, { EmotionKey } from "@/components/ContextualFAQ";

type EmotionDef = { key: EmotionKey; emoji: string; path: string };

const negativeEmotions: EmotionDef[] = [
  { key: "panique", emoji: "😰", path: "/emotion/panique" },
  { key: "hypervigilance", emoji: "⚡", path: "/emotion/hypervigilance" },
  { key: "rumination", emoji: "💭", path: "/emotion/rumination" },
  { key: "explosion", emoji: "😡", path: "/emotion/explosion" },
  { key: "vide", emoji: "😶", path: "/emotion/vide" },
  { key: "epuisee", emoji: "🔋", path: "/emotion/epuisee" },
];

const positiveEmotions: EmotionDef[] = [
  { key: "calme", emoji: "🕊️", path: "/emotion/calme" },
  { key: "apaisee", emoji: "☁️", path: "/emotion/apaisee" },
  { key: "fiere", emoji: "✨", path: "/emotion/fiere" },
];

const Emotions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<{ path: string; key: EmotionKey } | null>(null);

  const handleSelect = (e: EmotionDef) => setSelected({ path: e.path, key: e.key });

  const handleContinue = () => {
    if (selected) {
      const target = selected.path;
      setSelected(null);
      navigate(target);
    }
  };

  const renderRow = (e: EmotionDef, i: number, delayBase = 0) => (
    <motion.button
      key={e.path}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delayBase + i * 0.06 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelect(e)}
      className={`flex w-full items-center gap-4 rounded-xl bg-card p-5 text-start shadow-sm transition-shadow hover:shadow-md ${delayBase ? "border border-primary/10" : ""}`}
    >
      <span className="text-2xl">{e.emoji}</span>
      <div>
        <span className="font-medium">{t(`emotions.list.${e.key}.label`)}</span>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t(`emotions.list.${e.key}.hook`)}
        </p>
      </div>
    </motion.button>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8 text-center"
      >
        <div>
          <h1 className="text-2xl font-bold">{t("emotions.title")}</h1>
          <p className="mt-2 text-primary font-medium">{t("emotions.subtitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("emotions.hint")}</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("emotions.section_negative")}
          </p>
          {negativeEmotions.map((e, i) => renderRow(e, i))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("emotions.section_positive")}
          </p>
          {positiveEmotions.map((e, i) => renderRow(e, i, 0.4))}
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
