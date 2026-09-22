import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrainState } from "@/hooks/usePulseState";

export type PulseDay = { day: string; state: BrainState };

/** Valeur de courbe : plus c'est haut, plus la journée était fluide. */
export const STATE_VALUE: Record<BrainState, number> = { ko: 1, sature: 2, moyen: 3, go: 4 };

export const STATE_COLOR: Record<BrainState, string> = {
  go: "hsl(152 42% 52%)",
  moyen: "hsl(43 78% 60%)",
  sature: "hsl(24 82% 62%)",
  ko: "hsl(352 62% 62%)",
};

/**
 * Historique des états PULSE (une ligne par jour, déjà existante).
 * Aucune donnée nouvelle : on relit simplement `pulse_daily_states`.
 */
export function usePulseHistory() {
  const [days, setDays] = useState<PulseDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("pulse_daily_states")
        .select("day, state")
        .eq("user_id", uid)
        .order("day", { ascending: true });
      if (cancelled) return;
      setDays((data ?? []) as PulseDay[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { days, loading };
}
