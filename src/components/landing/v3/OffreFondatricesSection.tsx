import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import FoundingFamiliesBanner from "@/components/FoundingFamiliesBanner";
import { track, useSectionView } from "@/lib/landingAnalytics";

const AVANTAGES = [
  "Accès à vie",
  "Toutes les mises à jour incluses",
  "Badge exclusif à vie",
  "Accès anticipé à certaines nouveautés",
  "Possibilité de proposer des idées d'amélioration",
  "Tarif fondateur conservé selon les conditions de l'offre",
];

const BADGES = [
  { emoji: "🌸", label: "Famille Fondatrice" },
  { emoji: "🌱", label: "Famille Pionnière" },
  { emoji: "✨", label: "Première Génération" },
];

const OffreFondatricesSection = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const observe = useSectionView("founder_offer_view");
  useEffect(() => observe(ref.current), [observe]);

  return (
    <Section id="familles-fondatrices" className="bg-card">
      <div ref={ref}>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Familles Fondatrices</Eyebrow>
          <SectionTitle>
            🌸 Rejoins les
            <br />
            <span className="italic text-primary-dark">Familles Fondatrices.</span>
          </SectionTitle>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Les premières familles qui rejoignent Éclosia participent directement
            à son lancement. En échange de leur confiance, elles bénéficient d'un
            tarif fondateur évolutif et d'avantages réservés aux premières
            générations.
          </p>
        </motion.div>

        <div className="mt-9 grid items-start gap-6 md:grid-cols-2 md:gap-10">
          <FoundingFamiliesBanner className="w-full" />

          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] border border-border/70 bg-background px-6 py-7"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ce que ça inclut
            </p>
            <ul className="mt-4 space-y-2.5">
              {AVANTAGES.map((a) => (
                <li key={a} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary-dark" aria-hidden="true" />
                  </span>
                  <span className="text-[14px] leading-relaxed text-foreground/85">{a}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Les badges
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[12.5px] text-foreground/85"
                  >
                    <span aria-hidden="true">{b.emoji}</span>
                    {b.label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                Le niveau de badge dépend de la période à laquelle tu rejoins
                Éclosia. Il est attribué automatiquement après l'achat et reste à
                vie.
              </p>
            </div>

            <button
              onClick={() => {
                track("founder_cta_click", { from: "offre" });
                track("checkout_start", { from: "offre" });
                onCTA();
              }}
              disabled={loading}
              className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-night px-6 text-[15px] font-medium text-night-foreground transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
            >
              🌸 Rejoindre les Familles Fondatrices
            </button>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default OffreFondatricesSection;
