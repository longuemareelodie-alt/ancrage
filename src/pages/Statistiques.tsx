import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Heart, Wallet, CheckCircle2, BookOpen, Calendar, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfDay, eachDayOfInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const PALETTE = ["#c9a882", "#d4b896", "#e0c9a6", "#b89968", "#a68355", "#8b6f47", "#6b5638"];
const MOOD_SCORE: Record<string, number> = { calm: 4, ok: 3, tense: 2, overflow: 1 };
const MOOD_LABEL: Record<string, string> = { calm: "Calme", ok: "OK", tense: "Tendue", overflow: "Débordée" };
const eur = (c: number) => (c / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

interface Stats {
  emotions: { date: string; mood: string; created_at: string }[];
  moods: { mood: string; created_at: string }[];
  budget: { kind: string; category: string; amount_cents: number }[];
  todos: { is_done: boolean; created_at: string; completed_at: string | null }[];
  journal: { created_at: string }[];
  agenda: { created_at: string; starts_at: string }[];
  appointments: { date: string }[];
}

export default function Statistiques() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const since = subDays(new Date(), 30).toISOString();
      const [e, m, b, t, j, a, ap] = await Promise.all([
        supabase.from("emotion_checkins").select("date,mood,created_at").eq("user_id", user.id).gte("created_at", since).order("created_at"),
        supabase.from("mood_responses").select("mood,created_at").eq("user_id", user.id).gte("created_at", since).order("created_at"),
        supabase.from("budget_entries").select("kind,category,amount_cents").eq("user_id", user.id),
        supabase.from("todo_items").select("is_done,created_at,completed_at").eq("user_id", user.id).gte("created_at", since),
        supabase.from("private_journal_entries").select("created_at").eq("user_id", user.id).gte("created_at", since),
        supabase.from("agenda_events").select("created_at,starts_at").eq("user_id", user.id).gte("starts_at", since),
        supabase.from("appointments").select("date").eq("user_id", user.id).gte("date", subDays(new Date(), 90).toISOString().slice(0, 10)),
      ]);
      setData({
        emotions: (e.data as any) || [],
        moods: (m.data as any) || [],
        budget: (b.data as any) || [],
        todos: (t.data as any) || [],
        journal: (j.data as any) || [],
        agenda: (a.data as any) || [],
        appointments: (ap.data as any) || [],
      });
      setLoading(false);
    })();
  }, [user]);

  const emotionSeries = useMemo(() => {
    if (!data) return [];
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    return days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const entries = [
        ...data.emotions.filter((x) => (x.date || x.created_at).slice(0, 10) === key),
        ...data.moods.filter((x) => x.created_at.slice(0, 10) === key),
      ];
      const scores = entries.map((x) => MOOD_SCORE[x.mood] || 0).filter(Boolean);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      return { day: format(d, "dd/MM", { locale: fr }), score: avg, count: entries.length };
    });
  }, [data]);

  const moodDistribution = useMemo(() => {
    if (!data) return [];
    const all = [...data.emotions, ...data.moods];
    const counts: Record<string, number> = {};
    all.forEach((x) => { counts[x.mood] = (counts[x.mood] || 0) + 1; });
    return Object.entries(counts).map(([mood, value]) => ({ name: MOOD_LABEL[mood] || mood, value }));
  }, [data]);

  const budgetSummary = useMemo(() => {
    if (!data) return { income: 0, fixed: 0, variable: 0, reste: 0, byCat: [] as any[] };
    const income = data.budget.filter((x) => x.kind === "income").reduce((s, x) => s + x.amount_cents, 0);
    const fixed = data.budget.filter((x) => x.kind === "fixed").reduce((s, x) => s + x.amount_cents, 0);
    const variable = data.budget.filter((x) => x.kind === "variable").reduce((s, x) => s + x.amount_cents, 0);
    const catMap: Record<string, number> = {};
    data.budget.filter((x) => x.kind !== "income").forEach((x) => {
      catMap[x.category] = (catMap[x.category] || 0) + x.amount_cents;
    });
    const byCat = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
    return { income, fixed, variable, reste: income - fixed - variable, byCat };
  }, [data]);

  const productivity = useMemo(() => {
    if (!data) return { done: 0, total: 0, rate: 0 };
    const done = data.todos.filter((t) => t.is_done).length;
    return { done, total: data.todos.length, rate: data.todos.length ? Math.round((done / data.todos.length) * 100) : 0 };
  }, [data]);

  const journalStreak = useMemo(() => {
    if (!data) return 0;
    const days = new Set(data.journal.map((j) => j.created_at.slice(0, 10)));
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const key = format(subDays(new Date(), i), "yyyy-MM-dd");
      if (days.has(key)) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [data]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf6f1] to-[#f0e6d8] flex items-center justify-center">
        <div className="animate-pulse text-[#8b6f47]">Chargement de tes statistiques…</div>
      </div>
    );
  }

  const kpis = [
    { icon: Heart, label: "Check-ins émotions", value: data.emotions.length + data.moods.length, hint: "30 derniers jours", color: "text-rose-600" },
    { icon: BookOpen, label: "Série journal", value: `${journalStreak}j`, hint: "Consécutifs", color: "text-amber-700" },
    { icon: CheckCircle2, label: "To-do terminées", value: `${productivity.done}/${productivity.total}`, hint: `${productivity.rate}% cette période`, color: "text-emerald-700" },
    { icon: Calendar, label: "Rendez-vous santé", value: data.appointments.length, hint: "90 derniers jours", color: "text-sky-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f1] to-[#f0e6d8] pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#8b6f47]" />
            <h1 className="text-3xl md:text-4xl font-serif text-[#4a3d29]">Tes statistiques</h1>
          </div>
          <p className="text-[#6b5638]">Un aperçu doux de ton évolution sur les 30 derniers jours.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {kpis.map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-[#e0c9a6]/60 bg-white/70 backdrop-blur">
                <CardContent className="p-4">
                  <k.icon className={`w-5 h-5 mb-2 ${k.color}`} />
                  <div className="text-2xl font-serif text-[#4a3d29]">{k.value}</div>
                  <div className="text-xs text-[#6b5638] font-medium">{k.label}</div>
                  <div className="text-[10px] text-[#8b6f47]/70 mt-1">{k.hint}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="emotions">
          <TabsList className="bg-white/60 border border-[#e0c9a6]/60 mb-4">
            <TabsTrigger value="emotions">Émotions</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
          </TabsList>

          <TabsContent value="emotions" className="space-y-4">
            <Card className="border-[#e0c9a6]/60 bg-white/70">
              <CardHeader><CardTitle className="text-[#4a3d29] flex items-center gap-2"><Heart className="w-4 h-4" /> Tendance émotionnelle</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0c9a6" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b5638" }} interval={3} />
                      <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 11, fill: "#6b5638" }} tickFormatter={(v) => ["", "😔", "😐", "🙂", "😌"][v] || ""} />
                      <RTooltip contentStyle={{ background: "#fff", border: "1px solid #e0c9a6", borderRadius: 8 }} formatter={(v: any) => v?.toFixed?.(1) ?? "-"} />
                      <Line type="monotone" dataKey="score" stroke="#8b6f47" strokeWidth={2} dot={{ r: 3, fill: "#c9a882" }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-[#8b6f47]/80 mt-2">Moyenne quotidienne : 😌 calme &gt; 🙂 ok &gt; 😐 tendue &gt; 😔 débordée</p>
              </CardContent>
            </Card>

            {moodDistribution.length > 0 && (
              <Card className="border-[#e0c9a6]/60 bg-white/70">
                <CardHeader><CardTitle className="text-[#4a3d29]">Répartition des humeurs</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={moodDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={2}>
                          {moodDistribution.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                        </Pie>
                        <RTooltip contentStyle={{ background: "#fff", border: "1px solid #e0c9a6", borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    {moodDistribution.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#6b5638]">
                        <span className="w-3 h-3 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                        {m.name} · {m.value}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-[#e0c9a6]/60 bg-white/70"><CardContent className="p-4">
                <TrendingUp className="w-4 h-4 text-emerald-700 mb-2" />
                <div className="text-lg font-serif text-[#4a3d29]">{eur(budgetSummary.income)}</div>
                <div className="text-xs text-[#6b5638]">Revenus</div>
              </CardContent></Card>
              <Card className="border-[#e0c9a6]/60 bg-white/70"><CardContent className="p-4">
                <TrendingDown className="w-4 h-4 text-rose-600 mb-2" />
                <div className="text-lg font-serif text-[#4a3d29]">{eur(budgetSummary.fixed)}</div>
                <div className="text-xs text-[#6b5638]">Charges fixes</div>
              </CardContent></Card>
              <Card className="border-[#e0c9a6]/60 bg-white/70"><CardContent className="p-4">
                <TrendingDown className="w-4 h-4 text-amber-700 mb-2" />
                <div className="text-lg font-serif text-[#4a3d29]">{eur(budgetSummary.variable)}</div>
                <div className="text-xs text-[#6b5638]">Variables</div>
              </CardContent></Card>
              <Card className={`border-[#e0c9a6]/60 ${budgetSummary.reste >= 0 ? "bg-emerald-50/70" : "bg-rose-50/70"}`}><CardContent className="p-4">
                <Wallet className="w-4 h-4 text-[#8b6f47] mb-2" />
                <div className="text-lg font-serif text-[#4a3d29]">{eur(budgetSummary.reste)}</div>
                <div className="text-xs text-[#6b5638]">Reste à vivre</div>
              </CardContent></Card>
            </div>

            {budgetSummary.byCat.length > 0 && (
              <Card className="border-[#e0c9a6]/60 bg-white/70">
                <CardHeader><CardTitle className="text-[#4a3d29]">Top dépenses par catégorie</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetSummary.byCat} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0c9a6" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#6b5638" }} tickFormatter={(v) => eur(v)} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b5638" }} width={90} />
                        <RTooltip contentStyle={{ background: "#fff", border: "1px solid #e0c9a6", borderRadius: 8 }} formatter={(v: any) => eur(v)} />
                        <Bar dataKey="value" fill="#c9a882" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {budgetSummary.income === 0 && budgetSummary.fixed === 0 && (
              <Card className="border-dashed border-[#e0c9a6] bg-white/40">
                <CardContent className="p-6 text-center text-[#6b5638] text-sm">
                  <Sparkles className="w-5 h-5 mx-auto mb-2 text-[#c9a882]" />
                  Ajoute tes revenus et charges dans le module Budget pour voir tes statistiques ici.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="organisation" className="space-y-4">
            <Card className="border-[#e0c9a6]/60 bg-white/70">
              <CardHeader><CardTitle className="text-[#4a3d29]">Ta productivité</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#6b5638]">To-do complétées</span>
                  <span className="text-lg font-serif text-[#4a3d29]">{productivity.rate}%</span>
                </div>
                <div className="h-3 bg-[#f0e6d8] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#c9a882] to-[#8b6f47]"
                    initial={{ width: 0 }}
                    animate={{ width: `${productivity.rate}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-xs text-[#8b6f47]/80 mt-3">{productivity.done} tâches terminées sur {productivity.total} créées ces 30 derniers jours.</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-[#e0c9a6]/60 bg-white/70"><CardContent className="p-4">
                <Calendar className="w-4 h-4 text-[#8b6f47] mb-2" />
                <div className="text-2xl font-serif text-[#4a3d29]">{data.agenda.length}</div>
                <div className="text-xs text-[#6b5638]">Événements agenda</div>
              </CardContent></Card>
              <Card className="border-[#e0c9a6]/60 bg-white/70"><CardContent className="p-4">
                <BookOpen className="w-4 h-4 text-[#8b6f47] mb-2" />
                <div className="text-2xl font-serif text-[#4a3d29]">{data.journal.length}</div>
                <div className="text-xs text-[#6b5638]">Entrées journal</div>
              </CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
