import { motion } from "framer-motion";
import { fadeUp } from "./primitives";

const FinalCTA = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => (
  <section id="rejoindre" className="px-6 py-20 md:py-28">
    <motion.div
      {...fadeUp}
      className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2.5rem] bg-night px-6 py-20 text-center md:px-16 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-40">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <h2 className="font-serif text-[clamp(1.85rem,4.5vw,3.25rem)] leading-[1.1] tracking-tight text-night-foreground">
          Et si tu pouvais enfin
          <br />
          <span className="italic">partager un peu de cette charge ?</span>
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-night-foreground/75 md:text-base">
          Éclosia a été créée pour accompagner les familles au quotidien. Pas
          pour leur ajouter une application de plus.
        </p>

        <button
          onClick={onCTA}
          disabled={loading}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-night-foreground px-8 py-4 text-sm font-medium text-night transition-all duration-300 hover:-translate-y-[1px] hover:opacity-95 active:translate-y-0 disabled:opacity-60"
        >
          🌸 Rejoindre les Familles Fondatrices
        </button>

        <p className="mt-6 text-xs text-night-foreground/60">
          Paiement unique · Accès à vie · Sans abonnement
        </p>
      </div>
    </motion.div>
  </section>
);

export default FinalCTA;
