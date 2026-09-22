import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * « Comment fonctionne ton cerveau aujourd'hui ? »
 * L'état du jour est persistant (une ligne par personne et par jour) et
 * modifiable à tout moment. Il pilote la charge des suggestions PULSE.
 */
export type BrainState = "go" | "moyen" | "sature" | "ko";

export const BRAIN_STATES: {
  id: BrainState;
  dot: string;
  label: string;
  hint: string;
}[] = [
  { id: "go", dot: "🟢", label: "GO", hint: "Tu as de l'élan aujourd'hui." },
  { id: "moyen", dot: "🟡", label: "Moyen", hint: "On avance doucement, à ton rythme." },
  { id: "sature", dot: "🟠", label: "Saturé", hint: "Une seule chose à la fois, c'est parfait." },
  { id: "ko", dot: "🔴", label: "KO", hint: "Aujourd'hui, tenir suffit. Rien d'autre." },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

export function usePulseState() {
  const [state, setState] = useState<BrainState | null>(null);
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
        .select("state")
        .eq("user_id", uid)
        .eq("day", todayIso())
        .maybeSingle();
      if (cancelled) return;
      setState((data?.state as BrainState) ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (next: BrainState) => {
    setState(next);
    navigator.vibrate?.(10);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase
      .from("pulse_daily_states")
      .upsert({ user_id: uid, day: todayIso(), state: next }, { onConflict: "user_id,day" });
  }, []);

  return { state, loading, save };
}
