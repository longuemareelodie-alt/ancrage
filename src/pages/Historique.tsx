import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calendar, BarChart3, Smile, Frown, Download, Settings2, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { emotions } from "@/data/emotions";
import { exportCheckinsToPdf, type ExportOptions } from "@/lib/exportCheckinsPdf";
import { exportCheckinsToCsv } from "@/lib/exportCheckinsCsv";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface CheckinEntry {
  emotion: string;
  emotion_type: string;
  created_at: string;
}

const Historique = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CheckinEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [profile, setProfile] = useState<{ first_name?: string; email?: string; current_streak?: number }>({});
  const [exportOpts, setExportOpts] = useState<ExportOptions>({
    includeFirstName: true,
    includeEmail: false,
    anonymize: false,
  });

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [{ data: checkins }, { data: prof }] = await Promise.all([
        supabase
          .from("emotion_checkins")
          .select("emotion, emotion_type, created_at")
          .eq("user_id", user.id)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("first_name, email, current_streak")
          .eq("user_id", user.id)
          .single(),
      ]);

      setData(checkins || []);
      setProfile({
        first_name: prof?.first_name ?? undefined,
        email: prof?.email ?? undefined,
        current_streak: prof?.current_streak ?? 0,
      });
      setLoading(false);
    };
    fetchHistory();
  }, [user]);

  const handleExport = async (format: "pdf" | "csv" = "pdf") => {
    if (!data.length || exporting) return;
    setExporting(true);
    try {
      if (format === "csv") {
        exportCheckinsToCsv(data, profile, exportOpts);
        toast({ title: "CSV prêt 📊", description: "Tes check-ins ont été téléchargés." });
      } else {
        exportCheckinsToPdf(data, profile, exportOpts);
        toast({ title: "PDF prêt 📄", description: "Ton suivi a été téléchargé." });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Export impossible",
        description: "Une erreur est survenue. Réessaie dans un instant.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // --- Derived stats ---
  const totalCheckins = data.length;
  const positiveCount = data.filter((d) => d.emotion_type === "positive").length;
  const negativeCount = data.filter((d) => d.emotion_type === "negative").length;
  const positivePercent = totalCheckins > 0 ? Math.round((positiveCount / totalCheckins) * 100) : 0;

  // Emotion frequency map
  const freqMap = data.reduce<Record<string, number>>((acc, d) => {
    acc[d.emotion] = (acc[d.emotion] || 0) + 1;
    return acc;
  }, {});
  const topEmotions = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const em = emotions.find((e) => e.id === id);
      return { id, label: em?.label || id, emoji: em?.emoji || "", count, type: em?.type || "negative" };
    });

  // Daily trend data (last 30 days)
  const dailyMap = new Map<string, { positive: number; negative: number; score: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { positive: 0, negative: 0, score: 0 });
  }
  data.forEach((entry) => {
    const key = entry.created_at.split("T")[0];
    const day = dailyMap.get(key);
    if (day) {
      if (entry.emotion_type === "positive") {
        day.positive++;
        day.score += 1;
      } else {
        day.negative++;
        day.score -= 1;
      }
    }
  });

  const trendData = Array.from(dailyMap.entries()).map(([date, vals]) => ({
    date,
    label: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    ...vals,
  }));

  // Weekly comparison
  const thisWeek = data.filter((d) => {
    const diff = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const lastWeek = data.filter((d) => {
    const diff = (Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  });
  const thisWeekPositive = thisWeek.filter((d) => d.emotion_type === "positive").length;
  const lastWeekPositive = lastWeek.filter((d) => d.emotion_type === "positive").length;
  const weekTrend = thisWeekPositive - lastWeekPositive;

  // Pie data
  const pieData = [
    { name: "Positif", value: positiveCount, fill: "hsl(var(--primary))" },
    { name: "Négatif", value: negativeCount, fill: "hsl(var(--destructive))" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-lg font-bold">Mon historique émotionnel</h1>
        {totalCheckins > 0 && (
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Options d'export"
                  className="flex items-center justify-center rounded-full bg-secondary p-2 text-foreground shadow-soft transition-transform hover:scale-[1.05]"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Options d'export PDF</p>
                  <p className="text-xs text-muted-foreground">
                    Choisis ce qui apparaît dans le document.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Masquer mes données</p>
                    <p className="text-xs text-muted-foreground">
                      Aucun prénom ni email dans le PDF.
                    </p>
                  </div>
                  <Switch
                    checked={!!exportOpts.anonymize}
                    onCheckedChange={(v) =>
                      setExportOpts((o) => ({ ...o, anonymize: v }))
                    }
                  />
                </div>

                <div className={`space-y-2 ${exportOpts.anonymize ? "opacity-50 pointer-events-none" : ""}`}>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={!!exportOpts.includeFirstName}
                      onCheckedChange={(v) =>
                        setExportOpts((o) => ({ ...o, includeFirstName: !!v }))
                      }
                    />
                    Inclure mon prénom
                    {profile.first_name && (
                      <span className="text-xs text-muted-foreground">({profile.first_name})</span>
                    )}
                  </label>
                  <label className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={!!exportOpts.includeEmail}
                      onCheckedChange={(v) =>
                        setExportOpts((o) => ({ ...o, includeEmail: !!v }))
                      }
                    />
                    Inclure mon email
                    {profile.email && (
                      <span className="truncate text-xs text-muted-foreground">({profile.email})</span>
                    )}
                  </label>
                </div>
              </PopoverContent>
            </Popover>

            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              aria-label="Exporter en CSV"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-foreground shadow-soft transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              CSV
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.03] disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Export…" : "PDF"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6 px-4">
        {totalCheckins === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-8 text-center shadow-sm"
          >
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 font-semibold">Pas encore de données</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fais ton premier check-in pour commencer à suivre tes émotions
            </p>
            <Link
              to="/checkin"
              className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Faire mon check-in
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats overview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">{totalCheckins}</p>
                <p className="text-[11px] text-muted-foreground">Check-ins</p>
              </div>
              <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{positivePercent}%</p>
                <p className="text-[11px] text-muted-foreground">Positifs</p>
              </div>
              <div className="rounded-2xl bg-card p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  {weekTrend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : weekTrend < 0 ? (
                    <TrendingUp className="h-4 w-4 rotate-180 text-destructive" />
                  ) : (
                    <span className="text-lg">—</span>
                  )}
                  <p className="text-2xl font-bold">
                    {weekTrend > 0 ? `+${weekTrend}` : weekTrend}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">vs semaine passée</p>
              </div>
            </motion.div>

            {/* Weekly message */}
            {weekTrend !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-foreground">
                  {weekTrend > 0
                    ? "📈 Tu te sens mieux que la semaine dernière. Continue comme ça 💛"
                    : "💛 Semaine difficile, mais tu es là. C'est ce qui compte."}
                </p>
              </motion.div>
            )}

            {/* Trend chart */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Tendance sur 30 jours</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(235, 100%, 65%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(235, 100%, 65%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      interval={6}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        value > 0 ? `+${value} positif` : value < 0 ? `${value} négatif` : "neutre",
                        "Score",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(235, 100%, 65%)"
                      strokeWidth={2}
                      fill="url(#colorPositive)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Positive / Negative split */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card p-5 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-bold">Répartition émotionnelle</h3>
              <div className="flex items-center gap-6">
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      <span className="font-bold">{positiveCount}</span> positifs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Frown className="h-4 w-4 text-destructive" />
                    <span className="text-sm">
                      <span className="font-bold">{negativeCount}</span> négatifs
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top emotions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-card p-5 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-bold">Tes émotions les plus fréquentes</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEmotions} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {topEmotions.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.type === "positive" ? "hsl(235, 100%, 65%)" : "hsl(0, 84%, 60%)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Daily grid - last 30 days */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Calendrier des 30 derniers jours</h3>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {trendData.map((day) => {
                  const hasCheckin = day.positive + day.negative > 0;
                  const isPositive = day.positive > day.negative;
                  return (
                    <div
                      key={day.date}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium ${
                        !hasCheckin
                          ? "bg-secondary text-muted-foreground/50"
                          : isPositive
                          ? "bg-primary/20 text-primary"
                          : "bg-destructive/15 text-destructive"
                      }`}
                      title={`${day.label}: ${day.positive} positif, ${day.negative} négatif`}
                    >
                      {new Date(day.date).getDate()}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-primary/20" /> Positif
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-destructive/15" /> Négatif
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded bg-secondary" /> Pas de check-in
                </div>
              </div>
            </motion.div>

            {/* Encouragement */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground pb-4"
            >
              Chaque check-in compte. Tu construis ta conscience émotionnelle. 💛
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
};

export default Historique;
