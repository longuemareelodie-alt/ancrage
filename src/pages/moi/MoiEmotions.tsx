import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { emotions } from "@/data/emotions";
import { ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Checkin = { id: string; emotion: string; emotion_type: string; created_at: string };

const labelOf = (id: string) => emotions.find((e) => e.id === id)?.label ?? id;
const emojiOf = (id: string) => emotions.find((e) => e.id === id)?.emoji ?? "•";

const QUICK = ["submergee", "epuisee", "triste", "colere", "stable", "apaisee", "fiere"];

/**
 * `/moi/emotions` — remplace à lui seul emotions, checkin, historique,
 * comprendre et avancer : noter, comprendre, revoir, au même endroit.
 */
const MoiEmotions = () => {
  const [rows, setRows] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("emotion_checkins")
      .select("id, emotion, emotion_type, created_at")
      .order("created_at", { ascending: false })
      .limit(14);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const note = async (id: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const type = emotions.find((e) => e.id === id)?.type ?? "positive";
    await supabase.from("emotion_checkins").insert({ user_id: uid, emotion: id, emotion_type: type });
    await supabase
      .from("profiles")
      .update({ last_emotion: id, last_checkin_date: new Date().toISOString().slice(0, 10) })
      .eq("user_id", uid);
    toast({ description: "C'est noté." });
    load();
  };

  return (
    <HubShell title="Mes émotions" subtitle="Nommer ce qui se passe, sans se juger.">
      <section className="rounded-[20px] border border-border/70 bg-card px-5 py-5">
        <p className="text-sm font-semibold text-foreground">Là, tout de suite</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK.map((id) => (
            <button
              key={id}
              onClick={() => note(id)}
              className="rounded-full border border-border/60 bg-secondary/30 px-4 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/40 active:scale-95"
            >
              {emojiOf(id)} {labelOf(id)}
            </button>
          ))}
        </div>
      </section>

      <Link
        to="/emotions"
        className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Comprendre ce que je ressens</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Une explication et un geste concret pour chaque émotion.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </Link>

      <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Mes dernières notes
      </p>
      {!loading && rows.length === 0 && (
        <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm leading-relaxed text-muted-foreground">
          Rien encore. Ta première note peut être un seul mot.
        </p>
      )}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3"
          >
            <span className="text-base">{emojiOf(r.emotion)}</span>
            <span className="flex-1 text-sm text-foreground">{labelOf(r.emotion)}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </li>
        ))}
      </ul>

      {rows.length > 0 && (
        <Link
          to="/moi/chemin?vue=chiffres"
          className="mt-2 block text-center text-xs font-medium text-primary-dark"
        >
          Voir mon évolution
        </Link>
      )}
    </HubShell>
  );
};

export default MoiEmotions;
