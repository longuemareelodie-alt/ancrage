import { useEffect, useState } from "react";
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

export type TodaySnapshot = {
  loading: boolean;
  firstName: string;
  streak: number;
  lastEmotion: string | null;
  checkedInToday: boolean;
  /** Échéances du jour, triées par heure puis par urgence. Max 4. */
  now: FeedItem[];
  /** Deux propositions contextuelles seulement. */
  suggestions: { label: string; desc: string; to: string }[];
  weekDays: number;
  budgetLeftCents: number | null;
};

const HHMM = (value: string) => value.slice(0, 5);

/**
 * Moteur de priorité du cockpit « Aujourd'hui ».
 *
 * Règle produit : on ne montre jamais tout ce qu'on sait, seulement ce qui a
 * une échéance aujourd'hui, ce qui est en retard, ou ce qui est en cours.
 * Un cockpit qui affiche tout n'est plus un cockpit.
 */
export function useTodayFeed(): TodaySnapshot {
  const [snap, setSnap] = useState<TodaySnapshot>({
    loading: true,
    firstName: "",
    streak: 0,
    lastEmotion: null,
    checkedInToday: false,
    now: [],
    suggestions: [],
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
      const dayStart = new Date(iso + "T00:00:00").toISOString();
      const dayEnd = new Date(iso + "T23:59:59").toISOString();
      const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString();
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
      ] = await Promise.all([
        supabase.from("profiles").select("first_name, current_streak, last_emotion, last_checkin_date").eq("user_id", uid).maybeSingle(),
        supabase.from("appointments").select("id, title, appointment_at, location").gte("appointment_at", dayStart).lte("appointment_at", dayEnd).order("appointment_at"),
        supabase.from("agenda_events").select("id, title, event_time, location").eq("event_date", iso).order("event_time"),
        supabase.from("medications").select("id, name, dosage, schedule_times").eq("active", true),
        supabase.from("todo_items").select("id, title, due_date, priority").eq("done", false).lte("due_date", iso).order("due_date"),
        supabase.from("bills").select("id, label, amount_cents, due_date").eq("is_paid", false).lte("due_date", soon).order("due_date"),
        supabase.from("emotion_checkins").select("created_at, emotion").gte("created_at", weekAgo).order("created_at", { ascending: false }),
        supabase.from("autonomy_supports").select("id, title, support_type").order("updated_at", { ascending: false }).limit(1),
        supabase.from("budget_entries").select("kind, amount_cents, month, recurring"),
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
      const weekDays = new Set(rows.map((r) => r.created_at.slice(0, 10))).size;

      // Deux suggestions maximum, choisies par le contexte (heure, dernier geste).
      const hour = today.getHours();
      const suggestions: TodaySnapshot["suggestions"] = [];
      const support = supports.data?.[0];
      if (support && hour >= 16) {
        suggestions.push({ label: "Reprendre " + support.title, desc: "Support d'autonomie", to: "/autonomie/support/" + support.id });
      }
      if (hour >= 20 || hour < 7) {
        suggestions.push({ label: "M'apaiser", desc: "3 minutes, tout de suite", to: "/moi/apaisement" });
      } else {
        suggestions.push({ label: "Écrire deux lignes", desc: "Journal, 100 % privé", to: "/moi/journal" });
      }
      if (suggestions.length < 2) {
        suggestions.push({ label: "Mon chemin", desc: "Voir où j'en suis", to: "/moi/chemin" });
      }

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
        now: now.slice(0, 4),
        suggestions: suggestions.slice(0, 2),
        weekDays,
        budgetLeftCents,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return snap;
}
