import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, Receipt, PieChart as PieIcon, CheckCircle2, Circle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, differenceInDays, endOfMonth } from "date-fns";
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

const CATEGORIES: Record<Kind, string[]> = {
  income: ["Salaire", "CAF", "Pension alimentaire", "Allocations", "Autres revenus"],
  fixed: ["Loyer", "Eau", "Électricité", "Gaz", "Internet", "Téléphone", "Assurances", "Crédits", "Abonnements"],
  variable: ["Courses", "Pharmacie", "Essence", "Animaux", "Santé", "École", "Loisirs", "Vêtements", "Divers"],
};

const PALETTE = ["#c9a882", "#d4b896", "#e0c9a6", "#b89968", "#a68355", "#8b6f47", "#6b5638", "#4a3d29"];

const eur = (cents: number) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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
    const daysLeft = Math.max(1, differenceInDays(endOfMonth(new Date()), new Date()) + 1);
    const perDay = rest > 0 ? Math.floor(rest / daysLeft) : 0;
    return { income, fixed, variable, expenses, rest, daysLeft, perDay };
  }, [entries]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    entries.filter((e) => e.kind !== "income").forEach((e) => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount_cents);
    });
    return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
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
          <p className="mt-2 text-muted-foreground">Une vue claire sur ton mois, sans charge mentale.</p>
        </motion.header>

        {/* Résumé */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard label="Revenus" value={eur(totals.income)} color="text-emerald-600" icon={TrendingUp} />
          <SummaryCard label="Dépenses" value={eur(totals.expenses)} color="text-rose-500" icon={TrendingDown} />
          <SummaryCard label="Reste à vivre" value={eur(totals.rest)} color={totals.rest >= 0 ? "text-primary" : "text-rose-600"} icon={Wallet} />
          <SummaryCard label={`Sur ${totals.daysLeft} j`} value={eur(totals.perDay) + "/j"} color="text-foreground" icon={Calendar} />
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
              <CardHeader><CardTitle className="text-base">Ton mois en un coup d'œil</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Revenus totaux" value={eur(totals.income)} />
                <Row label="Dépenses fixes" value={eur(totals.fixed)} />
                <Row label="Dépenses variables" value={eur(totals.variable)} />
                <div className="border-t pt-2" />
                <Row label="Reste à vivre" value={eur(totals.rest)} bold />
                <Row label="Budget quotidien" value={eur(totals.perDay) + " / jour"} />
                <Row label="Jours restants ce mois" value={`${totals.daysLeft} jours`} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            {(["income", "fixed", "variable"] as Kind[]).map((k) => (
              <Card key={k}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">{k === "income" ? "Revenus" : k === "fixed" ? "Dépenses fixes" : "Dépenses variables"}</CardTitle>
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
                      <div>
                        <p className="text-sm font-medium">{e.label}</p>
                        <p className="text-xs text-muted-foreground">{e.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{eur(e.amount_cents)}</span>
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
                {bills.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <button onClick={() => toggleBillPaid(b)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                      {b.is_paid ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${b.is_paid ? "line-through text-muted-foreground" : ""}`}>{b.label}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(b.due_date), "d MMM yyyy", { locale: fr })}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{eur(b.amount_cents)}</span>
                      <Button size="icon" variant="ghost" onClick={() => removeBill(b.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieIcon className="h-4 w-4" /> Répartition des dépenses</CardTitle></CardHeader>
              <CardContent>
                {byCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">Ajoute des dépenses pour voir la répartition.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>
                          {byCategory.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <RTooltip formatter={(v: number) => eur(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Revenus vs dépenses</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Revenus", value: totals.income / 100 },
                      { name: "Fixes", value: totals.fixed / 100 },
                      { name: "Variables", value: totals.variable / 100 },
                    ]}>
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
        <p className={`text-lg font-semibold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function EntryDialog({ open, kind, onOpenChange, onSaved, userId }: { open: boolean; kind: Kind | null; onOpenChange: (v: boolean) => void; onSaved: () => void; userId?: string }) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => { if (open) { setLabel(""); setAmount(""); setCategory(kind ? CATEGORIES[kind][0] : ""); } }, [open, kind]);

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
        <DialogHeader><DialogTitle>Ajouter {kind === "income" ? "un revenu" : "une dépense"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{kind && CATEGORIES[kind].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Libellé</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : Loyer août" /></div>
          <div><Label>Montant (€)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
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
          <div><Label>Montant (€)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
          <div><Label>Date d'échéance</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={save}>Enregistrer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
