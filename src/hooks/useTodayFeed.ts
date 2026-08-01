import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FeedItem = {
  id: string;
  kind: "rdv" | "medicament" | "tache" | "facture" | "routine" | "document";
  label: string;
  detail?: string;
  time?: string;
  to: string;
  urgent?: boolean;
};

export type KidItem = {
  id: string;
  name: string;
  action: string;
  to: string;
};

export type TodaySnapshot = {
  loading: boolean;
  firstName: string;
  streak: number;
  lastEmotion: string | null;
  checkedInToday: boolean;
  /** Score de calme 0–100, calculé sur les derniers check-ins. */
  calmScore: number | null;
  /** Écart en points avec la veille (null si pas de repère). */
  calmDelta: number | null;
  /** Échéances du jour, triées par heure puis par urgence. Max 3. */
  now: FeedItem[];
  /** Enfants ayant une action aujourd'hui — jamais toute la famille. */
  kids: KidItem[];
  weekDays: number;
  budgetLeftCents: number | null;
  reload: () => void;
};

const HHMM = (value: string) => value.slice(0, 5);

/** Valeur de calme associée à chaque humeur (0 = tempête, 100 = sereine). */
const MOOD_SCORE: Record<string, number> = {
  submergee: 15,
  epuisee: 30,
  stable: 60,
  apaisee: 82,
  fiere: 92,
};

const scoreOf = (emotion: string, type: string | null) =>
  MOOD_SCORE[emotion] ?? (type === "positive" ? 72 : 32);

const avg = (values: number[]) =>
  values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;

/**
 * Moteur de priorité du cockpit « Aujourd'hui ».
 *
 * Règle produit : on ne montre jamais tout ce qu'on sait, seulement ce qui a
 * une échéance aujourd'hui, ce qui est en retard, ou ce qui est en cours.
 * Un cockpit qui affiche tout n'est plus un cockpit.
 */
export function useTodayFeed(): TodaySnapshot {
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const [snap, setSnap] = useState<Omit<TodaySnapshot, "reload">>({
    loading: true,
    firstName: "",
    streak: 0,
    lastEmotion: null,
    checkedInToday: false,
    calmScore: null,
    calmDelta: null,
    now: [],
    kids: [],
    weekDays: 0,
    budgetLeftCents: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        if (!cancelled) setSnap((s) => ({ ...s, loading: false }));
        return;
      }

      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
      const yIso = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      const dayStart = new Date(iso + "T00:00:00").toISOString();
      const dayEnd = new Date(iso + "T23:59:59").toISOString();
      const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString();
      const twoWeeksAgo = new Date(Date.now() - 13 * 864e5).toISOString();
      const monthStart = iso.slice(0, 8) + "01";
      const soon = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);

      const [
        profile,
        appts,
        events,
        meds,
        todos,
        bills,
        checkins,
        supports,
        budget,
        children,
      ] = await Promise.all([
        supabase.from("profiles").select("first_name, current_streak, last_emotion, last_checkin_date").eq("user_id", uid).maybeSingle(),
        supabase.from("appointments").select("id, title, appointment_at, location").gte("appointment_at", dayStart).lte("appointment_at", dayEnd).order("appointment_at"),
        supabase.from("agenda_events").select("id, title, event_time, location").eq("event_date", iso).order("event_time"),
        supabase.from("medications").select("id, name, dosage, schedule_times").eq("active", true),
        supabase.from("todo_items").select("id, title, due_date, priority").eq("done", false).lte("due_date", iso).order("due_date"),
        supabase.from("bills").select("id, label, amount_cents, due_date").eq("is_paid", false).lte("due_date", soon).order("due_date"),
        supabase.from("emotion_checkins").select("created_at, emotion, emotion_type").gte("created_at", twoWeeksAgo).order("created_at", { ascending: false }),
        supabase.from("autonomy_supports").select("id, title, support_type, profile_id").order("updated_at", { ascending: false }),
        supabase.from("budget_entries").select("kind, amount_cents, month, recurring"),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);

      if (cancelled) return;

      const now: FeedItem[] = [];

      (appts.data ?? []).forEach((a) =>
        now.push({
          id: "a" + a.id,
          kind: "rdv",
          label: a.title,
          detail: a.location ?? undefined,
          time: new Date(a.appointment_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          to: "/plus/organisation",
        }),
      );

      (events.data ?? []).forEach((e) =>
        now.push({
          id: "e" + e.id,
          kind: "rdv",
          label: e.title,
          detail: e.location ?? undefined,
          time: e.event_time ? HHMM(e.event_time) : undefined,
          to: "/plus/organisation",
        }),
      );

      (meds.data ?? []).forEach((m) => {
        const times: string[] = Array.isArray(m.schedule_times) ? m.schedule_times : [];
        const next = times.find((t) => HHMM(t) >= today.toTimeString().slice(0, 5)) ?? times[0];
        if (!next) return;
        now.push({
          id: "m" + m.id,
          kind: "medicament",
          label: m.name,
          detail: m.dosage ?? undefined,
          time: HHMM(next),
          to: "/sante/medicaments",
        });
      });

      (todos.data ?? []).slice(0, 3).forEach((t) =>
        now.push({
          id: "t" + t.id,
          kind: "tache",
          label: t.title,
          to: "/plus/organisation",
          urgent: !!t.due_date && t.due_date < iso,
        }),
      );

      (bills.data ?? []).slice(0, 2).forEach((b) =>
        now.push({
          id: "b" + b.id,
          kind: "facture",
          label: b.label,
          detail: (b.amount_cents / 100).toFixed(2) + " €",
          to: "/plus/budget",
          urgent: b.due_date < iso,
        }),
      );

      now.sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        return (a.time ?? "99:99").localeCompare(b.time ?? "99:99");
      });

      const rows = checkins.data ?? [];
      const checkedInToday = rows.some((r) => r.created_at.slice(0, 10) === iso);
      const weekDays = new Set(
        rows.filter((r) => r.created_at >= weekAgo).map((r) => r.created_at.slice(0, 10)),
      ).size;

      // Score de calme : aujourd'hui si possible, sinon les derniers jours connus.
      const scoreFor = (dayIso: string) =>
        avg(
          rows
            .filter((r) => r.created_at.slice(0, 10) === dayIso)
            .map((r) => scoreOf(r.emotion, r.emotion_type)),
        );
      const todayScore = scoreFor(iso);
      const recentScore =
        todayScore ?? avg(rows.slice(0, 3).map((r) => scoreOf(r.emotion, r.emotion_type)));
      const refScore = scoreFor(yIso);
      const calmScore = recentScore;
      const calmDelta =
        todayScore !== null && refScore !== null ? todayScore - refScore : null;

      // Enfants concernés aujourd'hui : uniquement ceux qui ont un support actif.
      const kidNames = new Map((children.data ?? []).map((c) => [c.id, c.first_name]));
      const seen = new Set<string>();
      const kids: KidItem[] = [];
      (supports.data ?? []).forEach((s) => {
        if (!s.profile_id || seen.has(s.profile_id)) return;
        const name = kidNames.get(s.profile_id);
        if (!name) return;
        seen.add(s.profile_id);
        kids.push({ id: s.profile_id, name, action: s.title, to: "/autonomie/support/" + s.id });
      });

      let budgetLeftCents: number | null = null;
      const bRows = budget.data ?? [];
      if (bRows.length) {
        const inMonth = bRows.filter((r) => r.recurring || (r.month ?? "").slice(0, 7) === monthStart.slice(0, 7));
        const income = inMonth.filter((r) => r.kind === "income").reduce((s, r) => s + r.amount_cents, 0);
        const expense = inMonth.filter((r) => r.kind !== "income").reduce((s, r) => s + r.amount_cents, 0);
        budgetLeftCents = income - expense;
      }

      setSnap({
        loading: false,
        firstName: profile.data?.first_name ?? "",
        streak: profile.data?.current_streak ?? 0,
        lastEmotion: profile.data?.last_emotion ?? null,
        checkedInToday,
        calmScore,
        calmDelta,
        now: now.slice(0, 3),
        kids: kids.slice(0, 2),
        weekDays,
        budgetLeftCents,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { ...snap, reload };
}
