import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";

const EXEMPLES = [
  {
    situation:
      "« Le matin, l'habillage se termine toujours en crise. »",
    reponse:
      "Éclosia propose une routine du matin en 5 étapes visuelles, adaptée à son âge.",
  },
  {
    situation: "« On doit aller chez le dentiste vendredi. »",
    reponse:
      "Éclosia prépare une histoire sociale pour lui raconter la visite avant d'y aller.",
  },
  {
    situation: "« Il n'arrive pas à attendre son tour. »",
    reponse:
      "Éclosia crée des cartes visuelles et une petite règle simple à afficher.",
  },
];

const AssistantSection = () => (
  <Section id="assistant" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Assistant Éclosia</Eyebrow>
      <SectionTitle>
        Décris simplement
        <br />
        <span className="italic text-primary-dark">la situation.</span>
      </SectionTitle>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Explique ce que tu vis, avec tes mots. Éclosia t'aide à créer le
        support le plus adapté à ton enfant. Pas de formulaire, pas de jargon.
      </p>
    </motion.div>

    <div className="mx-auto mt-14 grid max-w-4xl gap-4">
      {EXEMPLES.map((e, i) => (
        <motion.div
          key={e.situation}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: i * 0.08 }}
          className="rounded-[1.75rem] border border-border/60 bg-background p-6 md:p-8"
        >
          <p className="font-serif text-lg italic leading-relaxed text-night md:text-xl">
            {e.situation}
          </p>
          <div className="mt-5 flex items-start gap-3 border-t border-border/50 pt-5">
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-3.5 w-3.5 text-primary-dark" aria-hidden="true" />
            </span>
            <p className="text-[14.5px] leading-relaxed text-foreground/85">
              {e.reponse}
            </p>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.p
      {...fadeUp}
      className="mx-auto mt-14 max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground"
    >
      Tu gardes toujours la main : tu relis, tu ajustes, tu imprimes.
    </motion.p>
  </Section>
);

export default AssistantSection;
