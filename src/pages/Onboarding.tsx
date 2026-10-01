import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Plus, Trash2, Loader2 } from "lucide-react";
import {
  ADDRESS_STYLES,
  CAREGIVER_ROLES,
  CHALLENGES,
  ChildDraft,
  OnboardingState,
  buildAddressLabel,
  emptyChild,
  loadDraft,
  markOnboardingDone,
  persistOnboarding,
  saveDraft,
} from "@/lib/onboarding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { DIFFICULTY_OPTIONS, GOAL_OPTIONS, PLACE_OPTIONS, computeSpaces, saveSpaces } from "@/lib/spaces";
import { usePulseState, type BrainState } from "@/hooks/usePulseState";

const ENERGY: { id: BrainState; dot: string; label: string; hint: string; symbol: string }[] = [
  { id: "go", dot: "🟢", symbol: "▲", label: "GO", hint: "J'ai de l'énergie" },
  { id: "moyen", dot: "🟡", symbol: "●", label: "MOYEN", hint: "Je peux faire quelques choses" },
  { id: "sature", dot: "🟠", symbol: "◆", label: "SATURÉ", hint: "J'ai besoin qu'on simplifie" },
  { id: "ko", dot: "🔴", symbol: "■", label: "KO", hint: "J'ai besoin du strict minimum" },
];

type Needs = { places: string[]; difficulties: string[]; goals: string[]; energy: BrainState | null };
const NEEDS_KEY = "eclosia_needs_draft";

/**
 * Accueil Éclosia — une expérience en 5 respirations, pas un formulaire.
 * On peut quitter à tout moment : tout est conservé et repris plus tard.
 */



const ease = [0.22, 1, 0.36, 1] as const;

const stepVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>(() => loadDraft());
  const [children, setChildren] = useState<ChildDraft[]>([emptyChild()]);
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);
  const [params] = useSearchParams();
  const needsOnly = params.get("besoins") === "1";
  const TOTAL = needsOnly ? 5 : 8;
  const { setState: setBrain } = usePulseState();
  const [needs, setNeeds] = useState<Needs>(() => {
    try {
      return { places: [], difficulties: [], goals: [], energy: null, ...JSON.parse(localStorage.getItem(NEEDS_KEY) || "{}") };
    } catch {
      return { places: [], difficulties: [], goals: [], energy: null };
    }
  });
  useEffect(() => {
    try { localStorage.setItem(NEEDS_KEY, JSON.stringify(needs)); } catch { /* ignore */ }
  }, [needs]);
  useEffect(() => {
    if (needsOnly) setState((s) => ({ ...s, step: params.get("refaire") === "1" ? 0 : 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggleNeed = (k: "places" | "difficulties" | "goals", id: string) =>
    setNeeds((n) => ({ ...n, [k]: n[k].includes(id) ? n[k].filter((x) => x !== id) : [...n[k], id] }));

  /** Enregistre les besoins et recalcule les espaces visibles. Aucune donnée supprimée. */
  const saveNeeds = async () => {
    await saveSpaces(computeSpaces(needs.places, needs.difficulties, needs.goals), {
      preferred_needs: needs.places,
      challenges: needs.difficulties,
      organization_goal: needs.goals,
    });
    if (needs.energy) setBrain(needs.energy);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("user_id", uid)
        .maybeSingle();
      if (alive) setFirstName(data?.first_name ?? "");
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const step = state.step;
  const set = (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch }));

  const preview = useMemo(
    () => buildAddressLabel(state.addressStyle, state.addressCustom, firstName),
    [state.addressStyle, state.addressCustom, firstName]
  );

  const canContinue = () => {
    if (step === 1) return needs.places.length > 0;
    if (step === 5) return !!state.role;
    if (step === 6) return !!state.addressStyle;
    return true;
  };

  const next = async () => {
    if (step === 4) {
      setSaving(true);
      await saveNeeds();
      setSaving(false);
      if (needsOnly) {
        set({ step: 0 });
        toast({ description: "Ton Éclosia est à jour. 🌸" });
        navigate("/mon-eclosia");
        return;
      }
    }
    if (step < TOTAL - 1) set({ step: step + 1 });
    else void finish();
  };

  const sendWelcome = () => {
    void supabase.functions
      .invoke("send-first-use-welcome", { body: { firstName: firstName || undefined } })
      .catch(() => {});
  };

  const later = () => {
    if (needsOnly) { navigate("/mon-eclosia"); return; }
    markOnboardingDone();
    sendWelcome();
    toast({ description: "Tu peux reprendre quand tu veux, c'est gardé." });
    navigate("/aujourdhui");
  };

  const finish = async () => {
    setSaving(true);
    const res = await persistOnboarding(state, children);
    setSaving(false);
    if (!res.ok) {
      markOnboardingDone();
    }
    sendWelcome();
    toast({ description: "C'est prêt. Éclosia s'adapte à toi. 🌸" });
    navigate("/aujourdhui");
  };

  const updateChild = (i: number, patch: Partial<ChildDraft>) =>
    setChildren((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const toggleChallenge = (id: string) =>
    set({
      challenges: state.challenges.includes(id)
        ? state.challenges.filter((c) => c !== id)
        : [...state.challenges, id],
    });

  const cardBase =
    "w-full rounded-[22px] border border-border/70 bg-card px-5 py-4 text-left transition-all duration-300 hover:border-primary/60";
  const selected = "border-primary bg-primary/10 shadow-[0_10px_30px_-18px_hsl(var(--primary))]";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 pb-10 pt-10">
        {/* Progression douce */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Étape {step + 1} sur {TOTAL}
            </span>
            {step > 0 && (
              <button
                type="button"
                onClick={later}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Reprendre plus tard
              </button>
            )}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              transition={{ duration: 0.7, ease }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease }}
            className="flex-1"
          >
            {/* 1 — Bienvenue */}
            {step === 0 && (
              <div className="flex h-full flex-col justify-center text-center">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, ease }}
                  className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-5xl"
                  aria-hidden="true"
                >
                  🌸
                </motion.div>
                <h1 className="font-serif text-3xl leading-snug text-foreground">
                  Bienvenue dans Éclosia 🌸
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                  On ne va pas tout te montrer.
                  <br />
                  Juste ce dont tu as besoin.
                </p>
              </div>
            )}

            {step >= 1 && step <= 3 && (() => {
              const cfg = [
                null,
                { k: "places" as const, title: "Qu'est-ce qui prend le plus de place dans ta tête actuellement ?", opts: PLACE_OPTIONS },
                { k: "difficulties" as const, title: "Qu'est-ce qui te pèse le plus en ce moment ?", opts: DIFFICULTY_OPTIONS },
                { k: "goals" as const, title: "Qu'aimerais-tu qu'Éclosia t'aide à faire en premier ?", opts: GOAL_OPTIONS },
              ][step]!;
              return (
                <div>
                  <h1 className="font-serif text-2xl leading-snug text-foreground">{cfg.title}</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Plusieurs réponses possibles.</p>
                  <div className="mt-6 space-y-2.5">
                    {cfg.opts.map((o) => {
                      const on = needs[cfg.k].includes(o.id);
                      return (
                        <button
                          key={o.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleNeed(cfg.k, o.id)}
                          className={`${cardBase} ${on ? selected : ""} flex min-h-[52px] items-center gap-3`}
                        >
                          <span className="text-xl" aria-hidden="true">{o.emoji}</span>
                          <span className="flex-1 text-sm font-medium text-foreground">{o.label}</span>
                          {on && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {step === 4 && (
              <div>
                <h1 className="font-serif text-2xl leading-snug text-foreground">Et aujourd'hui, tu te sens comment ?</h1>
                <p className="mt-2 text-sm text-muted-foreground">Éclosia adapte ta journée à ton énergie.</p>
                <div className="mt-6 space-y-2.5">
                  {ENERGY.map((e) => {
                    const on = needs.energy === e.id;
                    return (
                      <button
                        key={e.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setNeeds((n) => ({ ...n, energy: e.id }))}
                        className={`${cardBase} ${on ? selected : ""} flex min-h-[60px] items-center gap-3`}
                      >
                        <span className="text-xl" aria-hidden="true">{e.dot}</span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-foreground">
                            <span aria-hidden="true" className="mr-1.5 text-xs">{e.symbol}</span>{e.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">« {e.hint} »</span>
                        </span>
                        {on && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2 — Rôle */}
            {step === 5 && (
              <div>
                <h1 className="font-serif text-2xl leading-snug text-foreground">
                  Quel est ton rôle auprès de l'enfant ?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Les mots d'Éclosia s'adapteront à toi.
                </p>
                <div className="mt-6 space-y-2.5">
                  {CAREGIVER_ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => set({ role: r.id })}
                      className={`${cardBase} ${state.role === r.id ? selected : ""} flex items-center gap-3`}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {r.emoji}
                      </span>
                      <span className="flex-1 text-sm font-medium text-foreground">{r.label}</span>
                      {state.role === r.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3 — Formule d'appel */}
            {step === 6 && (
              <div>
                <h1 className="font-serif text-2xl leading-snug text-foreground">
                  Comment souhaites-tu être appelée ?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tu pourras changer d'avis à tout moment.
                </p>
                <div className="mt-6 space-y-2.5">
                  {ADDRESS_STYLES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => set({ addressStyle: a.id })}
                      className={`${cardBase} ${state.addressStyle === a.id ? selected : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-1 text-sm font-medium text-foreground">{a.label}</span>
                        {state.addressStyle === a.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.hint}</p>
                    </button>
                  ))}
                </div>

                {state.addressStyle === "personnalise" && (
                  <input
                    value={state.addressCustom}
                    onChange={(e) => set({ addressCustom: e.target.value })}
                    placeholder="Comment veux-tu qu'on t'appelle ?"
                    className="mt-3 w-full rounded-[18px] border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                )}

                {preview && (
                  <p className="mt-5 rounded-[18px] bg-primary/10 px-4 py-3 text-sm text-foreground">
                    Bonjour {preview} 👋
                  </p>
                )}
              </div>
            )}

            {/* 4 — Enfants */}
            {step === 7 && (
              <div>
                <h1 className="font-serif text-2xl leading-snug text-foreground">
                  Parle-moi de ton enfant.
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Le prénom suffit pour commencer. Tout reste modifiable, quand tu veux.
                </p>

                <div className="mt-6 space-y-4">
                  {children.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-[22px] border border-border/70 bg-card p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Enfant {i + 1}
                        </span>
                        {children.length > 1 && (
                          <button
                            type="button"
                            aria-label="Retirer cet enfant"
                            onClick={() => setChildren((cs) => cs.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        <Field
                          label="Prénom"
                          value={c.firstName}
                          onChange={(v) => updateChild(i, { firstName: v })}
                        />
                        <Field
                          label="Date de naissance"
                          type="date"
                          value={c.birthDate}
                          onChange={(v) => updateChild(i, { birthDate: v })}
                        />
                        <Field
                          label="Genre (optionnel)"
                          value={c.gender}
                          onChange={(v) => updateChild(i, { gender: v })}
                        />
                        <Field
                          label="Pronoms (optionnel)"
                          value={c.pronouns}
                          onChange={(v) => updateChild(i, { pronouns: v })}
                        />
                        <Field
                          label="Diagnostic(s) (optionnel)"
                          value={c.diagnoses}
                          onChange={(v) => updateChild(i, { diagnoses: v })}
                          hint="Séparés par des virgules"
                        />
                        <Field
                          label="Sensibilités"
                          value={c.sensitivities}
                          onChange={(v) => updateChild(i, { sensitivities: v })}
                          hint="Bruit, lumière, foule…"
                        />
                        <Field
                          label="Centres d'intérêt"
                          value={c.interests}
                          onChange={(v) => updateChild(i, { interests: v })}
                        />
                        <Field
                          label="Forces"
                          value={c.strengths}
                          onChange={(v) => updateChild(i, { strengths: v })}
                        />
                        <Field
                          label="Objectifs"
                          value={c.goals}
                          onChange={(v) => updateChild(i, { goals: v })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setChildren((cs) => [...cs, emptyChild()])}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Plus className="h-4 w-4" /> Ajouter un enfant
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Action unique */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={() => void next()}
            disabled={!canContinue() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {step === 0
                  ? "Personnaliser mon Éclosia"
                  : needsOnly && step === 4
                    ? "Enregistrer"
                  : step === TOTAL - 1
                    ? "Entrer dans Éclosia"
                    : "Continuer"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          {step === 0 && (
            <button
              type="button"
              onClick={later}
              className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Plus tard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[16px] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
    />
    {hint && <span className="mt-1 block text-[11px] text-muted-foreground/70">{hint}</span>}
  </label>
);

export default Onboarding;
