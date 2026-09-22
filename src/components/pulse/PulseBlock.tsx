import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, LineChart, RotateCcw, Sparkles } from "lucide-react";
import { BRAIN_STATES, usePulseState } from "@/hooks/usePulseState";
import { useNextAction } from "@/hooks/useNextAction";
import { MASCOTS, mascotOf } from "@/data/pulseMascots";
import { toast } from "@/hooks/use-toast";
import PulseDictation from "@/components/pulse/PulseDictation";
import MascotAvatar from "@/components/pulse/MascotAvatar";

/**
 * PULSE — le moteur quotidien, posé en haut d'« Aujourd'hui ».
 * Deux gestes seulement : dire comment va ta tête, puis faire UNE chose.
 */
const PulseBlock = ({ onChange }: { onChange?: () => void }) => {
  const navigate = useNavigate();
  const { state, save } = usePulseState();
  const { next, remaining, complete, skip } = useNextAction(state);

  const hint = BRAIN_STATES.find((s) => s.id === state)?.hint;

  const handleDone = async () => {
    if (!next) return;
    await complete(next);
    toast({ description: "C'est fait. Tu peux respirer." });
    onChange?.();
  };

  return (
    <section className="rounded-[24px] border border-border/70 bg-card px-6 py-6">
      {/* 1 — État du cerveau du jour */}
      <p className="text-sm font-semibold text-foreground">
        Comment fonctionne ta tête aujourd'hui ?
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {BRAIN_STATES.map((s) => {
          const active = state === s.id;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => save(s.id)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-colors ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-secondary/30 hover:border-primary/40"
              }`}
            >
              <span className="text-base leading-none">{s.dot}</span>
              <span className="text-[11px] font-medium text-foreground">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        {hint ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
        ) : (
          <span />
        )}
        <Link
          to="/pulse/mon-rythme"
          className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-primary"
        >
          <LineChart className="h-3.5 w-3.5" strokeWidth={2} />
          Mon rythme
        </Link>
      </div>

      {/* 2 — Prochaine action : une seule, jamais une liste */}
      <div className="mt-6 rounded-[20px] border border-border/60 bg-secondary/25 px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          ⚡ Prochaine action
        </p>

        {state === "ko" ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-foreground">
              Aujourd'hui, rien n'est attendu de toi. Tenir, c'est déjà beaucoup.
            </p>
            <button
              onClick={() => navigate("/moi/apaisement")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Prendre 3 minutes pour moi
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        ) : next ? (
          <>
            <div className="mt-3 flex items-start gap-3">
              {mascotOf(next.domain) && (
                <MascotAvatar mascot={mascotOf(next.domain)} size={38} />
              )}
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug text-foreground">{next.label}</p>
                {next.who && (
                  <p className="mt-1 text-xs font-medium text-primary">pour {next.who}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {next.minutes} min
                  {next.learned ? " (d'après tes habitudes)" : ""}
                  {remaining > 1 ? ` · ${remaining - 1} autre${remaining > 2 ? "s" : ""} ensuite` : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => navigate(next.to)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
              >
                Je m'y mets
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              {next.completable && (
                <button
                  onClick={handleDone}
                  aria-label="C'est fait"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/70 text-foreground transition-transform active:scale-95"
                >
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
              <button
                onClick={() => skip(next)}
                aria-label="Plus tard"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-transform active:scale-95"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Rien ne t'attend pour l'instant 🌸
            </p>
            <Link
              to="/pulse/vider-ma-tete"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border/70 px-5 py-3 text-sm font-semibold text-foreground transition-transform active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Vider ma tête
            </Link>
          </>
        )}

        {/* 🎙️ Dictée vocale : parler plutôt que taper */}
        <PulseDictation onAdded={onChange} />
      </div>

      {/* 3 — L'équipe : six compagnons, six domaines */}
      <div className="mt-6">
        <p className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ton équipe
        </p>
        <div className="grid grid-cols-6 gap-2">
          {MASCOTS.map((m) => (
            <Link
              key={m.domain}
              to={m.to}
              aria-label={`${m.name} — ${m.label}`}
              className="flex flex-col items-center gap-1"
            >
              <MascotAvatar mascot={m} size={44} />
              <span className="text-[10px] leading-tight text-muted-foreground">{m.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PulseBlock;
