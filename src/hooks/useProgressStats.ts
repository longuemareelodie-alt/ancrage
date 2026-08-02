import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProgressStats = {
  /** Nombre de jours depuis l'arrivée dans Éclosia. */
  days: number;
  /** Supports créés dans le Studio Autonomie. */
  supports: number;
  /** Objectifs atteints. */
  goals: number;
};

/**
 * Progression volontairement discrète : jamais de statistique anxiogène,
 * seulement trois repères doux qui rappellent le chemin déjà parcouru.
 */
export function useProgressStats(): ProgressStats {
  const [stats, setStats] = useState<ProgressStats>({ days: 0, supports: 0, goals: 0 });

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const [profile, supports, goals] = await Promise.all([
        supabase.from("profiles").select("created_at").eq("user_id", uid).maybeSingle(),
        supabase
          .from("autonomy_supports")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid),
        supabase
          .from("personal_goals")
          .select("id", { count: "exact", head: true })
          .eq("user_id", uid)
          .eq("done", true),
      ]);

      if (!alive) return;

      const created = profile.data?.created_at ? new Date(profile.data.created_at) : null;
      const days = created
        ? Math.max(1, Math.round((Date.now() - created.getTime()) / 86_400_000) + 1)
        : 1;

      setStats({
        days,
        supports: supports.count ?? 0,
        goals: goals.count ?? 0,
      });
    })();

    return () => {
      alive = false;
    };
  }, []);

  return stats;
}
