import { motion } from "framer-motion";
import {
  CalendarDays,
  ListChecks,
  Images,
  Trophy,
  BookHeart,
  FileDown,
} from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import portraitShot from "@/assets/showcase/portrait.jpg.asset.json";
import friseShot from "@/assets/showcase/frise.jpg.asset.json";

const CREATIONS = [
  {
    icon: ListChecks,
    title: "Des routines",
    desc: "Le matin, le soir, le retour d'école — étape par étape, avec des images.",
  },
  {
    icon: BookHeart,
    title: "Des histoires sociales",
    desc: "Pour préparer en douceur une visite, un changement, un rendez-vous.",
  },
  {
    icon: ListChecks,
    title: "Des check-lists",
    desc: "Ce qu'il faut faire, sans avoir à le répéter dix fois.",
  },
  {
    icon: Trophy,
    title: "Des tableaux de récompenses",
    desc: "Encourager sans pression, à son rythme.",
  },
  {
    icon: Images,
    title: "Des cartes visuelles",
    desc: "Pour dire ce qui est difficile à dire avec des mots.",
  },
  {
    icon: CalendarDays,
    title: "Des emplois du temps",
    desc: "La journée devient lisible d'un seul regard.",
  },
];

const StudioSection = () => (
  <Section id="studio">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>🌱 Studio d'Autonomie</Eyebrow>
      <SectionTitle>
        Le Studio
        <br />
        <span className="italic text-primary-dark">d'Autonomie.</span>
      </SectionTitle>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Créer un support adapté à ton enfant ne devrait pas prendre ta soirée.
        Ici, ça prend quelques minutes — et tu l'imprimes juste après.
      </p>
    </motion.div>

    <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CREATIONS.map(({ icon: Icon, title, desc }, i) => (
        <motion.article
          key={title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.05 }}
          className="rounded-[1.5rem] border border-border/60 bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_hsl(var(--night)/0.2)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
            <Icon className="h-5 w-5 text-primary-dark" aria-hidden="true" />
          </div>
          <h3 className="mt-5 font-serif text-lg leading-tight text-night">
            {title}
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {desc}
          </p>
        </motion.article>
      ))}
    </div>

    <motion.div
      {...fadeUp}
      className="mt-16 grid items-center gap-12 md:grid-cols-2 md:gap-16"
    >
      <div className="grid grid-cols-2 gap-4">
        {[portraitShot.url, friseShot.url].map((src, i) => (
          <div
            key={src}
            className={`overflow-hidden rounded-[1.75rem] border border-border/60 bg-card p-2 ${
              i === 1 ? "translate-y-6" : ""
            }`}
          >
            <img
              src={src}
              alt="Support créé dans le Studio d'Autonomie d'Éclosia"
              loading="lazy"
              decoding="async"
              className="w-full rounded-[1.4rem]"
            />
          </div>
        ))}
      </div>

      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-[12px] font-medium text-primary-dark">
          <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
          Export PDF A4 et A5
        </div>
        <p className="mt-6 font-serif text-2xl leading-snug text-night md:text-3xl">
          Tu crées. Tu exportes. Tu l'affiches sur le frigo.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Les supports sont mis en page automatiquement, avec des marges
          propres et des visuels doux. Rien à ajuster, rien à recommencer.
        </p>
      </div>
    </motion.div>
  </Section>
);

export default StudioSection;
