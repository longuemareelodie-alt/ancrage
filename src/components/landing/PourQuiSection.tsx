import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";

const PROFILS = [
  {
    emoji: "🧡",
    title: "Un parent",
    desc: "Maman, papa, parent solo : ton espace s'adapte à la façon dont tu veux être appelé·e.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Deux parents",
    desc: "Les deux voient les mêmes informations. Plus besoin de tout se répéter le soir.",
  },
  {
    emoji: "💛",
    title: "Grands-parents",
    desc: "Invite un proche et choisis ce qu'il peut consulter. Rien de plus.",
  },
  {
    emoji: "🏡",
    title: "Parents d'accueil",
    desc: "Les documents, les traitements et les repères de l'enfant, réunis et retrouvables.",
  },
  {
    emoji: "🩺",
    title: "Professionnels",
    desc: "Un accès pensé pour les intervenants arrive bientôt.",
    soon: true,
  },
];

const PourQuiSection = () => (
  <Section id="pour-qui">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Pour qui ?</Eyebrow>
      <SectionTitle>
        Éclosia est faite
        <br />
        <span className="italic text-primary-dark">pour toutes les familles.</span>
      </SectionTitle>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Peu importe qui porte, ce qui compte c'est de pouvoir déposer.
      </p>
    </motion.div>

    <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PROFILS.map((p, i) => (
        <motion.article
          key={p.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
          className="rounded-[1.75rem] border border-border/60 bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
        >
          <span className="text-2xl" aria-hidden="true">
            {p.emoji}
          </span>
          <h3 className="mt-4 flex items-center gap-2 font-serif text-lg leading-tight text-night">
            {p.title}
            {p.soon && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-dark">
                Bientôt
              </span>
            )}
          </h3>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
            {p.desc}
          </p>
        </motion.article>
      ))}
    </div>
  </Section>
);

export default PourQuiSection;
