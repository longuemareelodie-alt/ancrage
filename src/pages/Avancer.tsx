import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Sparkles, Leaf } from "lucide-react";
import SectionBlock from "@/components/SectionBlock";
import logo from "@/assets/logo-ancrage.png";

const Avancer = () => {
  const [step, setStep] = useState<"input" | "plan">("input");
  const [tasks, setTasks] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState("");
  const [softMode, setSoftMode] = useState(false);

  const addTask = () => {
    const trimmed = currentTask.trim();
    if (trimmed && tasks.length < 6) {
      setTasks((prev) => [...prev, trimmed]);
      setCurrentTask("");
    }
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePlan = () => {
    if (tasks.length > 0) setStep("plan");
  };

  // Simplified "adapted" tasks — keep max 3, reword gently
  const adaptedTasks = softMode ? tasks.slice(0, 2) : tasks.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={logo} alt="Ancrage" className="h-8 w-auto" />
        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {step === "input" ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <SectionBlock>
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold">Tu n'as pas besoin d'en faire trop</h1>
                <p className="text-primary font-medium">
                  Juste avancer… intelligemment
                </p>
              </div>
            </SectionBlock>

            <SectionBlock variant="blue">
              <h2 className="mb-4 font-bold">
                Qu'est-ce que tu dois faire aujourd'hui ?
              </h2>

              <div className="space-y-3">
                {tasks.map((task, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm"
                  >
                    <span className="flex-1 text-sm">{task}</span>
                    <button
                      onClick={() => removeTask(i)}
                      className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                {tasks.length < 6 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      placeholder="Ex : appeler la banque..."
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={addTask}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </SectionBlock>

            <SectionBlock>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={generatePlan}
                disabled={tasks.length === 0}
                className={`w-full rounded-xl px-8 py-4 text-base font-semibold transition-all ${
                  tasks.length > 0
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Créer mon plan
              </motion.button>
            </SectionBlock>
          </motion.div>
        ) : (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SectionBlock variant="blue">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">
                  Voilà ce que tu peux faire aujourd'hui
                </h2>
                <p className="text-sm text-primary font-medium">
                  👉 version adaptée à ton état
                </p>
                <p className="text-sm text-muted-foreground">
                  👉 sans te cramer
                </p>
              </div>
            </SectionBlock>

            <SectionBlock>
              <div className="space-y-3">
                {adaptedTasks.map((task, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                    className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm">{task}</span>
                  </motion.div>
                ))}

                {tasks.length > adaptedTasks.length && (
                  <p className="text-center text-xs text-muted-foreground">
                    👉 Le reste peut attendre demain
                  </p>
                )}
              </div>

              {/* Soft mode toggle */}
              <div className="mt-6">
                <button
                  onClick={() => setSoftMode(!softMode)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
                    softMode
                      ? "bg-green-100 text-green-700"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <Leaf className="h-4 w-4" />
                  {softMode ? "Mode doux activé ✓" : "Mode doux"}
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/dashboard"
                  className="block w-full rounded-xl bg-primary px-8 py-4 text-center text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </SectionBlock>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Avancer;
