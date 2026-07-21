import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Pill,
  ListTodo,
  Wallet,
  ShoppingCart,
  FolderLock,
  Heart,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Snapshot = {
  lastEmotion: { emotion: string; created_at: string } | null;
  todayEvents: { id: string; title: string; event_time: string | null }[];
  todayMeds: { id: string; name: string; times: string[] }[];
  priorityTodos: { id: string; title: string; due_date: string | null; priority: string | null }[];
  budgetRemaining: number; // cents, remaining for the month
  dailyBudget: number; // cents/day for remaining days
  daysLeft: number;
  shoppingCount: number;
  recentDocs: { id: string; name: string; category: string }[];
};

const eur = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const todayStr = () => new Date().toISOString().slice(0, 10);

const endOfMonth = (d = new Date()) => {
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return e;
};

export default function CommandCenter() {
  const { user } = useAuth();
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const today = todayStr();
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthKey = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}-01`;

      const [
        lastEmotionRes,
        eventsRes,
        medsRes,
        todosRes,
        budgetRes,
        shopRes,
        docsRes,
      ] = await Promise.all([
        supabase
          .from("emotion_checkins")
          .select("emotion,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("agenda_events")
          .select("id,title,event_time")
          .eq("user_id", user.id)
          .eq("event_date", today)
          .order("event_time", { ascending: true, nullsFirst: true }),
        supabase
          .from("medications")
          .select("id,name,schedule_times,active,start_date,end_date")
          .eq("user_id", user.id)
          .eq("active", true),
        supabase
          .from("todo_items")
          .select("id,title,due_date,priority,done")
          .eq("user_id", user.id)
          .eq("done", false)
          .order("due_date", { ascending: true, nullsFirst: false })
          .limit(4),
        supabase
          .from("budget_entries")
          .select("amount_cents,kind,recurring,month")
          .eq("user_id", user.id),
        supabase
          .from("shopping_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("checked", false),
        supabase
          .from("vault_documents")
          .select("id,name,category")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      // Budget: revenus - dépenses du mois courant (récurrentes + du mois)
      let income = 0;
      let expense = 0;
      (budgetRes.data || []).forEach((r: any) => {
        const inMonth = r.recurring || (r.month && r.month.startsWith(monthKey.slice(0, 7)));
        if (!inMonth) return;
        if (r.kind === "income") income += r.amount_cents;
        else expense += r.amount_cents;
      });
      const remaining = income - expense;
      const now = new Date();
      const daysLeft = Math.max(1, endOfMonth(now).getDate() - now.getDate() + 1);
      const daily = Math.max(0, Math.round(remaining / daysLeft));

      // Meds today: filter by date range if provided
      const meds = (medsRes.data || [])
        .filter((m: any) => {
          if (m.start_date && m.start_date > today) return false;
          if (m.end_date && m.end_date < today) return false;
          return true;
        })
        .slice(0, 4)
        .map((m: any) => ({ id: m.id, name: m.name, times: m.schedule_times || [] }));

      if (cancelled) return;
      setSnap({
        lastEmotion: lastEmotionRes.data as any,
        todayEvents: (eventsRes.data as any) || [],
        todayMeds: meds,
        priorityTodos: (todosRes.data as any) || [],
        budgetRemaining: remaining,
        dailyBudget: daily,
        daysLeft,
        shoppingCount: shopRes.count || 0,
        recentDocs: (docsRes.data as any) || [],
      });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const firstName = ""; // parent Dashboard already shows greeting
  const today = new Date();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-soft"
      aria-label="Centre de commande"
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-lg font-semibold">Centre de commande</h2>
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          {format(today, "EEEE d MMM", { locale: fr })}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {/* Émotion */}
        <Widget
          to="/emotions"
          icon={<Heart className="h-4 w-4" />}
          label="Dernière émotion"
          value={
            snap?.lastEmotion?.emotion
              ? snap.lastEmotion.emotion.charAt(0).toUpperCase() + snap.lastEmotion.emotion.slice(1)
              : "—"
          }
          hint={snap?.lastEmotion ? format(new Date(snap.lastEmotion.created_at), "d MMM · HH'h'mm", { locale: fr }) : "Aucun check-in"}
          tone="rose"
          loading={loading}
        />

        {/* RDV aujourd'hui */}
        <Widget
          to="/organisation"
          icon={<Calendar className="h-4 w-4" />}
          label="Rendez-vous"
          value={snap ? String(snap.todayEvents.length) : "—"}
          hint={
            snap && snap.todayEvents[0]
              ? `${snap.todayEvents[0].event_time?.slice(0, 5) || "—"} · ${snap.todayEvents[0].title}`
              : "Aucun aujourd'hui"
          }
          tone="sage"
          loading={loading}
        />

        {/* Médicaments */}
        <Widget
          to="/sante-medicaments"
          icon={<Pill className="h-4 w-4" />}
          label="Médicaments"
          value={snap ? String(snap.todayMeds.length) : "—"}
          hint={
            snap && snap.todayMeds[0]
              ? snap.todayMeds[0].name +
                (snap.todayMeds[0].times[0] ? ` · ${snap.todayMeds[0].times[0]}` : "")
              : "Aucun actif"
          }
          tone="sky"
          loading={loading}
        />

        {/* Priorités */}
        <Widget
          to="/organisation"
          icon={<ListTodo className="h-4 w-4" />}
          label="À faire"
          value={snap ? String(snap.priorityTodos.length) : "—"}
          hint={snap && snap.priorityTodos[0] ? snap.priorityTodos[0].title : "Rien en attente"}
          tone="sand"
          loading={loading}
        />

        {/* Budget restant */}
        <Widget
          to="/budget"
          icon={<Wallet className="h-4 w-4" />}
          label="Reste ce mois"
          value={snap ? eur(snap.budgetRemaining) : "—"}
          hint={snap ? `${eur(snap.dailyBudget)}/jour · ${snap.daysLeft}j restants` : "—"}
          tone="sage"
          loading={loading}
        />

        {/* Courses */}
        <Widget
          to="/organisation"
          icon={<ShoppingCart className="h-4 w-4" />}
          label="Courses"
          value={snap ? String(snap.shoppingCount) : "—"}
          hint={snap && snap.shoppingCount > 0 ? "articles à acheter" : "Liste vide"}
          tone="blush"
          loading={loading}
        />
      </div>

      {/* Documents récents */}
      {snap && snap.recentDocs.length > 0 && (
        <Link
          to="/coffre"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FolderLock className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Derniers documents
            </p>
            <p className="truncate text-sm">
              {snap.recentDocs.map((d) => d.name).join(" · ")}
            </p>
          </div>
        </Link>
      )}
    </motion.section>
  );
}

function Widget({
  to,
  icon,
  label,
  value,
  hint,
  tone,
  loading,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: "rose" | "sage" | "sky" | "sand" | "blush";
  loading?: boolean;
}) {
  const toneCls: Record<string, string> = {
    rose: "bg-primary/10 text-primary",
    sage: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    sand: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    blush: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  };
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/60 p-3 transition-all hover:border-primary/40 hover:shadow-soft active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneCls[tone]}`}>
          {icon}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div>
        <p className={`font-serif text-xl font-semibold leading-tight ${loading ? "opacity-40" : ""}`}>
          {value}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </Link>
  );
}
