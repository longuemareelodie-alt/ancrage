import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BrainState } from "./usePulseState";

const todayIso = () => new Date().toISOString().slice(0, 10);

export type ChildDay = { day: string; state: BrainState; note: string | null };

/**
 * L'état du jour d'un enfant : « Comment va-t-il aujourd'hui ? »
 * Une ligne par enfant et par jour, modifiable à tout moment.
 * Aucune donnée n'est inventée : un jour sans réponse reste vide.
 */
export function useChildPulse(profileId: string | undefined) {
  const [state, setState] = useState<BrainState | null>(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<ChildDay[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profileId) return;
    const { data } = await supabase
      .from("pulse_child_states")
      .select("day, state, note")
      .eq("profile_id", profileId)
      .order("day", { ascending: false })
      .limit(30);
    const rows = (data ?? []) as ChildDay[];
    setHistory(rows);
    const today = rows.find((r) => r.day === todayIso());
    setState(today?.state ?? null);
    setNote(today?.note ?? "");
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const save = useCallback(
    async (next: BrainState, nextNote?: string) => {
      if (!profileId) return;
      setState(next);
      navigator.vibrate?.(10);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      await supabase.from("pulse_child_states").upsert(
        {
          user_id: uid,
          profile_id: profileId,
          day: todayIso(),
          state: next,
          note: (nextNote ?? note).trim() || null,
        },
        { onConflict: "user_id,profile_id,day" },
      );
      load();
    },
    [profileId, note, load],
  );

  return { state, note, setNote, history, loading, save, reload: load };
}
