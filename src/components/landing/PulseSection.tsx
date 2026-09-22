import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "./primitives";
import { MASCOTS } from "@/data/pulseMascots";
import { BRAIN_STATES } from "@/hooks/usePulseState";
import { STATE_COLOR } from "@/hooks/usePulseHistory";
import MascotAvatar from "@/components/pulse/MascotAvatar";

/**
 * PULSE sur la page de vente : l'état du jour, UNE seule action,
 * les compagnons, et le suivi « Mon rythme » (courbe + aperçu du mois).
 * Rien d'inventé : tout existe dans l'application.
 */

// Petite courbe illustrative, dessinée à la main (aucune donnée réelle).
const CURVE = [3, 2, 4, 2, 1, 3, 4, 3, 2, 3, 4, 4];
const path = CURVE.map((v, i) => {
  const x = (i / (CURVE.length - 1)) * 300;
  const y = 90 - ((v - 1) / 3) * 74;
  return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ");

const MONTH_DEMO: (keyof typeof STATE_COLOR | null)[] = [
  "moyen", "go", "sature", "moyen", null, "go", "go",
  "ko", "sature", "moyen", "go", "moyen", null, "go",
  "moyen", "moyen", "go", "sature", "ko", "moyen", "go",
  "go", "moyen", null, "sature", "moyen", "go", "go",
];

const PulseSection = () => (
  <Section id="pulse" className="bg-night/[0.03]">
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <motion.div {...fadeUp}>
        <Eyebrow>Le moteur du quotidien</Eyebrow>
        <SectionTitle>
          Tu dis comment va ta tête.
          <br />
          <span className="italic text-primary-dark">Éclosia fait le tri.</span>
        </SectionTitle>
        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Chaque matin, une seule question : GO, Moyen, Saturé ou KO. Selon ta réponse,
          Éclosia te propose <strong className="font-medium text-night">une seule prochaine action</strong> —
          jamais une liste. Les jours KO, rien n'est attendu de toi.
        </p>
        <ul className="mt-7 space-y-3 text-[15px] leading-relaxed text-night/90">
          <li>Dicte ce que tu as en tête, ça s'écrit tout seul.</li>
          <li>Six compagnons veillent chacun sur un domaine de ta vie.</li>
          <li>
            Ton suivi « Mon rythme » garde la trace de tes journées, en courbe et mois par mois.
          </li>
        </ul>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BRAIN_STATES.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: STATE_COLOR[s.id] }}
              />
              <span className="text-[13px] font-medium text-night">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {MASCOTS.map((m) => (
            <div key={m.domain} className="flex flex-col items-center gap-1">
              <MascotAvatar mascot={m} size={46} />
              <span className="text-[11px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeUp} className="space-y-5">
        <div className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[0_40px_100px_-55px_hsl(var(--night)/0.35)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Mon rythme — ces 30 derniers jours
          </p>
          <svg
            viewBox="0 0 300 100"
            role="img"
            aria-label="Courbe illustrative des états jour après jour"
            className="mt-5 w-full"
          >
            <defs>
              <linearGradient id="landingPulse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[16, 41, 65, 90].map((y) => (
              <line
                key={y}
                x1="0"
                x2="300"
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            ))}
            <path d={`${path} L300 100 L0 100 Z`} fill="url(#landingPulse)" />
            <path
              d={path}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
            <span>KO</span>
            <span>Saturé</span>
            <span>Moyen</span>
            <span>GO</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/60 bg-card p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            L'aperçu du mois
          </p>
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {MONTH_DEMO.map((s, i) => (
              <span
                key={i}
                className="aspect-square rounded-lg"
                style={{ background: s ? STATE_COLOR[s] : "hsl(var(--border))" }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Une courbe qui descend n'est pas un échec : c'est une information. Tu vois enfin
            tes vraies saisons, sans te juger.
          </p>
        </div>
      </motion.div>
    </div>
  </Section>
);

export default PulseSection;
