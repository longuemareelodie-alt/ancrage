import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrisisScenario, CrisisContext, CrisisParent, CrisisSituation, SITUATION_LABELS } from "@/data/criseScenarios";

type Props = {
  scenario: CrisisScenario;
  context: CrisisContext;
  parent: CrisisParent;
  situation: CrisisSituation;
  onClose: () => void;
};

const SAFETY_CHECKLIST: { key: string; label: string }[] = [
  { key: "danger", label: "J'ai écarté les dangers immédiats (objets, route, escaliers)" },
  { key: "fratrie", label: "Les autres enfants sont en sécurité" },
  { key: "stimuli", label: "J'ai réduit les stimuli (bruit, lumière, vêtements)" },
  { key: "respire", label: "J'ai pris 3 respirations profondes" },
];

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const r = (s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
}

const CONTEXT_LABEL: Record<CrisisContext, string> = {
  maison: "À la maison",
  exterieur: "À l'extérieur",
};
const PARENT_LABEL: Record<CrisisParent, string> = {
  maman: "Maman seule",
  papa: "Papa seul",
  deux: "Les deux présents",
};

export default function CriseGuided({ scenario, context, parent, situation, onClose }: Props) {
  type Phase = "safety" | "steps" | "recap";
  const [phase, setPhase] = useState<Phase>("safety");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [stepIdx, setStepIdx] = useState(0);
  const [doneSteps, setDoneSteps] = useState<boolean[]>(() => scenario.steps.map(() => false));

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const startedAt = useRef<number>(Date.now());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const allChecked = SAFETY_CHECKLIST.every((c) => checks[c.key]);
  const canNext = stepIdx < scenario.steps.length - 1;
  const canPrev = stepIdx > 0;

  const completedCount = doneSteps.filter(Boolean).length;
  const totalDuration = useMemo(() => seconds, [phase === "recap"]); // capture at recap

  function toggleStep(i: number) {
    setDoneSteps((arr) => arr.map((v, k) => (k === i ? !v : v)));
  }

  function startSteps() {
    setPhase("steps");
    startedAt.current = Date.now();
    setSeconds(0);
    setRunning(true);
  }

  function finish() {
    setRunning(false);
    setPhase("recap");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-background/95 backdrop-blur">
      <div className="flex h-full w-full max-w-xl flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[hsl(var(--lies))]" />
            <span className="font-serif text-base text-foreground">Mode crise</span>
          </div>
          <div className="flex items-center gap-3">
            {phase === "steps" && (
              <>
                <span className="font-mono text-sm tabular-nums text-foreground">{fmt(seconds)}</span>
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={running ? "Pause" : "Reprendre"}
                >
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </>
            )}
            <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:text-foreground" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {phase === "safety" && (
            <div>
              <h2 className="mb-1 font-serif text-2xl text-foreground">Avant tout, sécurité</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Cochez ce qui est fait. On ne passe à l'étape suivante qu'une fois ces points couverts.
              </p>
              <ul className="space-y-2">
                {SAFETY_CHECKLIST.map((c) => {
                  const on = !!checks[c.key];
                  return (
                    <li key={c.key}>
                      <button
                        onClick={() => setChecks((p) => ({ ...p, [c.key]: !on }))}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                          on
                            ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]"
                            : "border-border bg-card hover:border-[hsl(var(--lies))]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            on
                              ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                              : "border-border bg-background"
                          }`}
                        >
                          {on && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-sm text-foreground">{c.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {phase === "steps" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Étape {stepIdx + 1} / {scenario.steps.length}
                </span>
                <span className="text-xs text-muted-foreground">{completedCount} faites</span>
              </div>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[hsl(var(--lies))] transition-all"
                  style={{ width: `${((stepIdx + 1) / scenario.steps.length) * 100}%` }}
                />
              </div>

              <div className="rounded-2xl border border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] p-5">
                <p className="font-serif text-xl leading-snug text-foreground">{scenario.steps[stepIdx]}</p>
                <button
                  onClick={() => toggleStep(stepIdx)}
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
                    doneSteps[stepIdx]
                      ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                      : "border border-[hsl(var(--lies))] text-foreground hover:bg-[hsl(var(--lies-soft))]"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {doneSteps[stepIdx] ? "Fait" : "Marquer comme fait"}
                </button>
              </div>

              <div className="mt-3 text-center text-xs text-muted-foreground">
                Respirez. Vous n'avez pas à tout faire vite.
              </div>
            </div>
          )}

          {phase === "recap" && (
            <div>
              <h2 className="mb-1 font-serif text-2xl text-foreground">Vous avez tenu.</h2>
              <p className="mb-5 text-sm text-muted-foreground">Voici ce qui vient de se passer.</p>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-card p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Durée</div>
                  <div className="mt-1 font-mono text-2xl tabular-nums text-foreground">{fmt(totalDuration)}</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Étapes</div>
                  <div className="mt-1 text-2xl text-foreground">
                    {completedCount}<span className="text-base text-muted-foreground">/{scenario.steps.length}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Contexte</div>
                <div className="text-sm text-foreground">
                  {CONTEXT_LABEL[context]} · {PARENT_LABEL[parent]}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{SITUATION_LABELS[situation]}</div>
              </div>

              <section className="mb-3 rounded-2xl border border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] p-4">
                <h3 className="mb-2 font-serif text-lg text-foreground">Maintenant, pour l'enfant</h3>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {scenario.apresEnfant.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </section>
              <section className="mb-3 rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-2 font-serif text-lg text-foreground">Pour la fratrie</h3>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {scenario.apresFratrie.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </section>
              <section className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-2 font-serif text-lg text-foreground">Pour vous</h3>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {scenario.apresParent.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-4 py-3">
          {phase === "safety" && (
            <Button
              onClick={startSteps}
              disabled={!allChecked}
              className="w-full bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))] hover:bg-[hsl(var(--lies)/0.9)] disabled:opacity-50"
            >
              Démarrer le guidage
            </Button>
          )}
          {phase === "steps" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={!canPrev}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {canNext ? (
                <Button
                  onClick={() => setStepIdx((i) => i + 1)}
                  className="flex-1 bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))] hover:bg-[hsl(var(--lies)/0.9)]"
                >
                  Étape suivante
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={finish}
                  className="flex-1 bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))] hover:bg-[hsl(var(--lies)/0.9)]"
                >
                  Terminer
                  <Check className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {phase === "recap" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("safety");
                  setChecks({});
                  setStepIdx(0);
                  setDoneSteps(scenario.steps.map(() => false));
                  setSeconds(0);
                  setRunning(true);
                }}
                className="px-3"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))] hover:bg-[hsl(var(--lies)/0.9)]"
              >
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
