import { useEffect, useMemo, useState } from "react";
import { Download, PlayCircle, ShieldAlert, Trash2 } from "lucide-react";
import CriseGuided, { listSavedSessions, clearSavedFor, sessionKey } from "@/components/lies/CriseGuided";
import { jsPDF } from "jspdf";
import LiesShell from "@/components/lies/LiesShell";
import {
  CrisisContext,
  CrisisParent,
  CrisisSituation,
  CRISIS_TROUBLES_COVERED,
  SITUATION_LABELS,
  getScenario,
} from "@/data/criseScenarios";
import { Button } from "@/components/ui/button";

const CTX_OPTIONS: { value: CrisisContext; label: string }[] = [
  { value: "maison", label: "À la maison" },
  { value: "exterieur", label: "À l'extérieur" },
];
const PARENT_OPTIONS: { value: CrisisParent; label: string }[] = [
  { value: "maman", label: "Maman seule" },
  { value: "papa", label: "Papa seul" },
  { value: "deux", label: "Les deux présents" },
];
const SITUATION_OPTIONS: CrisisSituation[] = [
  "un-enfant-avec-fratrie",
  "plusieurs-en-crise",
  "exterieur-seul-plusieurs",
];

function downloadHelpCard() {
  const doc = new jsPDF({ unit: "mm", format: "a6", orientation: "portrait" });
  doc.setFillColor(125, 184, 159);
  doc.rect(0, 0, 105, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("MON ENFANT A BESOIN D'AIDE", 8, 11);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(9);
  let y = 26;
  const lines = [
    "Mon enfant vit une crise neurologique / sensorielle.",
    "Ce n'est PAS un caprice.",
    "",
    "Merci de :",
    "• Garder son calme et baisser la voix",
    "• Ne pas lui parler ni le toucher sans demander",
    "• Réduire les bruits / lumières si possible",
    "• Donner de l'espace autour de nous",
    "",
    "La crise dure quelques minutes.",
    "Je gère la situation. Merci pour votre patience.",
  ];
  for (const l of lines) {
    doc.text(l, 8, y);
    y += 5;
  }
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("Carte fournie par Ancrage — digitalmamanlibre.com", 8, 142);
  doc.save("carte-aide-crise.pdf");
}

const CrisePage = () => {
  const [ctx, setCtx] = useState<CrisisContext>("maison");
  const [parent, setParent] = useState<CrisisParent>("maman");
  const [situation, setSituation] = useState<CrisisSituation>("un-enfant-avec-fratrie");
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [sessionsTick, setSessionsTick] = useState(0);

  const scenario = useMemo(() => getScenario(ctx, parent, situation), [ctx, parent, situation]);

  const savedSessions = useMemo(() => listSavedSessions(), [sessionsTick, guidedOpen]);
  const currentKey = sessionKey(ctx, parent, situation);

  useEffect(() => {
    const onFocus = () => setSessionsTick((n) => n + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function parseKey(k: string): { context: CrisisContext; parent: CrisisParent; situation: CrisisSituation } | null {
    const [c, p, s] = k.split("|");
    if (!c || !p || !s) return null;
    return { context: c as CrisisContext, parent: p as CrisisParent, situation: s as CrisisSituation };
  }

  function resumeSession(k: string) {
    const parsed = parseKey(k);
    if (!parsed) return;
    setCtx(parsed.context);
    setParent(parsed.parent);
    setSituation(parsed.situation);
    setGuidedOpen(true);
  }

  function deleteSession(k: string) {
    clearSavedFor(k);
    setSessionsTick((n) => n + 1);
  }

  return (
    <LiesShell
      title="Gérer une crise"
      subtitle="Des étapes claires pour tenir, sans perdre le fil."
      icon={<ShieldAlert className="h-6 w-6" />}
    >
      <div className="mb-5 space-y-3 rounded-2xl border border-border bg-card p-4">
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Contexte</div>
          <div className="flex flex-wrap gap-2">
            {CTX_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setCtx(o.value)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  ctx === o.value
                    ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                    : "border border-border text-muted-foreground hover:border-[hsl(var(--lies))]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Profil parent</div>
          <div className="flex flex-wrap gap-2">
            {PARENT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setParent(o.value)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  parent === o.value
                    ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                    : "border border-border text-muted-foreground hover:border-[hsl(var(--lies))]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Situation</div>
          <div className="flex flex-col gap-2">
            {SITUATION_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={`rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  situation === s
                    ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                    : "border border-border text-muted-foreground hover:border-[hsl(var(--lies))]"
                }`}
              >
                {SITUATION_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <Button
          onClick={() => setGuidedOpen(true)}
          className="w-full bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))] py-6 text-base"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Lancer le mode crise guidé
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Étapes plein écran, minuteur, checklist sécurité.
        </p>
      </div>

      {savedSessions.length > 0 && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-1 font-serif text-base text-foreground">Sessions en cours</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Chaque combinaison contexte / parent / situation est sauvegardée séparément.
          </p>
          <ul className="space-y-2">
            {savedSessions.map(({ key, saved }) => {
              const parsed = parseKey(key);
              if (!parsed) return null;
              const ctxLabel = CTX_OPTIONS.find((o) => o.value === parsed.context)?.label ?? parsed.context;
              const parentLabel = PARENT_OPTIONS.find((o) => o.value === parsed.parent)?.label ?? parsed.parent;
              const situationLabel = SITUATION_LABELS[parsed.situation];
              const phaseLabel =
                saved.phase === "safety" ? "Sécurité" :
                saved.phase === "steps" ? `Étape ${saved.stepIdx + 1}/${saved.stepsLen}` :
                "Récap";
              const isCurrent = key === currentKey;
              return (
                <li
                  key={key}
                  className={`flex items-start gap-2 rounded-xl border p-3 ${
                    isCurrent ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]" : "border-border"
                  }`}
                >
                  <button onClick={() => resumeSession(key)} className="flex-1 text-left">
                    <div className="text-sm font-medium text-foreground">
                      {ctxLabel} · {parentLabel}
                    </div>
                    <div className="text-xs text-muted-foreground">{situationLabel}</div>
                    <div className="mt-1 text-xs text-[hsl(var(--lies))]">{phaseLabel}</div>
                  </button>
                  <button
                    onClick={() => deleteSession(key)}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer la session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <section className="mb-5 rounded-2xl border border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] p-4">
        <h2 className="mb-3 font-serif text-xl text-foreground">Pendant la crise</h2>
        <ol className="space-y-2">
          {scenario.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--lies))] text-xs font-bold text-[hsl(var(--lies-foreground))]">
                {i + 1}
              </span>
              <span className="text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-serif text-lg text-foreground">Après la crise — pour l'enfant</h3>
        <ul className="space-y-1.5 text-sm text-foreground/90">
          {scenario.apresEnfant.map((t, i) => <li key={i}>• {t}</li>)}
        </ul>
      </section>
      <section className="mb-3 rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-serif text-lg text-foreground">Pour les frères et sœurs témoins</h3>
        <ul className="space-y-1.5 text-sm text-foreground/90">
          {scenario.apresFratrie.map((t, i) => <li key={i}>• {t}</li>)}
        </ul>
      </section>
      <section className="mb-5 rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-serif text-lg text-foreground">Pour vous, parent</h3>
        <ul className="space-y-1.5 text-sm text-foreground/90">
          {scenario.apresParent.map((t, i) => <li key={i}>• {t}</li>)}
        </ul>
      </section>

      <div className="mb-5 rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-serif text-lg text-foreground">Carte d'aide pour situations publiques</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Une carte format poche à montrer aux passants ou aux secours en cas de crise à l'extérieur.
        </p>
        <Button
          onClick={downloadHelpCard}
          className="bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))]"
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger la carte (PDF)
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        Ces conseils s'appliquent notamment aux contextes : {CRISIS_TROUBLES_COVERED.join(" · ")}.
      </div>

      {guidedOpen && (
        <CriseGuided
          scenario={scenario}
          context={ctx}
          parent={parent}
          situation={situation}
          onClose={() => setGuidedOpen(false)}
        />
      )}
    </LiesShell>
  );
};

export default CrisePage;
