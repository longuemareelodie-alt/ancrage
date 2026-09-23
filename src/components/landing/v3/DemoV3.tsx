import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import { DEMO_VIDEO_URL } from "../DemoSection";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";
import { track } from "@/lib/landingAnalytics";

const ETAPES = [
  "L'écran Aujourd'hui",
  "Un rendez-vous",
  "Le Studio d'Autonomie",
  "Une routine créée",
  "L'export PDF",
  "Les documents",
  "Le journal",
  "La vue familiale",
];

const DemoV3 = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => (
  <Section id="demonstration" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>La démonstration</Eyebrow>
      <SectionTitle>
        Regarde Éclosia
        <br />
        <span className="italic text-primary-dark">en action.</span>
      </SectionTitle>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Une visite de l'application en moins d'une minute.
      </p>
    </motion.div>

    <motion.div {...fadeUp} className="mx-auto mt-7 max-w-[250px] sm:max-w-[300px]">
      <div className="relative">
        <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
        <div className="overflow-hidden rounded-[1.6rem] border border-border/60 bg-background p-1.5 shadow-[0_30px_80px_-40px_hsl(var(--night)/0.35)]">
          <video
            className="w-full rounded-[1.3rem]"
            controls
            playsInline
            preload="none"
            poster={dashboardShot.url}
            onPlay={() => track("demo_video_start")}
            onEnded={() => track("demo_video_complete")}
          >
            <source src={DEMO_VIDEO_URL} type="video/mp4" />
            Ton navigateur ne peut pas lire cette vidéo.
          </video>
        </div>
      </div>
    </motion.div>

    <motion.ul
      {...fadeUp}
      className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2"
    >
      {ETAPES.map((e) => (
        <li
          key={e}
          className="rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-[12.5px] text-foreground/80"
        >
          {e}
        </li>
      ))}
    </motion.ul>

    <motion.div {...fadeUp} className="mx-auto mt-8 max-w-xl text-center">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Pas besoin de nous croire sur parole. Regarde simplement comment ça
        fonctionne.
      </p>
      <button
        onClick={() => {
          track("checkout_start", { from: "demo" });
          onCTA();
        }}
        disabled={loading}
        className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-full bg-night px-7 text-[15px] font-medium text-night-foreground transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
      >
        Je veux découvrir Éclosia
      </button>
    </motion.div>
  </Section>
);

export default DemoV3;
