import { motion } from "framer-motion";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const AVANT = [
  "Informations dispersées",
  "Documents dans plusieurs endroits",
  "Rendez-vous oubliés ou difficiles à retrouver",
  "Routines à refaire sans arrêt",
  "Beaucoup de choses à garder en tête",
  "Tout repose sur une seule personne",
];

const APRES = [
  "Informations centralisées",
  "Documents accessibles au même endroit",
  "Rendez-vous visibles",
  "Supports créés rapidement",
  "Quotidien plus lisible",
  "Plusieurs adultes peuvent partager certaines informations",
];

const AvantApresSection = () => (
  <Section id="avant-apres">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Ce que ça change</Eyebrow>
      <SectionTitle>
        Avant Éclosia,
        <br />
        <span className="italic text-primary-dark">et avec Éclosia.</span>
      </SectionTitle>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Éclosia ne fait pas disparaître la charge mentale. Elle aide à la
        réduire, à centraliser et à retrouver plus vite ce qui compte.
      </p>
    </motion.div>

    <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
      <motion.div
        {...fadeUp}
        className="rounded-[1.75rem] border border-border/60 bg-card p-6"
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Avant
        </h3>
        <ul className="mt-4 space-y-2.5">
          {AVANT.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-muted-foreground">
              <Minus className="mt-1 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>
      </motion.div>

      <ArrowRight
        className="mx-auto hidden h-6 w-6 text-primary-dark/70 md:block"
        aria-hidden="true"
      />

      <motion.div
        {...fadeUp}
        className="rounded-[1.75rem] border border-primary/30 bg-card p-6 shadow-[0_24px_70px_-40px_hsl(var(--night)/0.3)]"
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
          Avec Éclosia
        </h3>
        <ul className="mt-4 space-y-2.5">
          {APRES.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-foreground/85">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary-dark" aria-hidden="true" />
              </span>
              {a}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  </Section>
);

export default AvantApresSection;
