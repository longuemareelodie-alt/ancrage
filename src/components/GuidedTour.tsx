import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";

const STORAGE_KEY = "guided_tour_done_v1";
export const START_TOUR_EVENT = "lovable:start-guided-tour";

type Step = {
  path: string;
  emoji: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    path: "/dashboard",
    emoji: "🏠",
    title: "Bienvenue dans ton Ancrage",
    body:
      "Voici ton accueil. Chaque jour, tu y retrouves ton rituel matin/soir, ton humeur du moment et un accès rapide à tes outils.",
  },
  {
    path: "/checkin",
    emoji: "💛",
    title: "Le rituel quotidien",
    body:
      "En 90 secondes, tu poses ton état émotionnel. Le rituel adapte ensuite l'outil le plus juste pour toi.",
  },
  {
    path: "/comment-tu-te-sens",
    emoji: "🌈",
    title: "Et ton enfant ?",
    body:
      "Aide ton enfant à mettre des mots sur ce qu'il ressent. Visages à choisir, intensité, et un guide parent immédiat.",
  },
  {
    path: "/lies-autrement",
    emoji: "🤝",
    title: "Liés autrement",
    body:
      "Ton espace dédié au lien : LSF, signes nouveaux, journal partagé, activités et communauté.",
  },
  {
    path: "/sante",
    emoji: "🩺",
    title: "Santé & urgences",
    body:
      "Centralise rendez-vous, médicaments, fiche médicale et ressources. Une fiche d'urgence partageable en un lien.",
  },
  {
    path: "/historique",
    emoji: "📈",
    title: "Ton historique",
    body:
      "Retrouve tes rituels passés et les émotions de ton enfant, filtrables par tranche d'âge.",
  },
  {
    path: "/profil",
    emoji: "👤",
    title: "Ton espace personnel",
    body:
      "Profil, paiements, parcours et notes. Tu peux relancer cette visite à tout moment depuis cette page.",
  },
];

export default function GuidedTour() {
  const { user, isPaid, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-launch on first visit for paid users
  useEffect(() => {
    if (loading || !user || !isPaid) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Only auto-start when landing on dashboard
    if (location.pathname !== "/dashboard") return;
    setOpen(true);
    setStep(0);
  }, [loading, user, isPaid, location.pathname]);

  // Listen for manual start
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setOpen(true);
      navigate(STEPS[0].path);
    };
    window.addEventListener(START_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_TOUR_EVENT, handler);
  }, [navigate]);

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    navigate(STEPS[nextStep].path);
  }, [step, navigate, finish]);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  if (!open || !user || !isPaid) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-[2px]"
        aria-hidden
      />
      <motion.div
        key={`tour-card-${step}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-tour-title"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-[71] mx-auto max-w-md p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:bottom-6"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-2xl">
          <button
            onClick={skip}
            aria-label="Fermer la visite"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Visite guidée
            </span>
            <span className="text-[11px] text-muted-foreground">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl"
            >
              {current.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="guided-tour-title"
                className="text-lg font-bold leading-tight text-foreground"
              >
                {current.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.body}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              onClick={skip}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Passer
            </button>
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              {isLast ? (
                <>
                  Terminer <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Suivant <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
