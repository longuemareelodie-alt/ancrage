import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BRAIN_STATES, type BrainState } from "@/hooks/usePulseState";
import { STATE_COLOR, STATE_VALUE, usePulseHistory } from "@/hooks/usePulseHistory";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const labelOf = (id: BrainState) => BRAIN_STATES.find((s) => s.id === id)?.label ?? id;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * 📈 Mon rythme — suivi des états PULSE au fil des jours.
 * Une courbe douce sur 30 jours, puis un aperçu mois par mois.
 * Aucune culpabilité : on observe, on ne note pas.
 */
const MonRythme = () => {
  const navigate = useNavigate();
  const { days, loading } = usePulseHistory();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const byDay = useMemo(() => new Map(days.map((d) => [d.day, d.state])), [days]);

  // Courbe : les 30 derniers jours, trous laissés vides (pas de fausse donnée).
  const curve = useMemo(() => {
    const out: { day: string; short: string; value: number | null; state?: BrainState }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = iso(d);
      const state = byDay.get(key);
      out.push({
        day: key,
        short: `${d.getDate()}/${d.getMonth() + 1}`,
        value: state ? STATE_VALUE[state] : null,
        state,
      });
    }
    return out;
  }, [byDay]);

  // Aperçu du mois affiché.
  const month = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const total = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // semaine qui commence lundi
    const cells: { day: string; num: number; state?: BrainState }[] = [];
    for (let n = 1; n <= total; n++) {
      const key = iso(new Date(cursor.year, cursor.month, n));
      cells.push({ day: key, num: n, state: byDay.get(key) });
    }
    const counts = BRAIN_STATES.map((s) => ({
      ...s,
      count: cells.filter((c) => c.state === s.id).length,
    }));
    const filled = cells.filter((c) => c.state).length;
    return { lead, cells, counts, filled };
  }, [cursor, byDay]);

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isFuture = new Date(cursor.year, cursor.month, 1) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mon rythme</h1>
          <p className="text-xs text-muted-foreground">Comment ta tête a fonctionné, jour après jour.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : days.length === 0 ? (
        <section className="mx-5 mt-8 rounded-[24px] border border-border/70 bg-card px-6 py-8 text-center">
          <p className="text-sm leading-relaxed text-foreground">
            Rien à regarder encore, et c'est très bien.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Dès que tu diras comment va ta tête, ta courbe se dessinera ici, tout doucement.
          </p>
        </section>
      ) : (
        <>
          {/* Courbe — 30 derniers jours */}
          <section className="mx-5 mt-6 rounded-[24px] border border-border/70 bg-card px-4 py-5">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ces 30 derniers jours
            </p>
            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="pulseCurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="short"
                    interval={6}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0.6, 4.4]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(v: number) =>
                      ({ 1: "KO", 2: "Saturé", 3: "Moyen", 4: "GO" } as Record<number, string>)[v] ?? ""
                    }
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={62}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                    labelFormatter={(l) => `Le ${l}`}
                    formatter={(_v, _n, item) => [
                      labelOf((item?.payload as { state?: BrainState })?.state ?? "moyen"),
                      "Ta tête",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#pulseCurve)"
                    connectNulls
                    dot={{ r: 2.5, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 px-1 text-xs leading-relaxed text-muted-foreground">
              Les jours sans réponse restent vides. Une courbe qui descend n'est pas un échec, c'est une information.
            </p>
          </section>

          {/* Aperçu par mois */}
          <section className="mx-5 mt-5 rounded-[24px] border border-border/70 bg-card px-5 py-5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => shift(-1)}
                aria-label="Mois précédent"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <p className="text-sm font-semibold text-foreground">
                {MONTHS[cursor.month]} {cursor.year}
              </p>
              <button
                onClick={() => shift(1)}
                disabled={isFuture}
                aria-label="Mois suivant"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-foreground disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="text-[10px] text-muted-foreground">{d}</span>
              ))}
              {Array.from({ length: month.lead }).map((_, i) => (
                <span key={`lead-${i}`} />
              ))}
              {month.cells.map((c) => (
                <span
                  key={c.day}
                  title={c.state ? `${c.num} — ${labelOf(c.state)}` : `${c.num} — pas de réponse`}
                  className="flex aspect-square items-center justify-center rounded-xl text-[10px] font-medium"
                  style={
                    c.state
                      ? { background: STATE_COLOR[c.state], color: "hsl(var(--night-foreground, 0 0% 100%))" }
                      : undefined
                  }
                >
                  <span className={c.state ? "text-white/95" : "text-muted-foreground/50"}>{c.num}</span>
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {month.counts.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-secondary/25 px-3 py-2.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATE_COLOR[s.id] }} />
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="ml-auto text-sm font-semibold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {month.filled === 0
                ? "Aucune réponse ce mois-là. Ce n'est pas grave du tout."
                : `${month.filled} jour${month.filled > 1 ? "s" : ""} raconté${month.filled > 1 ? "s" : ""} ce mois-ci.`}
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default MonRythme;
