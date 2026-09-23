import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowDown, FileDown, Sparkles } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import { track, useSectionView } from "@/lib/landingAnalytics";

const ROUTINE = [
  "Se lever",
  "S'habiller",
  "Petit-déjeuner",
  "Se brosser les dents",
  "Mettre les chaussures",
];

const StudioHeroSection = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const observe = useSectionView("studio_section_view");
  useEffect(() => observe(ref.current), [observe]);

  return (
    <Section id="studio">
      <div ref={ref}>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Studio d'Autonomie</Eyebrow>
          <SectionTitle>
            Transformer une situation difficile
            <br />
            <span className="italic text-primary-dark">en support concret.</span>
          </SectionTitle>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Décris simplement ce qui pose problème. Éclosia t'aide à créer un
            support que tu peux ensuite ajuster et imprimer.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3 md:items-stretch">
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] border border-border/60 bg-card p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              La situation
            </p>
            <p className="mt-4 font-serif text-lg italic leading-snug text-night">
              « Le matin, l'habillage se termine toujours en crise. »
            </p>
            <ArrowDown className="mt-6 h-5 w-5 text-primary-dark/60 md:hidden" aria-hidden="true" />
          </motion.div>

          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] border border-primary/30 bg-card p-6"
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Le support proposé
            </p>
            <p className="mt-4 text-sm font-medium text-night">Routine du matin</p>
            <ol className="mt-3 space-y-2">
              {ROUTINE.map((r, i) => (
                <li
                  key={r}
                  className="flex items-center gap-2.5 text-[14px] text-foreground/85"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[12px] font-semibold text-primary-dark">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="flex flex-col rounded-[1.75rem] border border-border/60 bg-card p-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              À imprimer
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-foreground/85">
              Tu ajustes les étapes, puis tu exportes en PDF pour l'afficher à la
              maison, le donner à l'école ou à une personne qui aide.
            </p>
            <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-[13px] text-foreground/85">
              <FileDown className="h-4 w-4 text-primary-dark" aria-hidden="true" />
              Exporter en PDF
            </span>
          </motion.div>
        </div>

        <motion.div {...fadeUp} className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Les supports proposés sont des outils d'organisation et
            d'accompagnement. Ils ne constituent pas une recommandation médicale
            ou thérapeutique et ne remplacent pas l'avis d'un professionnel.
          </p>
          <button
            onClick={() => {
              track("checkout_start", { from: "studio" });
              onCTA();
            }}
            disabled={loading}
            className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-night px-7 text-[15px] font-medium text-night-foreground transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
          >
            Découvrir Éclosia
          </button>
        </motion.div>
      </div>
    </Section>
  );
};

export default StudioHeroSection;
