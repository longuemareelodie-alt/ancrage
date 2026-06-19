import { motion } from "framer-motion";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Target,
  BookMarked,
  Timer,
  HeartHandshake,
  Check,
} from "lucide-react";
import journalAsset from "@/assets/showcase/journal.jpg.asset.json";
import portraitAsset from "@/assets/showcase/portrait.jpg.asset.json";
import friseAsset from "@/assets/showcase/frise.jpg.asset.json";
import dashboardAsset from "@/assets/showcase/dashboard.jpg.asset.json";

const showcase = [
  { src: journalAsset.url, caption: "Ton journal, avec l'IA qui se souvient de toi" },
  { src: portraitAsset.url, caption: "Ton Portrait de Transformation, généré chaque mois" },
  { src: friseAsset.url, caption: "Ta Frise d'Évolution, pour voir le chemin parcouru" },
  { src: dashboardAsset.url, caption: "Ton tableau de bord, simple et apaisant" },
];

const _unused = {
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const AllerPlusLoin = () => {
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    startPayment();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="font-serif text-[clamp(1.75rem,5vw,3rem)] leading-[1.15] tracking-tight text-night">
            La vie t'a transformée. Eclosia t'aide à découvrir qui tu es
            devenue.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            Tu n'as pas besoin de redevenir celle d'avant. Tu as besoin de
            comprendre qui tu es en train de devenir.
          </p>
          <div className="mt-8">
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {`Je commence ma reconstruction — ${PREMIUM_PRICE_SHORT}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* SECTION 1 — LE CONSTAT */}
      <section className="bg-card px-6 py-16 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl leading-tight text-night md:text-3xl">
            Après la tempête, personne ne te dit quoi faire.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              "cancer",
              "burn-out",
              "relation toxique",
              "séparation",
              "deuil",
              "maladie",
              "violences",
              "combat judiciaire",
              "épuisement maternel",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-10 font-serif text-lg italic leading-relaxed text-night md:text-xl">
            Tu ne te dis pas je manque de motivation. Tu te dis je ne sais plus
            qui je suis.
          </p>
        </motion.div>
      </section>

      {/* SECTION 2 — LA PROMESSE */}
      <section className="bg-night px-6 py-16 text-night-foreground md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-xl">
          <h2 className="text-center font-serif text-2xl leading-tight md:text-3xl">
            On ne redevient jamais celle qu'on était avant. On devient une
            autre version.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Avant
              </p>
              <ul className="space-y-3 text-night-foreground/80">
                {["survie", "brouillard mental", "perte d'identité", "fatigue émotionnelle"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Après
              </p>
              <ul className="space-y-3 text-night-foreground/90">
                {[
                  "compréhension de soi",
                  "confiance retrouvée",
                  "reconstruction",
                  "projection vers l'avenir",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — L'IA */}
      <section className="px-6 py-16 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-2xl leading-tight text-night md:text-3xl">
            L'IA qui se souvient de ton parcours
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Eclosia retient ton histoire, tes peurs, tes progrès, tes victoires.
            Et te montre ce que toi-même tu ne vois plus.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-soft">
            <p className="font-serif text-lg italic leading-relaxed text-night">
              « Jour 1 tu écrivais que tu étais perdue. Aujourd'hui tu parles de
              projets. Voici ce qui a changé. »
            </p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4 — FONCTIONNALITÉS */}
      <section className="bg-secondary/40 px-6 py-16 md:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-xl">
          <h2 className="text-center font-serif text-2xl leading-tight text-night md:text-3xl">
            Tout ce qu'Eclosia fait pour toi
          </h2>
          <ul className="mt-10 space-y-4">
            {[
              { icon: BookOpen, text: "Journal intelligent avec IA mémorielle" },
              { icon: Sparkles, text: "Portrait mensuel de transformation" },
              { icon: Target, text: "Missions de reconstruction" },
              { icon: BookMarked, text: "Livre de reconstruction" },
              { icon: Timer, text: "Frise d'évolution" },
              { icon: HeartHandshake, text: "Module familles atypiques" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-4 rounded-xl bg-card px-5 py-4 shadow-soft"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* SECTION 5 — PRIX */}
      <section className="px-6 py-16 md:py-24">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-xl rounded-3xl bg-card p-8 text-center shadow-soft-lg ring-2 ring-primary/20 md:p-12"
        >
          <h2 className="font-serif text-2xl leading-tight text-night md:text-3xl">
            Rejoins Eclosia
          </h2>
          <p className="mt-2 text-4xl font-bold text-night md:text-5xl">
            {PREMIUM_PRICE_SHORT}
          </p>
          <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            accès à vie
          </p>
          <p className="mt-4 text-sm text-primary-dark">
            Offre fondatrice — prix augmente après les 50 premières
          </p>
          <div className="mt-8">
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {`Je commence ma reconstruction — ${PREMIUM_PRICE_SHORT}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Paiement unique. Accès à vie. 100% sécurisé via Mollie.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default AllerPlusLoin;
