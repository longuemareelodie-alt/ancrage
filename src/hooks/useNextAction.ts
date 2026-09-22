import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { guessDomain, type PulseDomain } from "@/data/pulseMascots";
import type { BrainState } from "@/hooks/usePulseState";
import {
  bucketOf,
  estimateWithHabits,
  type DurationSample,
} from "@/lib/pulseDurations";

/**
 * ⚡ Prochaine action — le cœur de PULSE.
 *
 * On ne crée AUCUNE nouvelle base de contenu : les candidats viennent des
 * tâches (`todo_items`), des rendez-vous (`appointments`, `agenda_events`)
 * et du parcours familial (vaccins à venir, rendez-vous médicaux du jour)
 * déjà présents dans Éclosia. On n'en montre qu'une à la fois.
 *
 * Deux nouveautés :
 * - la durée annoncée s'appuie sur tes habitudes réelles (voir pulseDurations) ;
 * - une action peut être rattachée à un enfant : « pour Léa ».
 */
export type NextAction = {
  id: string;
  source: "tache" | "rdv" | "famille";
  rowId: string;
  label: string;
  minutes: number;
  /** true si la durée vient de tes habitudes mesurées, pas d'une règle générale. */
  learned: boolean;
  domain: PulseDomain | null;
  /** Prénom du membre de la famille concerné, s'il y en a un. */
  who: string | null;
  /** Identifiant du membre concerné : sert à garder la même voix pour lui. */
  profileId: string | null;
  to: string;
  /** Peut être cochée directement (tâches uniquement). */
  completable: boolean;
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
  /** Heure à laquelle chaque action a été présentée — sert à mesurer la durée réelle. */
  const shownAt = useRef<Record<string, number>>({});

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
      const horizon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

      const [todos, appts, events, samples, profiles, vaccins, medEvents] =
        await Promise.all([
          supabase
            .from("todo_items")
            .select("id, title, due_date, priority, domain, profile_id")
            .eq("done", false)
            .order("due_date", { nullsFirst: false })
            .limit(30),
          supabase
            .from("appointments")
            .select("id, title, appointment_at, domain, profile_id")
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
          supabase
            .from("pulse_action_durations")
            .select("source, domain, length_bucket, minutes")
            .order("created_at", { ascending: false })
            .limit(200),
          supabase.from("family_medical_profiles").select("id, first_name").limit(20),
          supabase
            .from("family_vaccinations")
            .select("id, vaccine_name, next_due_date, profile_id")
            .not("next_due_date", "is", null)
            .lte("next_due_date", horizon)
            .order("next_due_date")
            .limit(10),
          supabase
            .from("family_medical_events")
            .select("id, title, event_date, profile_id")
            .eq("event_date", iso)
            .limit(10),
        ]);

      if (cancelled) return;

      const learn = (samples.data ?? []) as DurationSample[];
      const nameOf = new Map(
        (profiles.data ?? []).map((p) => [p.id as string, (p.first_name as string) || null]),
      );

      const items: (NextAction & { weight: number })[] = [];

      const push = (
        prefix: string,
        source: NextAction["source"],
        rowId: string,
        label: string,
        domain: PulseDomain | null,
        profileId: string | null,
        to: string,
        completable: boolean,
        weight: number,
      ) => {
        const est = estimateWithHabits(learn, source, domain, label);
        items.push({
          id: prefix + rowId,
          source,
          rowId,
          label,
          minutes: est.minutes,
          learned: est.learned,
          domain,
          who: profileId ? nameOf.get(profileId) ?? null : null,
          to,
          completable,
          weight,
        });
      };

      (appts.data ?? []).forEach((a) =>
        push(
          "a",
          "rdv",
          a.id,
          a.title,
          (a.domain as PulseDomain) ?? guessDomain(a.title),
          (a.profile_id as string | null) ?? null,
          "/plus/organisation",
          false,
          0,
        ),
      );

      (events.data ?? []).forEach((e) =>
        push(
          "e",
          "rdv",
          e.id,
          e.title,
          (e.domain as PulseDomain) ?? guessDomain(e.title),
          null,
          "/plus/organisation",
          false,
          0,
        ),
      );

      // 👨‍👩‍👧 Parcours familial : ce qui arrive pour un enfant compte aussi.
      (medEvents.data ?? []).forEach((m) =>
        push(
          "m",
          "famille",
          m.id,
          m.title,
          "sante",
          (m.profile_id as string | null) ?? null,
          "/famille",
          false,
          1,
        ),
      );

      (vaccins.data ?? []).forEach((v) => {
        const late = !!v.next_due_date && (v.next_due_date as string) < iso;
        push(
          "v",
          "famille",
          v.id,
          `Vaccin ${v.vaccine_name} à prévoir`,
          "sante",
          (v.profile_id as string | null) ?? null,
          "/famille",
          false,
          late ? 1 : 3,
        );
      });

      (todos.data ?? []).forEach((t) => {
        const late = !!t.due_date && t.due_date < iso;
        const dueToday = t.due_date === iso;
        push(
          "t",
          "tache",
          t.id,
          t.title,
          (t.domain as PulseDomain) ?? guessDomain(t.title),
          (t.profile_id as string | null) ?? null,
          "/plus/organisation",
          true,
          late ? 1 : dueToday ? 2 : t.priority === "high" ? 3 : 4,
        );
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

  /** On note l'heure où l'action arrive devant les yeux. */
  const head = queue[0];
  useEffect(() => {
    if (head && !shownAt.current[head.id]) shownAt.current[head.id] = Date.now();
  }, [head]);

  /** Action terminée → on enchaîne, et on retient combien de temps ça a pris. */
  const complete = useCallback(async (action: NextAction) => {
    setQueue((q) => q.filter((a) => a.id !== action.id));
    navigator.vibrate?.(12);

    const started = shownAt.current[action.id];
    delete shownAt.current[action.id];

    if (action.source === "tache") {
      await supabase.from("todo_items").update({ done: true }).eq("id", action.rowId);
    }

    // Mesure crédible seulement : entre 20 secondes et 1 h 30.
    if (started) {
      const minutes = (Date.now() - started) / 60000;
      if (minutes >= 0.33 && minutes <= 90) {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          await supabase.from("pulse_action_durations").insert({
            user_id: auth.user.id,
            source: action.source,
            domain: action.domain,
            length_bucket: bucketOf(action.label),
            minutes: Math.round(minutes * 10) / 10,
          });
        }
      }
    }
  }, []);

  const skip = useCallback((action: NextAction) => {
    setQueue((q) => [...q.filter((a) => a.id !== action.id), action]);
  }, []);

  /**
   * Reprendre la prochaine action : on réécrit son libellé (tâches uniquement),
   * sans créer de doublon ni perdre l'historique.
   */
  const rename = useCallback(async (action: NextAction, label: string) => {
    const title = label.trim();
    if (!title || action.source !== "tache") return false;
    const { error } = await supabase
      .from("todo_items")
      .update({ title })
      .eq("id", action.rowId);
    if (error) return false;
    setQueue((q) => q.map((a) => (a.id === action.id ? { ...a, label: title } : a)));
    navigator.vibrate?.(10);
    return true;
  }, []);

  return {
    next: queue[0] ?? null,
    remaining: queue.length,
    loading,
    complete,
    skip,
    rename,
    reload,
  };
}
