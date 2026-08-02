import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import journalShot from "@/assets/showcase/journal.jpg.asset.json";
import portraitShot from "@/assets/showcase/portrait.jpg.asset.json";
import friseShot from "@/assets/showcase/frise.jpg.asset.json";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";

/**
 * Carrousel des écrans réels de l'application.
 * Uniquement de vraies captures : aucun écran inventé, aucune promesse
 * qui n'existe pas encore dans l'app.
 */
export type Screen = {
  src: string;
  label: string;
  caption: string;
};

export const SCREENS: Screen[] = [
  {
    src: dashboardShot.url,
    label: "🏠 Aujourd'hui",
    caption: "Ce qui compte aujourd'hui, et rien de plus.",
  },
  {
    src: journalShot.url,
    label: "📖 Journal",
    caption: "Un endroit où déposer ce que tu ne dis à personne.",
  },
  {
    src: portraitShot.url,
    label: "❤️ Moi",
    caption: "Ton portrait du mois, pour voir le chemin parcouru.",
  },
  {
    src: friseShot.url,
    label: "🕰️ Mon chemin",
    caption: "Ta frise d'évolution, pour te souvenir d'où tu viens.",
  },
];

const ScreensCarousel = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[i] as HTMLElement | undefined;
    if (!child) return;
    track.scrollTo({
      left: child.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const children = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let best = Infinity;
      children.forEach((c, i) => {
        const d = Math.abs(
          c.offsetLeft + c.clientWidth / 2 - track.offsetLeft - center,
        );
        if (d < best) {
          best = d;
          closest = i;
        }
      });
      setIndex(closest);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const go = (dir: -1 | 1) => {
    const next = Math.min(SCREENS.length - 1, Math.max(0, index + dir));
    scrollTo(next);
  };

  return (
    <Section id="ecrans" className="overflow-hidden">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Les écrans de l'application</Eyebrow>
        <SectionTitle>
          Chaque écran est pensé pour
          <br />
          <span className="italic text-primary-dark">t'enlever une charge.</span>
        </SectionTitle>
      </motion.div>

      <motion.div {...fadeUp} className="relative mt-16">
        <div
          ref={trackRef}
          role="group"
          aria-label="Captures d'écran d'Éclosia"
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SCREENS.map((s) => (
            <figure
              key={s.label}
              className="min-w-[78%] snap-center sm:min-w-[48%] lg:min-w-[31%]"
            >
              <div className="rounded-[2.25rem] border border-border/60 bg-night/95 p-2 shadow-[0_40px_100px_-45px_hsl(var(--night)/0.4)]">
                <div className="overflow-hidden rounded-[1.8rem] bg-card">
                  <img
                    src={s.src}
                    alt={`Éclosia — écran ${s.label.replace(/^\S+\s/, "")}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full"
                  />
                </div>
              </div>
              <figcaption className="mt-6 text-center">
                <span className="text-[13px] font-medium text-primary-dark">
                  {s.label}
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Écran précédent"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-background disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {SCREENS.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Aller à l'écran ${s.label}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? "w-6 bg-primary-dark/70" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === SCREENS.length - 1}
            aria-label="Écran suivant"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-background disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </Section>
  );
};

export default ScreensCarousel;
