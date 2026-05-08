import { useEffect, useMemo, useState } from "react";
import { Rainbow, Loader2 } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEmotion, type AgeBand } from "@/data/childEmotionsCatalog";

type Entry = {
  id: string;
  created_at: string;
  emotion: string;
  intensity: number | null;
  age_band: string;
  is_crisis: boolean;
};

const AGE_FILTERS: { key: AgeBand | "all"; emoji: string; label: string }[] = [
  { key: "all", emoji: "✨", label: "Tous" },
  { key: "0_3", emoji: "👶", label: "0–3" },
  { key: "3_6", emoji: "🧒", label: "3–6" },
  { key: "6_9", emoji: "👦", label: "6–9" },
  { key: "9_12", emoji: "🧑", label: "9–12" },
  { key: "12_plus", emoji: "🧑", label: "12+" },
];

const FeelingsHistory = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<7 | 30>(7);
  const [ageFilter, setAgeFilter] = useState<AgeBand | "all">("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const since = new Date(Date.now() - range * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("child_emotion_entries")
        .select("id, created_at, emotion, intensity, age_band, is_crisis")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      setEntries(data ?? []);
      setLoading(false);
    };
    load();
  }, [user, range]);

  const filteredEntries = useMemo(
    () => (ageFilter === "all" ? entries : entries.filter((e) => e.age_band === ageFilter)),
    [entries, ageFilter],
  );

  const ageCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries) m.set(e.age_band, (m.get(e.age_band) ?? 0) + 1);
    return m;
  }, [entries]);

  const dominantStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredEntries) {
      counts.set(e.emotion, (counts.get(e.emotion) ?? 0) + 1);
    }
    const total = filteredEntries.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, n]) => ({
        key,
        n,
        pct: Math.round((n / total) * 100),
        emotion: getEmotion(key as never),
      }));
  }, [filteredEntries]);

  const topEmotion = dominantStats[0];

  return (
    <LiesShell
      title="Historique"
      subtitle="Émotions de ton enfant sur les derniers jours."
      backTo="/comment-tu-te-sens"
      icon={<Rainbow className="h-6 w-6" />}
    >
      {/* Range selector */}
      <div
        role="group"
        aria-label="Période d'historique"
        className="mb-4 inline-flex rounded-full border border-border bg-card p-1"
      >
        {[7, 30].map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r as 7 | 30)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--lies))] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              range === r
                ? "bg-[hsl(var(--lies))] text-white"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {r} jours
          </button>
        ))}
      </div>

      {/* Age band filter */}
      <div
        role="group"
        aria-label="Filtrer par tranche d'âge"
        className="mb-6 -mx-1 flex flex-wrap gap-2"
      >
        {AGE_FILTERS.map((a) => {
          const active = ageFilter === a.key;
          const count = a.key === "all" ? entries.length : ageCounts.get(a.key) ?? 0;
          return (
            <button
              key={a.key}
              type="button"
              aria-pressed={active}
              aria-label={`${a.label === "Tous" ? "Toutes les tranches" : `Tranche ${a.label} ans`} — ${count} entrée${count > 1 ? "s" : ""}`}
              onClick={() => setAgeFilter(a.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--lies))] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                active
                  ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] text-[hsl(var(--lies))]"
                  : "border-border bg-card text-foreground/70 hover:text-foreground"
              }`}
            >
              <span aria-hidden="true">{a.emoji}</span>
              <span>{a.label}</span>
              <span
                aria-hidden="true"
                className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--lies))]" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucune entrée pour ce filtre sur cette période.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Period summary */}
          {topEmotion?.emotion && (
            <section
              className="rounded-2xl border-2 border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--lies))]">
                Résumé · {range} derniers jours
              </p>
              <p className="mt-2 flex items-center gap-2 text-base text-foreground">
                <span className="text-2xl">{topEmotion.emotion.emoji}</span>
                <span>
                  Émotion la plus fréquente :{" "}
                  <strong>{topEmotion.emotion.label}</strong> ({topEmotion.pct}%)
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {filteredEntries.length} entrée{filteredEntries.length > 1 ? "s" : ""}
                {ageFilter !== "all" &&
                  ` · ${AGE_FILTERS.find((a) => a.key === ageFilter)?.label} ans`}
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[hsl(var(--lies))]">
              Émotions dominantes
            </h2>
            <div className="space-y-2">
              {dominantStats.map((s) => (
                <div key={s.key} className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-xl">{s.emotion?.emoji ?? "•"}</span>
                      {s.emotion?.label ?? s.key}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.n} · {s.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.pct}%`,
                        background: s.emotion ? `hsl(${s.emotion.hsl})` : "hsl(var(--lies))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[hsl(var(--lies))]">
              Dernières entrées
            </h2>
            <ul className="space-y-2">
              {filteredEntries.slice(0, 30).map((e) => {
                const em = getEmotion(e.emotion as never);
                return (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{em?.emoji ?? "•"}</span>
                      <div>
                        <p className="font-semibold">{em?.label ?? e.emotion}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                          {" · "}
                          {e.age_band.replace("_", "–")} ans
                          {e.intensity ? ` · ${e.intensity}` : ""}
                        </p>
                      </div>
                    </div>
                    {e.is_crisis && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                        crise
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </LiesShell>
  );
};

export default FeelingsHistory;
