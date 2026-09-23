import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const FAMILLES = [
  { emoji: "👩‍👧", label: "Parent", desc: "Un seul endroit pour tout ce que tu portes." },
  { emoji: "👨‍👩‍👧", label: "Deux parents", desc: "Les mêmes informations, partagées." },
  { emoji: "🏡", label: "Parent solo", desc: "Retrouver vite, décider moins souvent." },
  { emoji: "💛", label: "Grand-parent", desc: "Savoir quoi faire quand tu prends le relais." },
  {
    emoji: "🩺",
    label: "Famille accompagnée par plusieurs professionnels",
    desc: "Les suivis et documents rassemblés.",
  },
  {
    emoji: "🌱",
    label: "Famille avec un enfant ayant des besoins particuliers",
    desc: "Routines, supports et adaptations au quotidien.",
  },
];

const PourQuiV3 = () => (
  <Section id="pour-qui" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Pour qui ?</Eyebrow>
      <SectionTitle>
        Éclosia s'adapte
        <br />
        <span className="italic text-primary-dark">à des familles différentes.</span>
      </SectionTitle>
    </motion.div>

    <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FAMILLES.map(({ emoji, label, desc }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="rounded-2xl border border-border/60 bg-background p-5"
        >
          <span className="text-lg" aria-hidden="true">
            {emoji}
          </span>
          <p className="mt-2 text-sm font-medium leading-snug text-night">{label}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {desc}
          </p>
        </motion.div>
      ))}
    </div>

    <motion.p
      {...fadeUp}
      className="mx-auto mt-8 max-w-2xl text-center text-[14px] leading-relaxed text-muted-foreground"
    >
      Éclosia n'est pas réservée aux familles concernées par l'autisme ou un
      trouble du neurodéveloppement. Elle est simplement particulièrement utile
      quand le quotidien implique davantage de suivis, de routines, de documents
      ou d'adaptations.
    </motion.p>
  </Section>
);

export default PourQuiV3;
