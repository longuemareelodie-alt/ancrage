import { useState } from "react";
import { Link } from "react-router-dom";
import { Rainbow, History, Sparkles, AlertTriangle, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LiesShell from "@/components/lies/LiesShell";
import FacePicker from "@/components/feelings/FacePicker";
import ParentGuidance from "@/components/feelings/ParentGuidance";
import {
  AgeBand,
  BASE_EMOTIONS,
  EXTENDED_EMOTIONS,
  Emotion,
  EmotionKey,
  INTENSITY_3,
  INTENSITY_5,
  BODY_LOCATIONS,
  OBSERVED_SIGNS_0_3,
  isCrisisEntry,
  getEmotion,
} from "@/data/childEmotionsCatalog";
import { useChildEmotionEntry } from "@/hooks/useChildEmotionEntry";

const AGE_BANDS: { key: AgeBand; emoji: string; label: string }[] = [
  { key: "0_3", emoji: "👶", label: "0–3 ans" },
  { key: "3_6", emoji: "🧒", label: "3–6 ans" },
  { key: "6_9", emoji: "👦", label: "6–9 ans" },
  { key: "9_12", emoji: "🧑", label: "9–12 ans" },
  { key: "12_plus", emoji: "🧑", label: "12 ans et +" },
];

const FeelingsHome = () => {
  const [age, setAge] = useState<AgeBand | null>(null);

  return (
    <LiesShell
      title="Comment tu te sens ?"
      subtitle="Aide ton enfant à mettre des mots sur ses émotions."
      backTo="/lies-autrement"
      icon={<Rainbow className="h-6 w-6" />}
    >
      <div className="mb-4 flex justify-end">
        <Link
          to="/comment-tu-te-sens/historique"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
        >
          <History className="h-3.5 w-3.5" />
          Historique
        </Link>
      </div>

      {!age ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Quel âge a ton enfant ?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {AGE_BANDS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAge(a.key)}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:scale-[1.01] hover:border-[hsl(var(--lies))] hover:shadow-soft"
              >
                <span className="text-4xl" aria-hidden>{a.emoji}</span>
                <span className="text-lg font-bold text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <Flow age={age} onChangeAge={() => setAge(null)} />
      )}
    </LiesShell>
  );
};

const Flow = ({ age, onChangeAge }: { age: AgeBand; onChangeAge: () => void }) => (
  <div>
    <button
      onClick={onChangeAge}
      className="mb-4 text-xs font-semibold text-muted-foreground underline hover:text-foreground"
    >
      ← Changer la tranche d'âge
    </button>
    {age === "0_3" && <Flow03 />}
    {age === "3_6" && <Flow36 />}
    {age === "6_9" && <Flow69 />}
    {age === "9_12" && <Flow912 ageBand="9_12" />}
    {age === "12_plus" && <FlowTeen />}
  </div>
);

/* ------------------------------- 0–3 ans ------------------------------- */

const Flow03 = () => {
  const [signs, setSigns] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const { save, saving } = useChildEmotionEntry();

  const toggle = (k: string) =>
    setSigns((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const crisis = isCrisisEntry({ signs });

  const handleSave = async () => {
    const r = await save({
      age_band: "0_3",
      emotion: "unknown",
      observed_signs: signs,
      is_crisis: crisis,
    });
    if (r) {
      toast.success("Enregistré 💚");
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[hsl(var(--lies))]">
            Ce que tu peux faire maintenant
          </h3>
          <ul className="space-y-1 text-sm text-foreground">
            <li>• Va dans un endroit calme, baisse la lumière et le bruit.</li>
            <li>• Reste près de lui sans forcer le contact.</li>
            <li>• Parle doucement, lentement, peu de mots.</li>
            <li>• Propose un câlin, un doudou, ou un portage.</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[hsl(var(--lies))]">
            Ce que tu peux dire
          </h3>
          <p className="text-base text-foreground">
            « Je suis là. Je te vois. Tu es en sécurité. »
          </p>
        </section>
        {crisis && (
          <Link
            to="/lies-autrement/crise"
            className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-5 py-4 text-base font-bold text-destructive-foreground"
          >
            <AlertTriangle className="h-5 w-5" /> C'est une crise — m'aider maintenant
          </Link>
        )}
        <button
          onClick={() => {
            setSigns([]);
            setDone(false);
          }}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Coche ce que tu observes chez ton bébé.
      </p>
      <div className="grid gap-2">
        {OBSERVED_SIGNS_0_3.map((s) => {
          const on = signs.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              className={`flex items-center justify-between rounded-xl border px-4 py-4 text-left text-base font-medium transition-all ${
                on
                  ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies)/0.12)] text-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`h-5 w-5 rounded-md border ${
                  on ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies))]" : "border-border"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      <button
        disabled={signs.length === 0 || saving}
        onClick={handleSave}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--lies))] px-5 py-4 text-base font-bold text-white shadow-md disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Voir comment l'aider
      </button>
    </div>
  );
};

/* ------------------------------- 3–6 ans ------------------------------- */

const Flow36 = () => {
  const [picked, setPicked] = useState<Emotion | null>(null);
  const { save, saving } = useChildEmotionEntry();

  const handlePick = async (e: Emotion) => {
    setPicked(e);
    await save({
      age_band: "3_6",
      emotion: e.key,
      is_crisis: isCrisisEntry({ emotion: e.key }),
    });
  };

  if (!picked) {
    return (
      <div>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Tape sur le visage qui te ressemble en ce moment.
        </p>
        <FacePicker emotions={BASE_EMOTIONS} onPick={handlePick} columns={3} />
      </div>
    );
  }

  return (
    <ParentGuidance
      emotion={picked}
      isCrisis={isCrisisEntry({ emotion: picked.key })}
      onReset={() => setPicked(null)}
    />
  );
};

/* ------------------------------- 6–9 ans ------------------------------- */

const Flow69 = () => {
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { save, saving } = useChildEmotionEntry();

  const reset = () => {
    setEmotion(null);
    setIntensity(null);
    setBody(null);
    setDone(false);
  };

  const handleFinish = async () => {
    if (!emotion || !intensity || !body) return;
    const crisis = isCrisisEntry({
      emotion: emotion.key,
      intensity,
      intensityScale: 3,
    });
    const r = await save({
      age_band: "6_9",
      emotion: emotion.key,
      intensity,
      body_location: body,
      is_crisis: crisis,
    });
    if (r) setDone(true);
  };

  if (done && emotion) {
    return (
      <ParentGuidance
        emotion={emotion}
        isCrisis={isCrisisEntry({
          emotion: emotion.key,
          intensity: intensity ?? undefined,
          intensityScale: 3,
        })}
        onReset={reset}
      />
    );
  }

  if (!emotion) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">Étape 1 / 3 — Choisis l'émotion</p>
        <FacePicker emotions={BASE_EMOTIONS} onPick={setEmotion} columns={3} />
      </div>
    );
  }
  if (intensity === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Étape 2 / 3 — C'est combien ?</p>
        <div className="grid gap-3">
          {INTENSITY_3.map((i) => (
            <button
              key={i.value}
              onClick={() => setIntensity(i.value)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:scale-[1.01]"
            >
              <span
                className="h-12 w-12 rounded-full"
                style={{ background: `hsl(${i.color})` }}
                aria-hidden
              />
              <span className="text-lg font-bold">{i.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (!body) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Étape 3 / 3 — Où dans le corps ?</p>
        <div className="grid gap-2">
          {BODY_LOCATIONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBody(b.key)}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left text-base font-medium transition-all hover:bg-muted"
            >
              <span className="text-2xl">{b.emoji}</span>
              {b.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleFinish}
          disabled={saving}
          className="hidden"
        />
      </div>
    );
  }
  // body just got set → trigger save
  if (body && !done && !saving) {
    handleFinish();
  }
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--lies))]" />
    </div>
  );
};

/* ----------------------------- 9–12 ans ------------------------------ */

const Flow912 = ({ ageBand }: { ageBand: AgeBand }) => {
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [done, setDone] = useState(false);
  const { save, saving } = useChildEmotionEntry();

  const reset = () => {
    setEmotion(null);
    setIntensity(null);
    setNote("");
    setShowJournal(false);
    setDone(false);
  };

  const finish = async () => {
    if (!emotion || !intensity) return;
    const crisis = isCrisisEntry({
      emotion: emotion.key,
      intensity,
      intensityScale: 5,
    });
    const r = await save({
      age_band: ageBand,
      emotion: emotion.key,
      intensity,
      note: note.trim() || null,
      is_crisis: crisis,
    });
    if (r) setDone(true);
  };

  if (done && emotion) {
    return (
      <ParentGuidance
        emotion={emotion}
        isCrisis={isCrisisEntry({
          emotion: emotion.key,
          intensity: intensity ?? undefined,
          intensityScale: 5,
        })}
        onReset={reset}
      />
    );
  }

  if (!emotion) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">Étape 1 / 3 — Roue des émotions</p>
        <FacePicker emotions={EXTENDED_EMOTIONS} onPick={setEmotion} columns={3} />
      </div>
    );
  }
  if (intensity === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Étape 2 / 3 — Intensité (1 à 5)</p>
        <div className="grid grid-cols-5 gap-2">
          {INTENSITY_5.map((i) => (
            <button
              key={i.value}
              onClick={() => setIntensity(i.value)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center transition-all hover:bg-muted"
            >
              <span className="text-2xl font-bold">{i.label}</span>
              <span className="text-[10px] text-muted-foreground">{i.hint}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (!showJournal) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Étape 3 / 3 — Journal (optionnel)</p>
        <p className="text-base text-foreground">Tu veux écrire ce qui s'est passé ?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowJournal(true)}
            className="rounded-xl border border-[hsl(var(--lies))] bg-[hsl(var(--lies)/0.12)] px-4 py-3 text-sm font-semibold"
          >
            Oui, écrire
          </button>
          <button
            onClick={finish}
            disabled={saving}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
          >
            Non, passer
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={6}
        placeholder="Raconte ce qui s'est passé. Personne d'autre que toi ne le verra."
        className="w-full rounded-xl border border-border bg-card p-4 text-sm"
      />
      <button
        onClick={finish}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--lies))] px-5 py-4 text-base font-bold text-white shadow-md disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Terminer
      </button>
    </div>
  );
};

/* ----------------------------- 12 ans + ------------------------------ */

const FlowTeen = () => {
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"pick" | "tools">("pick");
  const { save, saving } = useChildEmotionEntry();

  const submit = async () => {
    if (!emotion || !intensity) return;
    const crisis = isCrisisEntry({
      emotion: emotion.key,
      intensity,
      intensityScale: 5,
    });
    const r = await save({
      age_band: "12_plus",
      emotion: emotion.key,
      intensity,
      note: note.trim() || null,
      is_crisis: crisis,
    });
    if (r) setPhase("tools");
  };

  const callParent = async () => {
    if (!emotion) return;
    const r = await save({
      age_band: "12_plus",
      emotion: emotion.key,
      intensity: intensity ?? null,
      note: null,
      needs_parent: true,
      is_crisis: false,
    });
    if (r) toast.success("On prévient ton parent en douceur 💜");
  };

  if (phase === "tools" && emotion) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <span
            className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-4xl"
            style={{ background: `hsl(${emotion.hsl} / 0.35)` }}
          >
            {emotion.emoji}
          </span>
          <p className="text-sm text-muted-foreground">Émotion enregistrée</p>
          <p className="text-lg font-bold">{emotion.label}</p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-[hsl(var(--lies))]">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Pour toi, maintenant</h3>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
            <li>• Mets de la musique calme dans ton casque, 5 minutes.</li>
            <li>• Respiration 4-4-4-4 (carré) : 5 cycles.</li>
            <li>• Bois un grand verre d'eau, lentement.</li>
            <li>• Écris ce qui te passe par la tête, sans te corriger.</li>
          </ul>
        </section>

        <button
          onClick={callParent}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[hsl(var(--lies))] bg-card px-5 py-4 text-base font-bold text-[hsl(var(--lies))]"
        >
          <BellRing className="h-5 w-5" />
          J'ai besoin d'aide
        </button>
        <p className="text-center text-xs text-muted-foreground">
          On prévient ton parent en douceur, sans révéler ce que tu as choisi.
        </p>

        <button
          onClick={() => {
            setEmotion(null);
            setIntensity(null);
            setNote("");
            setPhase("pick");
          }}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          Recommencer
        </button>
      </div>
    );
  }

  if (!emotion) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">Choisis ce qui te ressemble.</p>
        <FacePicker emotions={EXTENDED_EMOTIONS} onPick={setEmotion} columns={3} />
      </div>
    );
  }
  if (intensity === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Intensité (1 à 5)</p>
        <div className="grid grid-cols-5 gap-2">
          {INTENSITY_5.map((i) => (
            <button
              key={i.value}
              onClick={() => setIntensity(i.value)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3"
            >
              <span className="text-2xl font-bold">{i.label}</span>
              <span className="text-[10px] text-muted-foreground">{i.hint}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Journal privé (optionnel)</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={6}
        placeholder="Personne d'autre que toi ne le verra."
        className="w-full rounded-xl border border-border bg-card p-4 text-sm"
      />
      <button
        onClick={submit}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--lies))] px-5 py-4 text-base font-bold text-white shadow-md disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Continuer
      </button>
    </div>
  );
};

export default FeelingsHome;
