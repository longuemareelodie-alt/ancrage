import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const CAS = [
  {
    probleme: "« Demain, rendez-vous chez le dentiste. »",
    outil: "Histoire sociale",
    resultat:
      "Tu crées un petit support qui raconte le rendez-vous étape par étape, pour le préparer ensemble avant d'y aller.",
  },
  {
    probleme: "« Le matin est compliqué. »",
    outil: "Routine visuelle",
    resultat:
      "Une suite d'étapes claires, affichable et imprimable, que ton enfant peut suivre sans qu'on répète dix fois.",
  },
  {
    probleme: "« Je cherche l'ordonnance. »",
    outil: "Coffre-fort et documents",
    resultat:
      "Les ordonnances, comptes rendus et courriers sont rangés au même endroit et retrouvés en quelques secondes.",
  },
  {
    probleme: "« Nous sommes plusieurs à gérer le quotidien. »",
    outil: "Partage familial",
    resultat:
      "Tu peux partager certaines informations avec un proche, pour ne plus être la seule à tout savoir.",
  },
  {
    probleme: "« J'ai besoin de déposer ce que je ressens. »",
    outil: "Journal",
    resultat:
      "Un espace privé pour écrire ou dicter ce que tu vis, sans jugement et sans que personne d'autre le lise.",
  },
];

const CasUsageSection = () => (
  <Section id="cas-usage" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Cas d'usage</Eyebrow>
      <SectionTitle>
        Éclosia
        <br />
        <span className="italic text-primary-dark">dans la vraie vie.</span>
      </SectionTitle>
    </motion.div>

    <div className="mx-auto mt-9 max-w-3xl space-y-3">
      {CAS.map(({ probleme, outil, resultat }, i) => (
        <motion.article
          key={probleme}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="rounded-[1.5rem] border border-border/60 bg-background p-5 md:p-6"
        >
          <h3 className="font-serif text-lg italic leading-snug text-night">
            {probleme}
          </h3>
          <p className="mt-2 inline-flex rounded-full bg-primary/12 px-3 py-1 text-[12px] font-medium text-primary-dark">
            {outil}
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            {resultat}
          </p>
        </motion.article>
      ))}
    </div>
  </Section>
);

export default CasUsageSection;
