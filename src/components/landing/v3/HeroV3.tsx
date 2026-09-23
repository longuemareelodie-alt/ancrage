import { motion } from "framer-motion";
import { Check, Play } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";
import FoundingPriceLine from "./FoundingPriceLine";
import { track } from "@/lib/landingAnalytics";

const REASSURANCE = [
  "Accès à vie",
  "Sans abonnement",
  "Mises à jour incluses",
  "Paiement en plusieurs fois disponible",
];

const HeroV3 = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => (
  <section className="relative overflow-hidden px-6 pb-12 pt-24 md:pb-20 md:pt-32">
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 left-[-10%] h-[380px] w-[380px] rounded-full bg-secondary/40 blur-3xl" />
    </div>

    <div className="mx-auto grid w-full max-w-[1180px] items-center gap-10 md:grid-cols-2 md:gap-14">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="order-1 text-center md:text-left"
      >
        <h1 className="font-serif text-[clamp(1.9rem,5.2vw,3.6rem)] leading-[1.08] tracking-[-0.02em] text-night">
          Tu n'as pas besoin d'une application de plus.
          <br />
          <span className="italic text-primary-dark">
            Tu as besoin d'arrêter de tout porter dans ta tête.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-foreground/80 md:mx-0 md:text-base">
          Éclosia rassemble au même endroit l'organisation familiale, les
          informations importantes et des outils adaptés aux besoins de ton
          enfant.
        </p>

        {/* Mobile : le produit tout de suite après le sous-titre. */}
        <div className="mt-8 md:hidden">
          <HeroMockup />
        </div>

        <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
          {REASSURANCE.map((r) => (
            <li
              key={r}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3.5 py-1.5 text-[12.5px] text-foreground/85"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-2.5 w-2.5 text-primary-dark" aria-hidden="true" />
              </span>
              {r}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <FoundingPriceLine />
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
          <button
            onClick={() => {
              track("hero_cta_click");
              track("checkout_start", { from: "hero" });
              onCTA();
            }}
            disabled={loading}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-night px-7 text-[15px] font-medium text-night-foreground shadow-[0_10px_40px_-15px_hsl(var(--night)/0.5)] transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
          >
            🌸 Rejoindre les Familles Fondatrices
          </button>
          <a
            href="#demonstration"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-border/70 bg-card/70 px-6 text-[15px] font-medium text-foreground transition-colors hover:bg-card"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Voir Éclosia en 60 secondes
          </a>
        </div>

        <p className="mt-4 text-[12.5px] text-muted-foreground">
          Déjà cliente ?{" "}
          <Link to="/connexion" className="underline underline-offset-4 hover:text-night">
            Je me connecte
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="order-2 hidden md:block"
      >
        <HeroMockup desktop />
      </motion.div>
    </div>
  </section>
);

const HeroMockup = ({ desktop = false }: { desktop?: boolean }) => (
  <div className={`relative mx-auto ${desktop ? "max-w-[300px]" : "max-w-[190px]"}`}>
    <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
    <div className="rounded-[2.2rem] border border-border/60 bg-card p-1.5 shadow-[0_40px_100px_-40px_hsl(var(--night)/0.35)]">
      <img
        src={dashboardShot.url}
        alt="L'écran Aujourd'hui d'Éclosia sur un téléphone"
        width={840}
        height={1400}
        loading={desktop ? "lazy" : "eager"}
        decoding="async"
        className="w-full rounded-[1.8rem]"
      />
    </div>
  </div>
);

export default HeroV3;
