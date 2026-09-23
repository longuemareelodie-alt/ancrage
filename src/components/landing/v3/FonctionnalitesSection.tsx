import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const CATEGORIES = [
  {
    emoji: "🏠",
    titre: "Organiser",
    benefice: "Tout ce qui doit être fait au même endroit, sans y penser tout le temps.",
    items: ["Agenda", "Tâches", "Rappels", "Courses", "Notes"],
  },
  {
    emoji: "🩺",
    titre: "Suivre",
    benefice: "Les suivis, traitements et documents retrouvés en quelques secondes.",
    items: ["Rendez-vous", "Traitements", "Informations santé", "Documents"],
  },
  {
    emoji: "🌱",
    titre: "Accompagner",
    benefice: "Créer un support concret quand une situation se répète.",
    items: [
      "Routines",
      "Histoires sociales",
      "Check-lists",
      "Cartes visuelles",
      "Emplois du temps",
      "Supports PDF",
    ],
  },
  {
    emoji: "❤️",
    titre: "Prendre soin de soi",
    benefice: "Un espace pour toi, privé, où déposer ce que tu vis.",
    items: ["Journal", "Check-ins", "Portrait mensuel", "Frise d'évolution"],
  },
  {
    emoji: "👨‍👩‍👧",
    titre: "Famille",
    benefice: "Ne plus être la seule personne à tout savoir.",
    items: ["Partage d'informations", "Proches", "Organisation familiale"],
  },
  {
    emoji: "📊",
    titre: "Piloter",
    benefice: "Des repères doux pour voir comment vont les journées.",
    items: ["Statistiques", "Habitudes", "Repères"],
  },
];

const FonctionnalitesSection = () => (
  <Section id="fonctionnalites">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Ce qui est inclus</Eyebrow>
      <SectionTitle>
        Six familles d'outils,
        <br />
        <span className="italic text-primary-dark">un seul espace.</span>
      </SectionTitle>
    </motion.div>

    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map(({ emoji, titre, benefice, items }, i) => (
        <motion.article
          key={titre}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="rounded-[1.5rem] border border-border/60 bg-card p-6"
        >
          <span className="text-xl" aria-hidden="true">
            {emoji}
          </span>
          <h3 className="mt-3 font-serif text-lg leading-tight text-night">{titre}</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {benefice}
          </p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {items.map((it) => (
              <li
                key={it}
                className="rounded-full border border-border/50 bg-background px-3 py-1 text-[12px] text-foreground/80"
              >
                {it}
              </li>
            ))}
          </ul>
        </motion.article>
      ))}
    </div>

    <motion.p
      {...fadeUp}
      className="mx-auto mt-8 max-w-xl text-center text-[13px] leading-relaxed text-muted-foreground"
    >
      Éclosia n'est pas un dispositif médical et ne remplace pas un médecin, un
      professionnel de santé, un accompagnement psychologique ou juridique.
    </motion.p>
  </Section>
);

export default FonctionnalitesSection;
