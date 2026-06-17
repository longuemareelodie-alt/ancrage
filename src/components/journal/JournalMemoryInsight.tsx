import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  /** Bump this number to force a refresh (e.g. after saving a new entry). */
  refreshKey?: number;
};

const JournalMemoryInsight = ({ refreshKey = 0 }: Props) => {
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("journal-memory-insight");
      if (error) throw error;
      if (data?.insight) {
        setInsight(data.insight);
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError("Je n'ai pas pu relire ton journal pour l'instant.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <section
      aria-label="Ce que j'ai retenu de ton parcours"
      className="mb-5 rounded-2xl border border-[hsl(var(--lies))]/30 bg-[hsl(var(--lies-soft))] p-4 shadow-sm"
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-serif text-base text-foreground">
          <Sparkles className="h-4 w-4 text-[hsl(var(--lies))]" aria-hidden />
          Ce que j'ai retenu de ton parcours 🌱
        </h2>
        <button
          type="button"
          onClick={fetchInsight}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background/60 disabled:opacity-50"
          aria-label="Régénérer le message"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Relire
        </button>
      </header>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-9/12" />
        </div>
      ) : error ? (
        <p className="text-sm italic text-muted-foreground">{error}</p>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{insight}</p>
      )}
    </section>
  );
};

export default JournalMemoryInsight;
