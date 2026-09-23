import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";
import demoVideo from "@/assets/video/eclosia-demo-son.mp4.asset.json";

/**
 * Démonstration.
 * Vidéo courte (32 s) : la visite de la version 2, portée par PULSE.
 */
export const DEMO_VIDEO_URL = demoVideo.url;
const DEMO_POSTER_URL = dashboardShot.url;


const STEPS = [
  "Ouverture d'Éclosia",
  "⚡ Le bloc PULSE",
  "Comment va ta tête aujourd'hui ?",
  "Ta prochaine action",
  "🎙️ La dictée vocale",
  "Six compagnons",
  "Mon rythme jour après jour",
  "🏠 Aujourd'hui",
  "👨‍👩‍👧 Profil de l'enfant",
  "📄 Documents",
  "🌱 Studio d'Autonomie",
];

const TOUR = [
  {
    step: "1",
    space: "⚡ PULSE",
    title: "Tu dis comment va ta tête",
    text: "GO, Moyen, Saturé ou KO : un seul geste. Éclosia adapte la journée à ta réserve du jour, sans jamais te noter.",
    example: "« Tête saturée aujourd'hui — on garde une seule chose, courte. »",
  },
  {
    step: "2",
    space: "🎯 Ta prochaine action",
    title: "Une seule chose à la fois",
    text: "Tes tâches, rendez-vous et papiers sont déjà là. Éclosia en sort une, à ta mesure, avec le compagnon qui la porte. Terminée, la suivante arrive seule.",
    example: "« Renard · administratif — Envoyer le dossier MDPH, ~10 minutes. »",
  },
  {
    step: "3",
    space: "🎙️ La dictée vocale",
    title: "Tu parles, ça s'écrit tout seul",
    text: "Une tâche, un rendez-vous, une émotion : tu appuies sur le micro, tu parles, c'est rangé au bon endroit. Et ta courbe garde la trace de tes journées.",
    example: "« C'est noté. Tu n'as plus à y penser. »",
  },
];

const MiniTour = () => (
  <motion.div {...fadeUp} className="mx-auto mt-8 max-w-3xl">
    <ol className="grid gap-3 md:grid-cols-3">
      {TOUR.map(({ step, space, title }, i) => (
        <motion.li
          key={step}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary-dark">
            {step}
          </span>
          <span className="text-sm leading-snug text-foreground/85">
            {title}
            <span className="text-muted-foreground"> · {space}</span>
          </span>
        </motion.li>
      ))}
    </ol>
  </motion.div>
);

const DemoSection = () => (
  <Section id="demonstration" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>La démonstration</Eyebrow>
      <SectionTitle>
        Voir Éclosia
        <br />
        <span className="italic text-primary-dark">avant de lire la page.</span>
      </SectionTitle>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Quarante secondes, avec le son : tu dis comment va ta tête, Éclosia sort
        une seule action.
      </p>
    </motion.div>

    <motion.div {...fadeUp} className="mx-auto mt-6 max-w-[230px] sm:max-w-[280px]">
      <div className="relative">
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
        <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background p-1.5 shadow-[0_30px_80px_-40px_hsl(var(--night)/0.35)]">
          {DEMO_VIDEO_URL ? (
            <video
              className="w-full rounded-[1.2rem]"
              controls
              playsInline
              preload="metadata"
              poster={DEMO_POSTER_URL}
            >
              <source src={DEMO_VIDEO_URL} type="video/mp4" />
              Ton navigateur ne peut pas lire cette vidéo.
            </video>
          ) : (
            <div className="rounded-[1.6rem] bg-card px-6 py-12 md:px-12">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <PlayCircle
                  className="h-10 w-10 text-primary-dark/70"
                  aria-hidden="true"
                />
                <p className="mt-5 font-serif text-xl leading-snug text-night md:text-2xl">
                  La visite guidée en vidéo arrive très bientôt.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  En attendant, voilà exactement ce qu'elle te montrera, dans
                  l'ordre.
                </p>
              </div>

              <ol className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
                {STEPS.map((s, i) => (
                  <motion.li
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="rounded-full border border-border/60 bg-background px-4 py-2 text-[13px] text-foreground/80"
                  >
                    {s}
                  </motion.li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </motion.div>

    <MiniTour />
  </Section>
);

export default DemoSection;
