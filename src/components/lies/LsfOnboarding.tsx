import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, RotateCcw, X, HelpCircle, ChevronLeft } from "lucide-react";
import { LSF_THEMES } from "@/data/lsfCatalog";

type ThemeSlug = "bebe-besoins" | "emotions" | "routine" | "famille";

type Question = {
  id: string;
  question: string;
  hint?: string;
  options: { label: string; weights: Partial<Record<ThemeSlug, number>> }[];
};

const QUESTIONS: Question[] = [
  {
    id: "age",
    question: "Quel âge a ton enfant (le plus jeune si plusieurs) ?",
    hint: "L'âge change complètement les signes utiles en premier.",
    options: [
      {
        label: "0–12 mois — on prépare le langage",
        weights: { "bebe-besoins": 4, routine: 1 },
      },
      {
        label: "12–24 mois — il commence à pointer / dire des mots",
        weights: { "bebe-besoins": 3, emotions: 2, routine: 1 },
      },
      {
        label: "2–4 ans — explosion émotionnelle, transitions difficiles",
        weights: { emotions: 3, routine: 2, famille: 1 },
      },
      {
        label: "4 ans et + (ou plusieurs enfants à la maison)",
        weights: { famille: 3, emotions: 1, routine: 1 },
      },
    ],
  },
  {
    id: "level",
    question: "Concrètement, combien de signes tu maîtrises aujourd'hui ?",
    hint: "Maîtriser = capable de le faire spontanément, sans réfléchir.",
    options: [
      {
        label: "Aucun — je n'ai jamais signé",
        weights: { "bebe-besoins": 3 },
      },
      {
        label: "1 à 5 (manger, dormir, encore, fini…)",
        weights: { "bebe-besoins": 2, emotions: 2 },
      },
      {
        label: "Une dizaine, mais toujours les mêmes",
        weights: { emotions: 2, routine: 3 },
      },
      {
        label: "20+ et j'enchaîne dans des phrases courtes",
        weights: { famille: 3, routine: 2, emotions: 1 },
      },
    ],
  },
  {
    id: "trigger",
    question: "Quel moment de ta journée t'épuise le plus, faute de comprendre ?",
    hint: "On va y mettre des signes en priorité.",
    options: [
      {
        label: "Les pleurs « sans raison » — j'aimerais qu'il me montre",
        weights: { "bebe-besoins": 4 },
      },
      {
        label: "Les colères / le débordement émotionnel",
        weights: { emotions: 4 },
      },
      {
        label: "Les transitions : repas, bain, coucher, départ",
        weights: { routine: 4 },
      },
      {
        label: "Quand il me parle de quelqu'un (papa, nounou, copain)",
        weights: { famille: 4 },
      },
    ],
  },
];

type Answer = number | "skip";

function score(answers: Record<string, Answer>): { theme: ThemeSlug; confident: boolean } {
  const totals: Record<ThemeSlug, number> = {
    "bebe-besoins": 0,
    emotions: 0,
    routine: 0,
    famille: 0,
  };
  let answeredCount = 0;
  for (const q of QUESTIONS) {
    const ans = answers[q.id];
    if (ans == null || ans === "skip") continue;
    const opt = q.options[ans];
    if (!opt) continue;
    answeredCount++;
    (Object.keys(opt.weights) as ThemeSlug[]).forEach((k) => {
      totals[k] += opt.weights[k] ?? 0;
    });
  }
  const theme = (Object.keys(totals) as ThemeSlug[]).reduce((a, b) =>
    totals[b] > totals[a] ? b : a,
  );
  // Confiant si au moins 2 questions répondues ET un thème ressort vraiment
  const max = Math.max(...Object.values(totals));
  const confident = answeredCount >= 2 && max > 0;
  return { theme, confident };
}

const STORAGE_KEY = "lsf-onboarding-v1";

interface LsfOnboardingProps {
  onDismiss: () => void;
}

const LsfOnboarding = ({ onDismiss }: LsfOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  const result = useMemo(
    () => (done ? score(answers) : null),
    [done, answers],
  );
  const recommended = result?.theme ?? null;
  const confident = result?.confident ?? false;
  const theme = recommended
    ? LSF_THEMES.find((t) => t.slug === recommended) ?? null
    : null;

  const advance = (next: Record<string, Answer>) => {
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setDone(true);
      try {
        const r = score(next);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            completed: true,
            recommended: r.theme,
            confident: r.confident,
            answers: next,
            at: Date.now(),
          }),
        );
      } catch {
        /* noop */
      }
    }
  };

  const choose = (qid: string, idx: number) => advance({ ...answers, [qid]: idx });
  const skip = (qid: string) => advance({ ...answers, [qid]: "skip" });
  const back = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  const dismiss = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ completed: true, dismissed: true, at: Date.now() }),
      );
    } catch {
      /* noop */
    }
    onDismiss();
  };

  return (
    <section
      aria-label="Onboarding LSF"
      className="relative rounded-2xl border border-[hsl(var(--lies))]/30 bg-[hsl(var(--lies-soft))] p-5 shadow-sm md:p-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Passer l'orientation"
        className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-background/60 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <header className="mb-4 flex items-start gap-3 pr-8">
        <span
          className="rounded-full bg-[hsl(var(--lies))]/15 p-2 text-[hsl(var(--lies))]"
          aria-hidden="true"
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-serif text-xl font-semibold leading-tight">
            Trouve ton premier module en 2 minutes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            3 questions pour t'orienter vers le thème LSF le plus utile maintenant.
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
                className="h-full rounded-full bg-[hsl(var(--lies))]"
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
              <p className="mb-1 font-serif text-lg font-semibold">
                {QUESTIONS[step].question}
              </p>
              {QUESTIONS[step].hint && (
                <p className="mb-3 text-xs text-muted-foreground">{QUESTIONS[step].hint}</p>
              )}
              <div className="space-y-2">
                {QUESTIONS[step].options.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => choose(QUESTIONS[step].id, idx)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-[hsl(var(--lies))] hover:bg-[hsl(var(--lies))]/5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--lies))]/30"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {done && theme && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <p className="rounded-xl bg-background/70 p-3 text-sm text-foreground/85">
            On te suggère de commencer par&nbsp;:
          </p>

          <Link
            to={`/lies-autrement/lsf/${theme.slug}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:border-[hsl(var(--lies))] hover:shadow-soft"
          >
            <span className="text-3xl" aria-hidden="true">
              {theme.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg font-semibold">{theme.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--lies))]">
                Commencer ce module <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Refaire
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Voir tous les thèmes
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export function isLsfOnboardingDone(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Boolean(JSON.parse(raw)?.completed);
  } catch {
    return false;
  }
}

export default LsfOnboarding;
