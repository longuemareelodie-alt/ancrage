import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, Receipt, PieChart as PieIcon,
  CheckCircle2, Circle, Calendar, CalendarDays, Sparkles, AlertCircle, Target,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, differenceInDays, endOfMonth, addDays, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

type Kind = "income" | "fixed" | "variable";

interface Entry {
  id: string;
  kind: Kind;
  category: string;
  label: string;
  amount_cents: number;
}

interface Bill {
  id: string;
  label: string;
  amount_cents: number;
  due_date: string;
  is_paid: boolean;
  reminder_enabled: boolean;
  notes: string | null;
}

/** Catégories premium enrichies avec emoji pour repérage rapide. */
const CATEGORIES: Record<Kind, { name: string; emoji: string }[]> = {
  income: [
    { name: "Salaire", emoji: "💼" },
    { name: "CAF", emoji: "🏛️" },
    { name: "Pension alimentaire", emoji: "👨‍👩‍👧" },
    { name: "Allocations", emoji: "🤱" },
    { name: "Freelance / Indépendante", emoji: "💻" },
    { name: "Remboursements", emoji: "💸" },
    { name: "Aides ponctuelles", emoji: "🤝" },
    { name: "Autres revenus", emoji: "✨" },
  ],
  fixed: [
    { name: "Loyer / Prêt", emoji: "🏠" },
    { name: "Eau", emoji: "💧" },
    { name: "Électricité", emoji: "⚡" },
    { name: "Gaz / Chauffage", emoji: "🔥" },
    { name: "Internet / TV", emoji: "📡" },
    { name: "Téléphone", emoji: "📱" },
    { name: "Assurances", emoji: "🛡️" },
    { name: "Mutuelle", emoji: "🏥" },
    { name: "Crédits", emoji: "🏦" },
    { name: "Abonnements", emoji: "📺" },
    { name: "Crèche / Nounou", emoji: "🍼" },
    { name: "Cantine / Périscolaire", emoji: "🍽️" },
    { name: "Impôts mensualisés", emoji: "📊" },
    { name: "Épargne automatique", emoji: "🌱" },
  ],
  variable: [
    { name: "Courses alimentaires", emoji: "🛒" },
    { name: "Pharmacie / Santé", emoji: "💊" },
    { name: "Essence / Transport", emoji: "⛽" },
    { name: "Animaux", emoji: "🐾" },
    { name: "École / Fournitures", emoji: "🎒" },
    { name: "Activités enfants", emoji: "🎨" },
    { name: "Vêtements", emoji: "👗" },
    { name: "Loisirs / Sorties", emoji: "🎭" },
    { name: "Restaurants", emoji: "🍽️" },
    { name: "Cadeaux", emoji: "🎁" },
    { name: "Beauté / Bien-être", emoji: "💆" },
    { name: "Maison / Déco", emoji: "🛋️" },
    { name: "Imprévus", emoji: "⚠️" },
    { name: "Divers", emoji: "📦" },
  ],
};

const emojiFor = (kind: Kind, name: string): string =>
  CATEGORIES[kind].find((c) => c.name === name)?.emoji ??
  (Object.values(CATEGORIES).flat().find((c) => c.name === name)?.emoji ?? "•");

const PALETTE = ["#c9a882", "#d4b896", "#e0c9a6", "#b89968", "#a68355", "#8b6f47", "#6b5638", "#4a3d29", "#a8917a", "#d9c2a3"];

const eur = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const eurPrecise = (cents: number) =>
  (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function Budget() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKind, setOpenKind] = useState<Kind | null>(null);
  const [openBill, setOpenBill] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: e }, { data: b }] = await Promise.all([
      supabase.from("budget_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bills").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
    ]);
    setEntries((e as Entry[]) || []);
    setBills((b as Bill[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totals = useMemo(() => {
    const income = entries.filter((x) => x.kind === "income").reduce((s, x) => s + x.amount_cents, 0);
    const fixed = entries.filter((x) => x.kind === "fixed").reduce((s, x) => s + x.amount_cents, 0);
    const variable = entries.filter((x) => x.kind === "variable").reduce((s, x) => s + x.amount_cents, 0);
    const expenses = fixed + variable;
    const rest = income - expenses;

    const now = new Date();
    const daysLeft = Math.max(1, differenceInDays(endOfMonth(now), now) + 1);
    const perDay = rest > 0 ? Math.floor(rest / daysLeft) : 0;
    const perWeek = perDay * 7;

    // Ratios & alertes
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 0;
    const fixedRatio = income > 0 ? Math.round((fixed / income) * 100) : 0;
    const savingsRate = income > 0 ? Math.max(0, Math.round((rest / income) * 100)) : 0;

    // Factures à venir sous 7 jours (non payées)
    const soon = bills.filter(
      (b) => !b.is_paid && !isBefore(addDays(now, 7), new Date(b.due_date)) && !isBefore(new Date(b.due_date), now)
    );
    const soonTotal = soon.reduce((s, b) => s + b.amount_cents, 0);

    // Factures en retard
    const overdue = bills.filter((b) => !b.is_paid && isBefore(new Date(b.due_date), now));
    const overdueTotal = overdue.reduce((s, b) => s + b.amount_cents, 0);

    return {
      income, fixed, variable, expenses, rest, daysLeft, perDay, perWeek,
      expenseRatio, fixedRatio, savingsRate,
      soon, soonTotal, overdue, overdueTotal,
    };
  }, [entries, bills]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { kind: Kind; value: number }>();
    entries.filter((e) => e.kind !== "income").forEach((e) => {
      const key = e.category;
      const cur = map.get(key);
      map.set(key, { kind: e.kind, value: (cur?.value || 0) + e.amount_cents });
    });
    return Array.from(map, ([name, { kind, value }]) => ({ name, kind, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const removeEntry = async (id: string) => {
    await supabase.from("budget_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleBillPaid = async (bill: Bill) => {
    const next = !bill.is_paid;
    await supabase.from("bills").update({ is_paid: next, paid_at: next ? new Date().toISOString() : null }).eq("id", bill.id);
    setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, is_paid: next } : b)));
  };

  const removeBill = async (id: string) => {
    await supabase.from("bills").delete().eq("id", id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Budget
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ton mois en un coup d'œil — reste à vivre, budget quotidien et hebdomadaire calculés en temps réel.
          </p>
        </motion.header>

        {/* Alertes factures */}
        {(totals.overdue.length > 0 || totals.soon.length > 0) && (
          <div className="mb-4 space-y-2">
            {totals.overdue.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/40 dark:bg-rose-950/30">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                <div className="text-sm">
                  <p className="font-semibold text-rose-900 dark:text-rose-200">
                    {totals.overdue.length} facture{totals.overdue.length > 1 ? "s" : ""} en retard — {eur(totals.overdueTotal)}
                  </p>
                </div>
              </div>
            )}
            {totals.soon.length > 0 && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                <Receipt className="h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    {totals.soon.length} facture{totals.soon.length > 1 ? "s" : ""} dans les 7 jours — {eur(totals.soonTotal)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Résumé premium — 4 cartes principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <SummaryCard label="Revenus" value={eur(totals.income)} color="text-emerald-600" icon={TrendingUp} />
          <SummaryCard label="Dépenses" value={eur(totals.expenses)} color="text-rose-500" icon={TrendingDown} />
          <SummaryCard
            label="Reste à vivre"
            value={eur(totals.rest)}
            color={totals.rest >= 0 ? "text-primary" : "text-rose-600"}
            icon={Wallet}
          />
          <SummaryCard label="Épargne" value={`${totals.savingsRate} %`} color="text-primary" icon={Target} />
        </div>

        {/* Budget quotidien + hebdomadaire — cartes premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Calendar className="h-3.5 w-3.5" /> Budget quotidien
              </div>
              <p className="font-playfair text-3xl font-semibold text-foreground">
                {eur(totals.perDay)}<span className="text-base text-muted-foreground">/jour</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pour tenir les {totals.daysLeft} jour{totals.daysLeft > 1 ? "s" : ""} restant{totals.daysLeft > 1 ? "s" : ""} de {format(new Date(), "MMMM", { locale: fr })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Budget hebdomadaire
              </div>
              <p className="font-playfair text-3xl font-semibold text-foreground">
                {eur(totals.perWeek)}<span className="text-base text-muted-foreground">/sem.</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Base {eur(totals.perDay)} × 7 jours — ajuste selon tes achats de la semaine
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Vue</TabsTrigger>
            <TabsTrigger value="entries">Lignes</TabsTrigger>
            <TabsTrigger value="bills">Factures</TabsTrigger>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Ton mois en un coup d'œil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Revenus totaux" value={eurPrecise(totals.income)} />
                <Row label="Dépenses fixes" value={`${eurPrecise(totals.fixed)} · ${totals.fixedRatio}%`} />
                <Row label="Dépenses variables" value={eurPrecise(totals.variable)} />
                <div className="border-t pt-2" />
                <Row label="Reste à vivre" value={eurPrecise(totals.rest)} bold />
                <Row label="Budget quotidien" value={`${eurPrecise(totals.perDay)} / jour`} />
                <Row label="Budget hebdomadaire" value={`${eurPrecise(totals.perWeek)} / semaine`} />
                <Row label="Jours restants ce mois" value={`${totals.daysLeft} jours`} />
                <Row label="Taux d'épargne" value={`${totals.savingsRate}%`} />
              </CardContent>
            </Card>

            {/* Barre d'utilisation du budget */}
            {totals.income > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Répartition des revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex justify-between text-xs text-muted-foreground">
                    <span>{totals.expenseRatio}% dépensé</span>
                    <span>{totals.savingsRate}% épargné</span>
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="bg-rose-400"
                      style={{ width: `${Math.min(100, (totals.fixed / totals.income) * 100)}%` }}
                      title={`Fixes ${eur(totals.fixed)}`}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${Math.min(100, (totals.variable / totals.income) * 100)}%` }}
                      title={`Variables ${eur(totals.variable)}`}
                    />
                    <div
                      className="bg-emerald-400"
                      style={{ width: `${Math.min(100, (Math.max(0, totals.rest) / totals.income) * 100)}%` }}
                      title={`Reste ${eur(totals.rest)}`}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    <LegendDot color="bg-rose-400" label={`Fixes · ${eur(totals.fixed)}`} />
                    <LegendDot color="bg-amber-400" label={`Variables · ${eur(totals.variable)}`} />
                    <LegendDot color="bg-emerald-400" label={`Reste · ${eur(Math.max(0, totals.rest))}`} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            {(["income", "fixed", "variable"] as Kind[]).map((k) => (
              <Card key={k}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">
                    {k === "income" ? "Revenus" : k === "fixed" ? "Dépenses fixes" : "Dépenses variables"}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      · {eur(entries.filter((e) => e.kind === k).reduce((s, e) => s + e.amount_cents, 0))}
                    </span>
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setOpenKind(k)}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-1">
                  {entries.filter((e) => e.kind === k).length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Aucune ligne pour l'instant.</p>
                  )}
                  {entries.filter((e) => e.kind === k).map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg" aria-hidden>{emojiFor(k, e.category)}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{e.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{e.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold tabular-nums">{eur(e.amount_cents)}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeEntry(e.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4" /> Factures</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setOpenBill(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-1">
                {bills.length === 0 && <p className="text-sm text-muted-foreground py-2">Aucune facture enregistrée.</p>}
                {bills.map((b) => {
                  const overdue = !b.is_paid && isBefore(new Date(b.due_date), new Date());
                  return (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <button onClick={() => toggleBillPaid(b)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                        {b.is_paid
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          : <Circle className={`h-5 w-5 shrink-0 ${overdue ? "text-rose-500" : "text-muted-foreground"}`} />}
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${b.is_paid ? "line-through text-muted-foreground" : ""}`}>{b.label}</p>
                          <p className={`text-xs ${overdue ? "text-rose-600 font-medium" : "text-muted-foreground"}`}>
                            {overdue && "⚠ "}
                            {format(new Date(b.due_date), "d MMM yyyy", { locale: fr })}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{eur(b.amount_cents)}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeBill(b.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieIcon className="h-4 w-4" /> Répartition des dépenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {byCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">Ajoute des dépenses pour voir la répartition.</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={45}
                          label={(e: any) => `${e.name}`}
                        >
                          {byCategory.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <RTooltip formatter={(v: number) => eur(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {byCategory.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Top catégories</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byCategory.slice(0, 8).map((c) => ({ name: c.name, value: c.value / 100 }))} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis type="number" fontSize={11} />
                        <YAxis dataKey="name" type="category" width={110} fontSize={11} />
                        <RTooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} €`} />
                        <Bar dataKey="value" fill="#c9a882" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">Revenus vs dépenses</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Revenus", value: totals.income / 100 },
                      { name: "Fixes", value: totals.fixed / 100 },
                      { name: "Variables", value: totals.variable / 100 },
                      { name: "Reste", value: Math.max(0, totals.rest) / 100 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <RTooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} €`} />
                      <Bar dataKey="value" fill="#c9a882" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <EntryDialog open={openKind !== null} kind={openKind} onOpenChange={(v) => !v && setOpenKind(null)} onSaved={load} userId={user?.id} />
      <BillDialog open={openBill} onOpenChange={setOpenBill} onSaved={load} userId={user?.id} />
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <p className={`text-lg font-semibold tabular-nums ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}
    </span>
  );
}

function EntryDialog({ open, kind, onOpenChange, onSaved, userId }: { open: boolean; kind: Kind | null; onOpenChange: (v: boolean) => void; onSaved: () => void; userId?: string }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (open) {
      setLabel("");
      setAmount("");
      setCategory(kind ? CATEGORIES[kind][0].name : "");
    }
  }, [open, kind]);

  const save = async () => {
    if (!userId || !kind || !label || !amount) return;
    const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (!cents || cents < 0) return toast.error("Montant invalide");
    const { error } = await supabase.from("budget_entries").insert({
      user_id: userId, kind, category, label, amount_cents: cents,
    });
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Ajouté");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Ajouter {kind === "income" ? "un revenu" : kind === "fixed" ? "une dépense fixe" : "une dépense variable"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {kind && CATEGORIES[kind].map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="mr-2">{c.emoji}</span>{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Libellé</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : Loyer août" /></div>
          <div><Label>Montant (€)</Label><Input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
        </div>
        <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BillDialog({ open, onOpenChange, onSaved, userId }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void; userId?: string }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [due, setDue] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => { if (open) { setLabel(""); setAmount(""); setDue(format(new Date(), "yyyy-MM-dd")); } }, [open]);

  const save = async () => {
    if (!userId || !label || !amount || !due) return;
    const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (!cents || cents < 0) return toast.error("Montant invalide");
    const { error } = await supabase.from("bills").insert({
      user_id: userId, label, amount_cents: cents, due_date: due,
    });
    if (error) return toast.error("Erreur : " + error.message);
    toast.success("Facture ajoutée");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajouter une facture</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Libellé</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : EDF" /></div>
          <div><Label>Montant (€)</Label><Input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
          <div><Label>Date d'échéance</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
