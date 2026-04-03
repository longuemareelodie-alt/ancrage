import { useState } from "react";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface Phase {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  useIf: string[];
  intro: string;
  steps: string[];
  closing: string;
}

const phases: Phase[] = [
  {
    id: 1,
    emoji: "🌿",
    title: "Calmer ton corps",
    subtitle: "quand tout est en alerte",
    useIf: ["tu es épuisée", "tu es confuse", "tu es en alerte"],
    intro: "Quand tout s'est effondré, tu voulais comprendre.\nMais ton corps est resté en survie.",
    steps: [
      "5 choses que tu vois",
      "4 que tu touches",
      "3 sons",
      "2 odeurs",
      "1 respiration",
    ],
    closing: "👉 Tu te stabilises.",
  },
  {
    id: 2,
    emoji: "🌿",
    title: "Comprendre ce que tu as vécu",
    subtitle: "",
    useIf: ["tu doutes", "tu culpabilises"],
    intro: "L'emprise est progressive.\n👉 Tu n'es pas faible.",
    steps: ["tu doutes", "tu t'excuses", "tu as peur"],
    closing: "👉 Un seul suffit.",
  },
  {
    id: 3,
    emoji: "🌿",
    title: "Reprendre du pouvoir",
    subtitle: "",
    useIf: ["tu veux avancer"],
    intro: "",
    steps: ["Note tes pensées", "Prends une décision simple"],
    closing: "👉 Chaque pas compte.",
  },
  {
    id: 4,
    emoji: "🌿",
    title: "Te reconstruire sans t'épuiser",
    subtitle: "",
    useIf: ["tu es fatiguée"],
    intro: "👉 1 à 3 minutes suffisent.\n\nLe soir :\n« Aujourd'hui j'ai réussi à… »",
    steps: [],
    closing: "👉 La confiance vient après.",
  },
];

const Parcours = () => {
  const [openPhase, setOpenPhase] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const progress = Math.round((completed.size / phases.length) * 100);

  const toggleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Comprendre et avancer</h1>
          <p className="mt-2 text-muted-foreground">Ton parcours, à ton rythme</p>

          {/* Progress bar */}
          <div className="mx-auto mt-5 max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
              <span>{completed.size} / {phases.length} phases</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/40">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4">
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              layout
              className="overflow-hidden rounded-xl bg-card shadow-sm"
            >
              <button
                onClick={() => setOpenPhase(openPhase === phase.id ? null : phase.id)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{phase.emoji}</span>
                  <div>
                    <span className="text-xs font-medium text-primary">Phase {phase.id}</span>
                    <p className="font-semibold">{phase.title}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openPhase === phase.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openPhase === phase.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 border-t border-border px-5 pb-5 pt-4">
                      {phase.subtitle && (
                        <p className="text-sm text-muted-foreground">{phase.subtitle}</p>
                      )}

                      {phase.useIf.length > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-medium text-primary">À utiliser si :</p>
                          <ul className="space-y-1">
                            {phase.useIf.map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {phase.intro && (
                        <p className="whitespace-pre-line text-sm">{phase.intro}</p>
                      )}

                      {phase.steps.length > 0 && (
                        <div className="space-y-2">
                          {phase.steps.map((step, i) => (
                            <div
                              key={step}
                              className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {i + 1}
                              </span>
                              {step}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-sm font-medium text-primary">{phase.closing}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <CTAButton to="/" variant="secondary">Revenir à l'accueil</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default Parcours;
