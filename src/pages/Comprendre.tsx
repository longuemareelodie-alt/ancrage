import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import SectionBlock from "@/components/SectionBlock";
import logo from "@/assets/logo-ancrage.png";

const energyOptions = [
  { emoji: "🔋", label: "Très basse" },
  { emoji: "🪫", label: "Basse" },
  { emoji: "⚡", label: "Moyenne" },
  { emoji: "💪", label: "Haute" },
];

const emotionOptions = [
  { emoji: "😰", label: "Peur / Panique" },
  { emoji: "😡", label: "Colère" },
  { emoji: "😢", label: "Tristesse" },
  { emoji: "😶", label: "Vide / Déconnexion" },
  { emoji: "💭", label: "Confusion" },
  { emoji: "😔", label: "Culpabilité" },
];

const contextOptions = [
  { emoji: "🏠", label: "Seule" },
  { emoji: "👥", label: "Avec d'autres" },
  { emoji: "💼", label: "Au travail" },
  { emoji: "🛏️", label: "Chez moi" },
];

const Comprendre = () => {
  const [step, setStep] = useState<"checkin" | "done">("checkin");
  const [energy, setEnergy] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);

  const canSubmit = energy && emotion && context;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={logo} alt="Eclosia" className="h-8 w-auto" />
        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {step === "checkin" ? (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SectionBlock>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Comprendre ton état</h1>
                <p className="text-muted-foreground">Pas pour te juger</p>
                <p className="text-sm text-primary font-medium">Juste pour voir clair</p>
              </div>
            </SectionBlock>

            {/* Energy */}
            <SectionBlock variant="blue">
              <h2 className="mb-4 font-bold">Ton énergie ?</h2>
              <div className="grid grid-cols-2 gap-3">
                {energyOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setEnergy(opt.label)}
                    className={`flex items-center gap-3 rounded-xl p-4 text-left text-sm font-medium transition-all ${
                      energy === opt.label
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card shadow-sm hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </SectionBlock>

            {/* Emotion */}
            <SectionBlock>
              <h2 className="mb-4 font-bold">Ton émotion ?</h2>
              <div className="grid grid-cols-2 gap-3">
                {emotionOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setEmotion(opt.label)}
                    className={`flex items-center gap-3 rounded-xl p-4 text-left text-sm font-medium transition-all ${
                      emotion === opt.label
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card shadow-sm hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </SectionBlock>

            {/* Context */}
            <SectionBlock variant="blue">
              <h2 className="mb-4 font-bold">Tu es avec qui ?</h2>
              <div className="grid grid-cols-2 gap-3">
                {contextOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setContext(opt.label)}
                    className={`flex items-center gap-3 rounded-xl p-4 text-left text-sm font-medium transition-all ${
                      context === opt.label
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card shadow-sm hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </SectionBlock>

            {/* CTA */}
            <SectionBlock>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full rounded-xl px-8 py-4 text-base font-semibold transition-all ${
                  canSubmit
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Enregistrer mon état
              </motion.button>
            </SectionBlock>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionBlock variant="blue">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <p className="text-xl font-bold">Ok.</p>
                <p className="text-primary font-semibold">
                  👉 ton état est normal vu ce que tu vis
                </p>
                <p className="text-muted-foreground">Tu n'inventes rien</p>
              </div>
            </SectionBlock>

            <SectionBlock>
              <div className="space-y-4 text-center">
                <div className="rounded-xl bg-card p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Ton check-in</p>
                  <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                    <span>Énergie : <strong>{energy}</strong></span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-4 text-sm">
                    <span>Émotion : <strong>{emotion}</strong></span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-4 text-sm">
                    <span>Contexte : <strong>{context}</strong></span>
                  </div>
                </div>

                <Link
                  to="/avancer"
                  className="mt-4 block w-full rounded-xl bg-primary px-8 py-4 text-center text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Adapter ma journée
                </Link>

                <Link
                  to="/dashboard"
                  className="block w-full rounded-xl border border-border bg-card px-8 py-4 text-center text-base font-semibold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Retour
                </Link>
              </div>
            </SectionBlock>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comprendre;
