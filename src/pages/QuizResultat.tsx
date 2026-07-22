import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw,
  Brain,
  BookOpen,
  Wallet,
  ShieldCheck,
  HeartPulse,
  Clock,
  Home as HomeIcon,
  Download,
} from "lucide-react";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG } from "@/lib/premiumOffer";
import { exportQuizResultPdf } from "@/lib/exportQuizResultPdf";
import { trackQuizEvent } from "@/lib/quizTracking";
import Footer from "@/components/Footer";

type ModuleReco = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const ALL_MODULES: Record<string, ModuleReco> = {
  ancrage: {
    icon: HeartPulse,
    title: "Ancrage émotionnel",
    desc: "Séances courtes pour redescendre quand tout déborde. 30 secondes suffisent.",
  },
  charge: {
    icon: Brain,
    title: "Décharge & Charge mentale",
    desc: "Vider ta tête en 2 minutes. Poser noir sur blanc ce que tu portes.",
  },
  journal: {
    icon: BookOpen,
    title: "Journal + Livre de Reconstruction",
    desc: "L'IA se souvient de toi. Ton chemin devient un livre exportable.",
  },
  budget: {
    icon: Wallet,
    title: "Budget complet",
    desc: "Revenus, factures, reste à vivre. Fini l'angoisse de ne pas savoir.",
  },
  coffre: {
    icon: ShieldCheck,
    title: "Coffre-fort & Santé",
    desc: "Papiers, ordonnances, IBAN, urgences — tout accessible en 3 secondes.",
  },
  frise: {
    icon: Clock,
    title: "Frise d'Évolution + Portrait mensuel",
    desc: "Voir noir sur blanc le chemin parcouru. Mois après mois.",
  },
};

type Verdict = {
  badge: string;
  headline: string;
  message: string;
  moduleKeys: (keyof typeof ALL_MODULES)[];
  urgency: "high" | "mid" | "low";
};

const getVerdict = (pct: number): Verdict => {
  if (pct >= 0.75)
    return {
      badge: "Priorité haute",
      headline: "Tu es en mode survie.",
      message:
        "Ton système est en alerte constante. Ta tête tourne, tu portes trop, tu tiens à bout de bras. Ce n'est pas une faiblesse — c'est un signal. Eclosia a été créé exactement pour ce moment. Pas dans 6 mois. Maintenant.",
      moduleKeys: ["ancrage", "charge", "coffre", "budget"],
      urgency: "high",
    };
  if (pct >= 0.55)
    return {
      badge: "Ancrage recommandé",
      headline: "Tu portes trop, seule.",
      message:
        "Tu tiens — mais à bout de bras. Ta charge mentale déborde et rien ne tient dans le temps. Eclosia va déposer ce que tu portes dans un seul endroit calme. Tu vas respirer, et voir clair.",
      moduleKeys: ["charge", "journal", "budget", "frise"],
      urgency: "mid",
    };
  return {
    badge: "Étape idéale",
    headline: "Tu veux ancrer ce que tu as reconstruit.",
    message:
      "Tu vas mieux — et tu veux que ça tienne. Eclosia est fait pour ancrer ton chemin, mois après mois, à vie. Ton Portrait, ta Frise, ton Livre : le chemin devient visible.",
    moduleKeys: ["frise", "journal", "ancrage", "coffre"],
    urgency: "low",
  };
};

const HandUnderline = () => (
  <svg
    viewBox="0 0 200 12"
    className="absolute -bottom-1.5 left-0 h-2.5 w-full"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M2 7 C 40 2, 80 11, 120 6 S 195 4, 198 7"
      stroke="hsl(41 86% 62%)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const QuizResultat = () => {
  const [params] = useSearchParams();
  const { startPayment, loading } = useMolliePayment();

  const score = Number(params.get("score") ?? 0);
  const max = Number(params.get("max") ?? 100);
  const rawName = (params.get("name") ?? "").trim().slice(0, 40);
  const firstName = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : "";
  const pct = max > 0 ? Math.min(1, Math.max(0, score / max)) : 0;
  const verdict = useMemo(() => getVerdict(pct), [pct]);
  const modules = verdict.moduleKeys.map((k) => ALL_MODULES[k]);

  const headline = firstName
    ? `${firstName}, ${verdict.headline.charAt(0).toLowerCase()}${verdict.headline.slice(1)}`
    : verdict.headline;
  const intro = firstName
    ? `${firstName}, ce que tu vas lire n'est pas un hasard — c'est ce que tes réponses racontent.`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          {/* Verdict */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark">
              <Sparkles className="h-3.5 w-3.5" />
              {verdict.badge}
            </div>
            {intro && (
              <p className="mt-6 font-serif text-lg italic text-primary-dark md:text-xl">
                {intro}
              </p>
            )}
            <h1 className="mt-6 font-serif text-[clamp(2rem,5vw,3.25rem)] leading-tight text-night">
              <span className="relative inline-block">
                {headline}
                <HandUnderline />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
              {verdict.message}
            </p>
          </div>

          {/* Modules recommandés */}
          <div className="mt-14">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
                Ta feuille de route
              </p>
              <h2 className="mt-3 font-serif text-2xl leading-tight text-night md:text-3xl">
                Les 4 espaces à activer en priorité
              </h2>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {modules.map((m, i) => (
                <motion.li
                  key={m.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <m.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-serif text-base text-night">{m.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground/70">
                      {m.desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <p className="mt-6 text-center text-sm italic text-foreground/60">
              + les 5 autres espaces d'Eclosia inclus dans ton accès à vie.
            </p>
          </div>

          {/* Offre + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-14 rounded-[2rem] border-2 border-primary/40 bg-secondary/50 p-7 shadow-soft-lg md:p-10"
          >
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
                Ta prochaine étape
              </p>
              <h3 className="mt-3 font-serif text-3xl text-night md:text-4xl">
                ANCRAGE — accès à vie
              </h3>
              <p className="mt-4 text-4xl font-bold text-night">
                {PREMIUM_PRICE_LONG}
              </p>
              <p className="mt-1 text-sm text-foreground/70">
                Paiement unique · Zéro abonnement · Pour la vie
              </p>
            </div>

            <ul className="mx-auto mt-7 max-w-md space-y-2.5">
              {[
                "Les 9 espaces d'Eclosia, débloqués immédiatement",
                "Toutes les mises à jour futures incluses",
                "14 jours pour changer d'avis",
                "Paiement sécurisé via Mollie",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-primary" strokeWidth={3} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => startPayment()}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Chargement…" : `Je reprends mon souffle — ${PREMIUM_PRICE_LONG}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Secondary actions */}
          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() =>
                exportQuizResultPdf({
                  firstName: firstName || undefined,
                  badge: verdict.badge,
                  headline: headline,
                  message: verdict.message,
                  modules: modules.map((m) => ({ title: m.title, desc: m.desc })),
                  priceLabel: `ANCRAGE — accès à vie · ${PREMIUM_PRICE_LONG}`,
                })
              }
              className="inline-flex items-center gap-1.5 text-primary-dark underline underline-offset-4 hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" />
              Télécharger mon résultat en PDF
            </button>
            <Link
              to="/#quiz"
              className="inline-flex items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refaire le quiz
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <HomeIcon className="h-3.5 w-3.5" />
              Revenir à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default QuizResultat;
