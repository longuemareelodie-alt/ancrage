import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG } from "@/lib/premiumOffer";

type Option = { label: string; score: number };
type Question = { q: string; hint?: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    q: "Aujourd'hui, où en es-tu vraiment ?",
    options: [
      { label: "Je tiens. Mais à bout de bras.", score: 3 },
      { label: "Ça déborde de partout.", score: 4 },
      { label: "Je suis épuisée, même au réveil.", score: 4 },
      { label: "Ça va mieux, je veux ancrer.", score: 2 },
    ],
  },
  {
    q: "Ta tête, la nuit — ça donne quoi ?",
    options: [
      { label: "Elle tourne à 23h et m'empêche de dormir.", score: 4 },
      { label: "J'oublie des choses, je culpabilise.", score: 3 },
      { label: "Je m'endors, mais je me réveille en alerte.", score: 3 },
      { label: "Ça va, mais je veux du calme.", score: 2 },
    ],
  },
  {
    q: "Combien d'outils tu utilises pour t'organiser ?",
    options: [
      { label: "Post-it, carnets, notes du tel, tableurs…", score: 4 },
      { label: "2-3 apps, mais rien ne tient dans le temps.", score: 3 },
      { label: "Une seule, mais elle ne me correspond pas.", score: 3 },
      { label: "Aucun. Tout est dans ma tête.", score: 4 },
    ],
  },
  {
    q: "Papiers santé, budget, RDV — c'est où ?",
    options: [
      { label: "Éparpillés. Je panique aux RDV.", score: 4 },
      { label: "Un peu partout, je cherche à chaque fois.", score: 3 },
      { label: "Chez le conjoint / la famille aussi.", score: 3 },
      { label: "Rangés, mais je veux mieux.", score: 2 },
    ],
  },
  {
    q: "Ce que tu veux vraiment maintenant ?",
    options: [
      { label: "Un seul endroit calme pour tout déposer.", score: 4 },
      { label: "Voir noir sur blanc le chemin parcouru.", score: 3 },
      { label: "Arrêter de tout porter seule.", score: 4 },
      { label: "Reprendre mon souffle, pour de bon.", score: 4 },
    ],
  },
];

const MAX_SCORE = QUESTIONS.reduce(
  (m, q) => m + Math.max(...q.options.map((o) => o.score)),
  0,
);

const getVerdict = (score: number) => {
  const pct = score / MAX_SCORE;
  if (pct >= 0.75)
    return {
      level: "Tu es en mode survie.",
      body: "Ton système est en alerte constante. Eclosia a été créé exactement pour ce moment. Pas dans 6 mois — maintenant.",
      badge: "Priorité haute",
    };
  if (pct >= 0.55)
    return {
      level: "Tu portes trop, seule.",
      body: "Tu tiens, mais à bout de bras. Eclosia va déposer ce que tu portes dans un seul endroit calme. Tu vas respirer.",
      badge: "Ancrage recommandé",
    };
  return {
    level: "Tu veux ancrer ce que tu as reconstruit.",
    body: "Tu vas mieux — et tu veux que ça tienne. Eclosia est fait pour ancrer ton chemin, mois après mois, à vie.",
    badge: "Étape idéale",
  };
};

const OuJenSuisQuiz = () => {
  const { startPayment, loading } = useMolliePayment();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const done = step >= QUESTIONS.length;
  const total = answers.reduce((a, b) => a + b, 0);
  const verdict = done ? getVerdict(total) : null;
  const progress = (step / QUESTIONS.length) * 100;

  const pick = (score: number) => {
    const next = [...answers, score];
    setAnswers(next);
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep >= QUESTIONS.length) {
      const finalScore = next.reduce((a, b) => a + b, 0);
      navigate(`/quiz-resultat?score=${finalScore}&max=${MAX_SCORE}`);
    }
  };

  const reset = () => {
    setAnswers([]);
    setStep(0);
  };


  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-[2rem] border border-primary/20 bg-card p-7 shadow-soft-lg md:p-10">
        {!done && (
          <>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark">
              <span>Question {step + 1} / {QUESTIONS.length}</span>
              <span className="text-foreground/50">Où j'en suis</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className="mt-7 font-serif text-2xl leading-snug text-night md:text-3xl">
                  {QUESTIONS[step].q}
                </h3>
                <ul className="mt-6 space-y-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <li key={opt.label}>
                      <button
                        type="button"
                        onClick={() => pick(opt.score)}
                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-background px-5 py-4 text-left text-[15px] leading-snug text-foreground/85 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/40 hover:shadow-soft"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="h-4 w-4 flex-none text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {done && verdict && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{verdict.badge}</span>
            </div>
            <h3 className="mt-4 font-serif text-3xl leading-tight text-night md:text-4xl">
              {verdict.level}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-foreground/80 md:text-lg">
              {verdict.body}
            </p>

            <div className="mt-7 rounded-2xl bg-secondary/50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark">
                Ta prochaine étape
              </p>
              <p className="mt-2 font-serif text-xl text-night">
                ANCRAGE — accès à vie, {PREMIUM_PRICE_LONG}.
              </p>
              <p className="mt-1 text-sm text-foreground/70">
                Paiement unique. Zéro abonnement. Tout Eclosia, pour la vie.
              </p>
            </div>

            <button
              type="button"
              onClick={() => startPayment()}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Chargement…" : `Je reprends mon souffle — ${PREMIUM_PRICE_LONG}`}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Paiement unique · Accès à vie · 100% sécurisé via Mollie
            </p>

            <button
              type="button"
              onClick={reset}
              className="mx-auto mt-5 flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Refaire le quiz
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OuJenSuisQuiz;
