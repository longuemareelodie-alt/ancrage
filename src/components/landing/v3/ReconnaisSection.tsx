import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const CHARGES = [
  { emoji: "📅", label: "Les rendez-vous" },
  { emoji: "🩺", label: "Les traitements et suivis" },
  { emoji: "📂", label: "Les documents" },
  { emoji: "📝", label: "Les démarches" },
  { emoji: "🧠", label: "Les informations à retenir" },
  { emoji: "❤️", label: "Les émotions" },
  { emoji: "🌱", label: "Les routines" },
  { emoji: "🛒", label: "Les courses" },
  { emoji: "👨‍👩‍👧", label: "L'organisation familiale" },
];

const ReconnaisSection = () => (
  <Section id="probleme" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Est-ce que tu te reconnais ?</Eyebrow>
      <SectionTitle>
        Si tu as l'impression de tout porter,
        <br />
        <span className="italic text-primary-dark">Éclosia a été pensée pour toi.</span>
      </SectionTitle>
    </motion.div>

    <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3">
      {CHARGES.map(({ emoji, label }, i) => (
        <motion.li
          key={label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: i * 0.04 }}
          className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3.5 py-3 text-[13px] leading-snug text-foreground/85"
        >
          <span aria-hidden="true">{emoji}</span>
          {label}
        </motion.li>
      ))}
    </ul>

    <motion.div {...fadeUp} className="mx-auto mt-10 max-w-xl text-center">
      <p className="font-serif text-xl italic leading-relaxed text-night md:text-2xl">
        Le problème n'est pas que tu ne t'organises pas assez. C'est que tu dois
        retenir trop de choses, trop souvent.
      </p>
      <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
        Éclosia te permet de déposer une partie de cette charge dans un espace
        pensé pour ton quotidien.
      </p>
    </motion.div>
  </Section>
);

export default ReconnaisSection;
