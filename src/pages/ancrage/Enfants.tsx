import { useState } from "react";
import { ChevronRight, Heart, AlertCircle, Pill as PillIcon, Calendar, Sparkles, Wind, ArrowLeft } from "lucide-react";
import { Card, SectionTitle, Pill, SoftButton } from "./ui";

type Kid = {
  id: string;
  name: string;
  age: number;
  emoji: string;
  tone: "sage" | "sand" | "blush" | "sky";
  besoins: string[];
  allergies: string[];
  traitements: string[];
  rdv: string;
  sensoriel: string;
  routines: string[];
};

const kids: Kid[] = [
  {
    id: "mathis",
    name: "Mathis",
    age: 8,
    emoji: "🦊",
    tone: "sage",
    besoins: ["TDAH", "Dys"],
    allergies: ["Arachides"],
    traitements: ["Méthylphénidate 10mg — matin"],
    rdv: "Orthophoniste · Mardi 14h",
    sensoriel: "Sensible aux bruits forts. Casque anti-bruit utile.",
    routines: ["Réveil doux", "Habillage", "Petit déjeuner", "Brossage", "École"],
  },
  {
    id: "maelys",
    name: "Maëlys",
    age: 6,
    emoji: "🐰",
    tone: "blush",
    besoins: ["TSA niveau 1"],
    allergies: [],
    traitements: [],
    rdv: "Psychomotricienne · Jeudi 16h",
    sensoriel: "Besoin de prévisibilité. Évite les changements brusques.",
    routines: ["Réveil", "Pictos du matin", "Habillage", "Petit déj", "École"],
  },
  {
    id: "lilyanna",
    name: "Lilyanna",
    age: 4,
    emoji: "🐻",
    tone: "sky",
    besoins: ["Ataxie légère"],
    allergies: ["Lactose"],
    traitements: ["Kiné motrice 2x/sem"],
    rdv: "Kiné · Lundi 10h",
    sensoriel: "Fatigue rapide en fin de journée.",
    routines: ["Réveil tendresse", "Habillage assise", "Petit déj", "Crèche"],
  },
];

const routineIcons = ["🌅", "👕", "🥣", "🪥", "🎒", "🌿", "🌙"];

const Enfants = () => {
  const [selected, setSelected] = useState<Kid | null>(null);
  const [calm, setCalm] = useState(false);

  if (calm) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCalm(false)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "var(--ancrage-ink-soft)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <h1
          className="text-[26px] font-semibold leading-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Mode apaisement
        </h1>
        <Card
          style={{
            background:
              "linear-gradient(160deg, var(--ancrage-sky) 0%, var(--ancrage-surface) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
              <Wind className="h-5 w-5" style={{ color: "#3E6063" }} strokeWidth={1.8} />
            </span>
            <div>
              <p className="font-semibold">Respiration carrée</p>
              <p className="text-[12px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                Inspire 4s · Garde 4s · Expire 4s · Garde 4s
              </p>
            </div>
          </div>
        </Card>
        {[
          { e: "🫧", t: "Bulles imaginaires", d: "Souffle doucement comme pour faire 5 bulles." },
          { e: "🤲", t: "Mains chaudes", d: "Frotte tes mains 10 secondes puis pose-les sur tes yeux." },
          { e: "🌳", t: "L'arbre tranquille", d: "Debout, racines dans le sol, bras qui balancent." },
          { e: "💛", t: "Câlin solide", d: "Demande un câlin serré pendant 20 secondes." },
        ].map((x) => (
          <Card key={x.t} className="flex gap-4">
            <span className="text-3xl leading-none">{x.e}</span>
            <div>
              <p className="font-semibold">{x.t}</p>
              <p className="mt-1 text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                {x.d}
              </p>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "var(--ancrage-ink-soft)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Tous les profils
        </button>

        <header className="flex items-center gap-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-3xl text-3xl"
            style={{ background: "var(--ancrage-soft)" }}
          >
            {selected.emoji}
          </span>
          <div>
            <h1
              className="text-[26px] font-semibold leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {selected.name}
            </h1>
            <p className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
              {selected.age} ans
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selected.besoins.map((b) => (
                <Pill key={b} tone={selected.tone}>{b}</Pill>
              ))}
            </div>
          </div>
        </header>

        <section>
          <SectionTitle>Infos importantes</SectionTitle>
          <div className="space-y-2.5">
            {selected.allergies.length > 0 && (
              <Card className="flex items-start gap-3 !p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#A75A48" }} />
                <div>
                  <p className="text-[13px] font-semibold">Allergies</p>
                  <p className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                    {selected.allergies.join(", ")}
                  </p>
                </div>
              </Card>
            )}
            {selected.traitements.length > 0 && (
              <Card className="flex items-start gap-3 !p-4">
                <PillIcon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--ancrage-sage-deep)" }} />
                <div>
                  <p className="text-[13px] font-semibold">Traitements</p>
                  {selected.traitements.map((t) => (
                    <p key={t} className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                      {t}
                    </p>
                  ))}
                </div>
              </Card>
            )}
            <Card className="flex items-start gap-3 !p-4">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--ancrage-sage-deep)" }} />
              <div>
                <p className="text-[13px] font-semibold">Prochain rendez-vous</p>
                <p className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                  {selected.rdv}
                </p>
              </div>
            </Card>
            <Card className="flex items-start gap-3 !p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#7A6440" }} />
              <div>
                <p className="text-[13px] font-semibold">Particularités sensorielles</p>
                <p className="text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                  {selected.sensoriel}
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <SectionTitle action={<Pill tone="sage">Routine du matin</Pill>}>
            Routines visuelles
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            {selected.routines.map((r, i) => (
              <Card key={r} className="flex flex-col items-center justify-center !p-4 text-center">
                <span className="text-3xl">{routineIcons[i] ?? "✨"}</span>
                <p className="mt-2 text-[13px] font-medium">{r}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card
            onClick={() => setCalm(true)}
            style={{
              background:
                "linear-gradient(160deg, var(--ancrage-sky) 0%, var(--ancrage-surface) 100%)",
            }}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
                <Heart className="h-5 w-5" style={{ color: "#3E6063" }} />
              </span>
              <div className="flex-1">
                <p className="font-semibold">Mode apaisement</p>
                <p className="text-[12px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                  Exercices doux pour revenir au calme.
                </p>
              </div>
              <ChevronRight className="h-5 w-5" style={{ color: "var(--ancrage-ink-soft)" }} />
            </div>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <h1
          className="text-[26px] font-semibold leading-tight tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Enfants
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--ancrage-ink-soft)" }}>
          Trois profils, un seul endroit doux.
        </p>
      </header>

      <div className="space-y-2.5">
        {kids.map((k) => (
          <Card key={k.id} onClick={() => setSelected(k)} className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
              style={{ background: "var(--ancrage-soft)" }}
            >
              {k.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{k.name}</p>
              <p className="text-[12px]" style={{ color: "var(--ancrage-ink-soft)" }}>
                {k.age} ans · {k.besoins.join(" · ")}
              </p>
              <p className="mt-1 truncate text-[12px]" style={{ color: "var(--ancrage-sage-deep)" }}>
                {k.rdv}
              </p>
            </div>
            <ChevronRight className="h-5 w-5" style={{ color: "var(--ancrage-ink-soft)" }} />
          </Card>
        ))}
      </div>

      <Card
        onClick={() => setCalm(true)}
        style={{
          background:
            "linear-gradient(160deg, var(--ancrage-sky) 0%, var(--ancrage-surface) 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70">
            <Wind className="h-5 w-5" style={{ color: "#3E6063" }} />
          </span>
          <div className="flex-1">
            <p className="font-semibold">Mode apaisement</p>
            <p className="text-[12px]" style={{ color: "var(--ancrage-ink-soft)" }}>
              Pour toute la famille, à tout moment.
            </p>
          </div>
          <ChevronRight className="h-5 w-5" style={{ color: "var(--ancrage-ink-soft)" }} />
        </div>
      </Card>
    </div>
  );
};

export default Enfants;
