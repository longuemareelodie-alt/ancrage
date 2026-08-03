import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";
import demoVideo from "@/assets/video/eclosia-demo.mp4.asset.json";

/**
 * Démonstration.
 * Vidéo courte (19 s) : une visite calme et rythmée d'Éclosia.
 */
export const DEMO_VIDEO_URL = demoVideo.url;
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

const TOUR = [
  {
    step: "1",
    space: "🏠 Aujourd'hui",
    title: "Tu ouvres l'app, tout est déjà là",
    text: "Le rendez-vous ORL de jeudi, la facture de cantine à régler, et un mot doux si la journée a été rude. Rien à chercher, rien à cocher.",
    example: "« Jeudi 14 h — ORL de Léa. Le carnet de santé est déjà prêt à emporter. »",
  },
  {
    step: "2",
    space: "🌱 Autonomie",
    title: "Tu fabriques un support en deux minutes",
    text: "Tu choisis un moment difficile, Éclosia écrit la routine avec les mots de ton enfant. Tu ajustes, tu imprimes en A5 pour le frigo.",
    example: "« Routine du soir de Léa : pyjama, dents, histoire, câlin. » — prête en PDF.",
  },
  {
    step: "3",
    space: "❤️ Moi · 👨‍👩‍👧 Famille",
    title: "Tu déposes ta charge, l'app s'en souvient",
    text: "Une émotion en un geste, une ordonnance photographiée, un document rangé dans le coffre-fort. Le mois prochain, tu verras le chemin parcouru.",
    example: "« Ordonnance de mars ajoutée — renouvellement à prévoir vers le 12 juin. »",
  },
];

const MiniTour = () => (
  <motion.div {...fadeUp} className="mx-auto mt-16 max-w-4xl">
    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
      La visite en 3 étapes
    </p>
    <ol className="mt-8 grid gap-5 md:grid-cols-3">
      {TOUR.map(({ step, space, title, text, example }, i) => (
        <motion.li
          key={step}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col rounded-3xl border border-border/60 bg-background p-6 shadow-[0_30px_70px_-55px_hsl(var(--night)/0.5)]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary-dark">
              {step}
            </span>
            <span className="text-[13px] font-medium text-muted-foreground">
              {space}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-lg leading-snug text-night">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {text}
          </p>
          <p className="mt-4 rounded-2xl bg-secondary/40 px-4 py-3 text-[13px] italic leading-relaxed text-foreground/80">
            {example}
          </p>
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
              autoPlay
              muted
              loop
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
