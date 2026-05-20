import { Bell, Calendar, CheckCircle2, Circle, Sparkles, Leaf, ArrowRight, Landmark, Stethoscope, Zap, GraduationCap, CalendarDays, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Card, SectionTitle, Pill } from "./ui";

const today = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const initialPriorities = [
  { id: 1, label: "Document CAF manquant", done: false },
  { id: 2, label: "Renouveler ordonnance", done: false },
  { id: 3, label: "Acheter médicaments", done: false },
  { id: 4, label: "Courses à faire", done: true },
];

const quick = [
  { label: "CAF", icon: Landmark },
  { label: "Banque", icon: Wallet },
  { label: "Doctolib", icon: Stethoscope },
  { label: "ENGIE", icon: Zap },
  { label: "École", icon: GraduationCap },
  { label: "Agenda", icon: CalendarDays },
];

const todayItems = [
  { tone: "sage" as const, time: "14h", title: "Orthophoniste Mathis", tag: "Rendez-vous" },
  { tone: "sand" as const, time: "16h30", title: "Préparer sac école", tag: "Tâche" },
  { tone: "blush" as const, time: "Demain", title: "Facture ENGIE", tag: "Rappel" },
  { tone: "sky" as const, time: "17h", title: "Temps calme après l'école", tag: "Routine" },
];

const Accueil = () => {
  const [priorities, setPriorities] = useState(initialPriorities);
  const toggle = (id: number) =>
    setPriorities((p) => p.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1
            className="text-[26px] font-semibold leading-tight tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Bonjour Élodie <span aria-hidden>👋</span>
          </h1>
          <p
            className="mt-1 text-[13px] capitalize"
            style={{ color: "var(--ancrage-ink-soft)" }}
          >
            {today}
          </p>
        </div>
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "var(--ancrage-surface)", border: "1px solid var(--ancrage-soft)" }}
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span
            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--ancrage-sage-deep)" }}
          />
        </button>
      </header>

      {/* Aujourd'hui */}
      <section>
        <SectionTitle action={<Pill tone="sage">{todayItems.length} éléments</Pill>}>
          Aujourd'hui
        </SectionTitle>
        <div className="space-y-2.5">
          {todayItems.map((it) => (
            <Card key={it.title} className="flex items-center gap-4 !p-4">
              <div
                className="flex h-12 w-14 flex-col items-center justify-center rounded-xl text-[11px] font-semibold"
                style={{ background: "var(--ancrage-soft)", color: "var(--ancrage-ink)" }}
              >
                <Calendar className="mb-0.5 h-3.5 w-3.5" strokeWidth={1.8} />
                {it.time}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{it.title}</p>
                <div className="mt-1">
                  <Pill tone={it.tone}>{it.tag}</Pill>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Priorités */}
      <section>
        <SectionTitle>Priorités</SectionTitle>
        <Card className="!p-2">
          <ul>
            {priorities.map((p, i) => (
              <li key={p.id}>
                <button
                  onClick={() => toggle(p.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--ancrage-soft)]"
                >
                  {p.done ? (
                    <CheckCircle2
                      className="h-5 w-5 shrink-0"
                      style={{ color: "var(--ancrage-sage-deep)" }}
                    />
                  ) : (
                    <Circle
                      className="h-5 w-5 shrink-0"
                      style={{ color: "var(--ancrage-ink-soft)" }}
                      strokeWidth={1.6}
                    />
                  )}
                  <span
                    className={`text-[14px] ${p.done ? "line-through opacity-50" : ""}`}
                  >
                    {p.label}
                  </span>
                </button>
                {i < priorities.length - 1 && (
                  <div className="mx-3 h-px" style={{ background: "var(--ancrage-soft)" }} />
                )}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Accès rapides */}
      <section>
        <SectionTitle>Accès rapides</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          {quick.map((q) => (
            <button
              key={q.label}
              className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all active:scale-95"
              style={{
                background: "var(--ancrage-surface)",
                border: "1px solid var(--ancrage-soft)",
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "var(--ancrage-soft)" }}
              >
                <q.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="text-[12px] font-medium">{q.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* IA familiale */}
      <section>
        <Link to="/ancrage/ia">
          <div
            className="overflow-hidden rounded-3xl p-6 text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--ancrage-sage-deep) 0%, #94B58F 100%)",
              boxShadow: "0 18px 40px -20px rgba(124,155,120,0.7)",
            }}
          >
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> IA familiale
            </div>
            <h3
              className="text-[22px] font-semibold leading-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Que dois-je faire aujourd'hui ?
            </h3>
            <p className="mt-1.5 text-[13px] text-white/85">
              Ancrage te répond en quelques secondes.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-[13px] font-semibold" style={{ color: "var(--ancrage-sage-deep)" }}>
              Demander à Ancrage IA <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* Soutien émotionnel */}
      <section>
        <Card
          className="flex items-center gap-4"
          style={
            {
              background: "var(--ancrage-blush)",
              border: "1px solid #EDC4B7",
            } as any
          }
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70"
          >
            <Leaf className="h-5 w-5" style={{ color: "#A75A48" }} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold" style={{ color: "#7A3D2E" }}>
              🌿 Besoin de souffler ?
            </p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#A75A48" }}>
              Une pause douce, juste pour toi.
            </p>
          </div>
          <button
            className="rounded-xl bg-white px-3 py-2 text-[12px] font-semibold"
            style={{ color: "#A75A48" }}
          >
            Ressources
          </button>
        </Card>
      </section>

      {/* Inspiration du jour */}
      <section>
        <Card className="text-center" style={{ background: "var(--ancrage-soft)" } as any}>
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--ancrage-ink-soft)" }}>
            Inspiration du jour
          </p>
          <p
            className="mt-2 text-[16px] leading-snug"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            « Tu n'as pas besoin d'être parfaite. Juste présente. »
          </p>
        </Card>
      </section>
    </div>
  );
};

export default Accueil;
