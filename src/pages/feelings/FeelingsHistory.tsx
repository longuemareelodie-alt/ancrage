import { useEffect, useMemo, useState } from "react";
import { Rainbow, Loader2 } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getEmotion } from "@/data/childEmotionsCatalog";

type Entry = {
  id: string;
  created_at: string;
  emotion: string;
  intensity: number | null;
  age_band: string;
  is_crisis: boolean;
};

const FeelingsHistory = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<7 | 30>(7);
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

  const dominantStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      counts.set(e.emotion, (counts.get(e.emotion) ?? 0) + 1);
    }
    const total = entries.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, n]) => ({
        key,
        n,
        pct: Math.round((n / total) * 100),
        emotion: getEmotion(key as never),
      }));
  }, [entries]);

  return (
    <LiesShell
      title="Historique"
      subtitle="Émotions de ton enfant sur les derniers jours."
      backTo="/comment-tu-te-sens"
      icon={<Rainbow className="h-6 w-6" />}
    >
      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1">
        {[7, 30].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as 7 | 30)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              range === r
                ? "bg-[hsl(var(--lies))] text-white"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            {r} jours
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--lies))]" />
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucune entrée sur cette période.
        </p>
      ) : (
        <div className="space-y-6">
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
              {entries.slice(0, 30).map((e) => {
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
