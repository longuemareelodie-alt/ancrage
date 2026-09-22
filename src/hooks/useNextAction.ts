import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { guessDomain, type PulseDomain } from "@/data/pulseMascots";
import type { BrainState } from "@/hooks/usePulseState";

/**
 * ⚡ Prochaine action — le cœur de PULSE.
 *
 * On ne crée AUCUNE nouvelle base : les candidats viennent des tâches
 * (`todo_items`) et des rendez-vous (`appointments`, `agenda_events`) déjà
 * présents dans Éclosia. On n'en montre qu'une à la fois.
 */
export type NextAction = {
  id: string;
  source: "tache" | "rdv";
  rowId: string;
  label: string;
  minutes: number;
  domain: PulseDomain | null;
  to: string;
  /** Peut être cochée directement (tâches uniquement). */
  completable: boolean;
};

/** Estimation d'effort très simple : plus le libellé est court, plus c'est rapide. */
const estimateMinutes = (label: string, source: "tache" | "rdv") => {
  if (source === "rdv") return 30;
  const n = label.trim().length;
  if (n <= 20) return 5;
  if (n <= 45) return 10;
  return 20;
};

/** Effort maximal acceptable selon l'état du cerveau du jour. */
const maxMinutesFor = (state: BrainState | null) => {
  switch (state) {
    case "ko":
      return 5;
    case "sature":
      return 10;
    case "moyen":
      return 20;
    default:
      return 999;
  }
};

export function useNextAction(brainState: BrainState | null) {
  const [queue, setQueue] = useState<NextAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (!cancelled) {
          setQueue([]);
          setLoading(false);
        }
        return;
      }

      const iso = new Date().toISOString().slice(0, 10);
      const dayEnd = new Date(iso + "T23:59:59").toISOString();

      const [todos, appts, events] = await Promise.all([
        supabase
          .from("todo_items")
          .select("id, title, due_date, priority, domain")
          .eq("done", false)
          .order("due_date", { nullsFirst: false })
          .limit(30),
        supabase
          .from("appointments")
          .select("id, title, appointment_at, domain")
          .gte("appointment_at", new Date().toISOString())
          .lte("appointment_at", dayEnd)
          .order("appointment_at")
          .limit(5),
        supabase
          .from("agenda_events")
          .select("id, title, event_time, domain")
          .eq("event_date", iso)
          .order("event_time")
          .limit(5),
      ]);

      if (cancelled) return;

      const items: (NextAction & { weight: number })[] = [];

      (appts.data ?? []).forEach((a) =>
        items.push({
          id: "a" + a.id,
          source: "rdv",
          rowId: a.id,
          label: a.title,
          minutes: estimateMinutes(a.title, "rdv"),
          domain: (a.domain as PulseDomain) ?? guessDomain(a.title),
          to: "/plus/organisation",
          completable: false,
          weight: 0,
        }),
      );

      (events.data ?? []).forEach((e) =>
        items.push({
          id: "e" + e.id,
          source: "rdv",
          rowId: e.id,
          label: e.title,
          minutes: estimateMinutes(e.title, "rdv"),
          domain: (e.domain as PulseDomain) ?? guessDomain(e.title),
          to: "/plus/organisation",
          completable: false,
          weight: 0,
        }),
      );

      (todos.data ?? []).forEach((t) => {
        const late = !!t.due_date && t.due_date < iso;
        const dueToday = t.due_date === iso;
        items.push({
          id: "t" + t.id,
          source: "tache",
          rowId: t.id,
          label: t.title,
          minutes: estimateMinutes(t.title, "tache"),
          domain: (t.domain as PulseDomain) ?? guessDomain(t.title),
          to: "/plus/organisation",
          completable: true,
          weight: late ? 1 : dueToday ? 2 : t.priority === "high" ? 3 : 4,
        });
      });

      const max = maxMinutesFor(brainState);
      const fits = items.filter((i) => i.minutes <= max);
      const pool = fits.length ? fits : items;
      pool.sort((a, b) => a.weight - b.weight || a.minutes - b.minutes);

      setQueue(pool.map(({ weight: _w, ...rest }) => rest));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [brainState, tick]);

  /** Action terminée → on enchaîne sur la suivante, sans liste interminable. */
  const complete = useCallback(async (action: NextAction) => {
    setQueue((q) => q.filter((a) => a.id !== action.id));
    navigator.vibrate?.(12);
    if (action.source === "tache") {
      await supabase.from("todo_items").update({ done: true }).eq("id", action.rowId);
    }
  }, []);

  const skip = useCallback((action: NextAction) => {
    setQueue((q) => [...q.filter((a) => a.id !== action.id), action]);
  }, []);

  return { next: queue[0] ?? null, remaining: queue.length, loading, complete, skip, reload };
}
