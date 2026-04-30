import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";

// 4 états dominants — chacun pondère les 4 piliers existants (1, 2, 3, 4)
type PillarId = 1 | 2 | 3 | 4;

interface QuizOption {
  label: string;
  weights: Record<PillarId, number>;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "body",
    question: "Là, tout de suite, comment se sent ton corps ?",
    options: [
      { label: "En alerte, tendu, je n'arrive pas à me poser", weights: { 1: 3, 2: 0, 3: 0, 4: 1 } },
      { label: "Lourd, vidé, comme éteint", weights: { 1: 1, 2: 0, 3: 0, 4: 3 } },
      { label: "Crispé quand je repense à des moments précis", weights: { 1: 1, 2: 3, 3: 0, 4: 0 } },
      { label: "Plutôt calme, mais ma tête tourne", weights: { 1: 0, 2: 1, 3: 2, 4: 1 } },
    ],
  },
  {
    id: "mind",
    question: "Et dans ta tête, qu'est-ce qui revient le plus ?",
    options: [
      { label: "« Je n'en peux plus » — survie", weights: { 1: 3, 2: 0, 3: 0, 4: 2 } },
      { label: "« Et si c'était de ma faute ? » — doute, culpabilité", weights: { 1: 0, 2: 3, 3: 1, 4: 0 } },
      { label: "« Il faut que je décide quelque chose » — pression à agir", weights: { 1: 0, 2: 1, 3: 3, 4: 0 } },
      { label: "« Je n'ai même plus envie d'essayer » — épuisement", weights: { 1: 1, 2: 0, 3: 0, 4: 3 } },
    ],
  },
  {
    id: "need",
    question: "Si tu avais 5 minutes pour toi maintenant, tu choisirais…",
    options: [
      { label: "Que mon corps se calme — respirer, m'asseoir", weights: { 1: 3, 2: 0, 3: 0, 4: 1 } },
      { label: "Comprendre ce qui m'arrive — mettre des mots", weights: { 1: 0, 2: 3, 3: 1, 4: 0 } },
      { label: "Avancer concrètement — un petit pas clair", weights: { 1: 0, 2: 0, 3: 3, 4: 1 } },
      { label: "Récupérer — sans culpabiliser de ne rien faire", weights: { 1: 1, 2: 0, 3: 0, 4: 3 } },
    ],
  },
];

// Mapping vers les piliers de la page Parcours (mêmes IDs)
const PILLARS: Record<
  PillarId,
  {
    emoji: string;
    title: string;
    pitch: string;
    exercise: string;
    anchor: string; // hash vers la section Parcours correspondante (id de la phase)
  }
> = {
  1: {
    emoji: "🌬️",
    title: "Calmer ton corps",
    pitch: "Sortir du mode survie avant de penser, décider ou comprendre.",
    exercise: "5-4-3-2-1 sensoriel + respiration 4s/6s.",
    anchor: "phase-1",
  },
  2: {
    emoji: "🪞",
    title: "Comprendre ce que tu vis",
    pitch: "Nommer ce qui se joue pour cesser de te le reprocher.",
    exercise: "Affect labeling : 1 mot pour l'émotion, 1 mot pour le besoin.",
    anchor: "phase-2",
  },
  3: {
    emoji: "🚪",
    title: "Reprendre du pouvoir",
    pitch: "Une décision simple, à ta taille, qui te remet aux commandes.",
    exercise: "Le « plus petit pas possible » — un seul, écrit noir sur blanc.",
    anchor: "phase-3",
  },
  4: {
    emoji: "🌿",
    title: "Te reconstruire sans t'épuiser",
    pitch: "Reconstituer tes réserves au lieu de forcer.",
    exercise: "Rituel du soir : « Aujourd'hui j'ai réussi à… »",
    anchor: "phase-4",
  },
};

interface ScoredPillar {
  id: PillarId;
  score: number;
}

function scoreAnswers(answers: Record<string, number>): ScoredPillar[] {
  const totals: Record<PillarId, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    (Object.keys(opt.weights) as unknown as PillarId[]).forEach((k) => {
      const key = Number(k) as PillarId;
      totals[key] += opt.weights[key];
    });
  }
  return (Object.keys(totals) as unknown as PillarId[])
    .map((k) => ({ id: Number(k) as PillarId, score: totals[Number(k) as PillarId] }))
    .sort((a, b) => b.score - a.score);
}

interface OnboardingQuizProps {
  /** Préfixe d'URL vers les phases (ex: "/parcours") — par défaut on reste sur la page actuelle. */
  pillarsHref?: string;
  /** Callback optionnel quand le quiz est complété */
  onComplete?: (top3: PillarId[]) => void;
}

const OnboardingQuiz = ({ pillarsHref = "", onComplete }: OnboardingQuizProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  const top3 = useMemo<ScoredPillar[]>(() => {
    if (!done) return [];
    return scoreAnswers(answers).slice(0, 3);
  }, [done, answers]);

  const choose = (qid: string, idx: number) => {
    const next = { ...answers, [qid]: idx };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setDone(true);
      onComplete?.(scoreAnswers(next).slice(0, 3).map((p) => p.id));
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  return (
    <section
      aria-label="Questionnaire d'orientation"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6"
    >
      <header className="mb-5 flex items-start gap-3">
        <span className="rounded-full bg-primary/10 p-2 text-primary" aria-hidden="true">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold leading-tight">
            Par où commencer pour toi ?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            3 questions courtes — on t'oriente vers les 3 piliers les plus utiles maintenant.
          </p>
        </div>
      </header>

      {!done && (
        <>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Question {step + 1} / {total}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={QUESTIONS[step].id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4 font-serif text-lg font-semibold">{QUESTIONS[step].question}</p>
              <div className="space-y-2">
                {QUESTIONS[step].options.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => choose(QUESTIONS[step].id, idx)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <p className="rounded-xl bg-primary/5 p-3 text-sm text-foreground/85">
            Voici les <span className="font-semibold">3 piliers les plus pertinents</span> pour toi
            en ce moment, dans l'ordre.
          </p>

          <ol className="space-y-3">
            {top3.map((p, i) => {
              const pillar = PILLARS[p.id];
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {pillar.emoji} {pillar.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{pillar.pitch}</p>
                      <p className="mt-2 text-xs">
                        <span className="font-semibold text-primary">Exercice :</span>{" "}
                        <span className="text-foreground/85">{pillar.exercise}</span>
                      </p>
                      <a
                        href={`${pillarsHref}#${pillar.anchor}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        Faire l'exercice <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Refaire le questionnaire
          </button>
        </motion.div>
      )}
    </section>
  );
};

export default OnboardingQuiz;
