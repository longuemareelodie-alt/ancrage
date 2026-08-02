import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";

/**
 * Démonstration.
 * Dès qu'une vidéo de 60 à 90 s est déposée dans le projet, on renseigne
 * DEMO_VIDEO_URL (et éventuellement DEMO_POSTER_URL) : la section affiche
 * alors le lecteur. Tant qu'elle n'existe pas, on montre honnêtement le
 * déroulé de la visite guidée plutôt qu'un lecteur vide.
 */
export const DEMO_VIDEO_URL = "";
const DEMO_POSTER_URL = dashboardShot.url;

const STEPS = [
  "Ouverture d'Éclosia",
  "🏠 Aujourd'hui",
  "👨‍👩‍👧 Profil de l'enfant",
  "📖 Journal",
  "😊 Émotions",
  "📄 Documents",
  "🌱 Studio d'Autonomie",
  "Création d'une routine",
  "Création d'une histoire sociale",
  "Export PDF",
  "🤍 Assistant Éclosia",
];

const DemoSection = () => (
  <Section id="demonstration" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>La démonstration</Eyebrow>
      <SectionTitle>
        Voir Éclosia
        <br />
        <span className="italic text-primary-dark">avant de lire la page.</span>
      </SectionTitle>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Une visite calme de l'application, du premier écran jusqu'à la création
        d'un support pour ton enfant.
      </p>
    </motion.div>

    <motion.div {...fadeUp} className="mx-auto mt-14 max-w-4xl">
      <div className="relative">
        <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-background p-2 shadow-[0_50px_120px_-45px_hsl(var(--night)/0.35)]">
          {DEMO_VIDEO_URL ? (
            <video
              className="w-full rounded-[1.6rem]"
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
  </Section>
);

export default DemoSection;
