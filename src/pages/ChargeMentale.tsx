import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Brain,
  Inbox,
  BatteryLow,
  Sparkles,
  ListChecks,
  CloudOff,
  Moon,
  ArrowRight,
  Check,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const features = [
  {
    icon: Inbox,
    title: "Décharge du jour",
    desc: "Vide ta tête en 2 minutes. Toutes les pensées, listes, rappels, soucis qui tournent : posés noir sur blanc, hors de toi.",
  },
  {
    icon: CloudOff,
    title: "Mode cerveau saturé",
    desc: "Quand tu n'arrives plus à penser. L'app te guide pas à pas : 1 chose à la fois, plus de décisions à prendre.",
  },
  {
    icon: BatteryLow,
    title: "Gestion énergie",
    desc: "Visualise ta charge en temps réel. L'app t'aide à dire non, à déléguer, à reposer ce qui peut attendre.",
  },
  {
    icon: ListChecks,
    title: "Listes intelligentes",
    desc: "Courses, RDV, démarches, rendez-vous école. Triées par urgence et par qui peut s'en occuper. Pas que toi.",
  },
  {
    icon: Sparkles,
    title: "Rituels de délestage",
    desc: "3 minutes le soir pour fermer la journée. Pour que ton cerveau arrête de tourner à 22h.",
  },
  {
    icon: Moon,
    title: "Coupe-circuit",
    desc: "Un bouton à activer quand ça déborde. Tout se met en pause, on te ramène à 1 seul geste à faire maintenant.",
  },
];

const steps = [
  {
    n: "01",
    title: "Pose ta décharge initiale",
    desc: "5 minutes pour vider tout ce que tu portes en tête. Une seule fois. On trie ensemble.",
  },
  {
    n: "02",
    title: "Choisis ton mode",
    desc: "Cerveau saturé, fatigue, débordement ? L'app adapte ce qu'elle te propose à ton état réel du moment.",
  },
  {
    n: "03",
    title: "Décharge au fil de la journée",
    desc: "Une pensée arrive ? Tu la déposes en 10 secondes. Plus besoin de la retenir.",
  },
  {
    n: "04",
    title: "Rituel du soir",
    desc: "3 minutes pour fermer la journée et libérer ton sommeil. Tu te couches plus légère.",
  },
];

const ChargeMentale = () => {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Charge mentale" }]} />
      <div className="flex flex-col px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <Brain className="h-8 w-8" />
            </motion.div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Inclus dans l'accès à vie
            </p>
            <h1 className="text-2xl font-bold leading-tight">
              🧠 Charge mentale
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Décharge du jour, mode cerveau saturé, gestion énergie.
              <br />
              Pour tenir sans s'effondrer.
            </p>
          </div>

          {/* Promesse */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm leading-relaxed text-foreground">
              Tu portes 1 000 choses dans la tête. Tu te réveilles déjà fatiguée.
              Tu oublies parce que c'est trop. Le module Charge mentale est fait
              pour ça : poser ce que tu portes, voir clair, et arrêter de tout
              porter seule.
            </p>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Ce que tu débloques</h2>
            <div className="space-y-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Étapes */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Comment ça marche</h2>
            <ol className="space-y-3">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm"
                >
                  <span className="text-2xl font-bold text-primary">{s.n}</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Pour qui */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Pour qui ?</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Mamans qui pensent à tout, pour tout le monde</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Celles qui oublient parce qu'elles portent trop</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Cerveaux qui tournent à 23h et empêchent de dormir</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Tous les profils en surcharge — TDAH, HPI, burn-out qui rôde</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link
            to="/paywall"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Débloquer le module Charge mentale — 57€
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Paiement unique · Accès à vie · Sans abonnement
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ChargeMentale;
