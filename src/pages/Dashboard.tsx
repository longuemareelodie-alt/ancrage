import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Heart, Flame, BarChart3, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDailyMessage } from "@/data/dailyMessages";
import { getStreakLabel } from "@/data/streakLabels";
import { parentize } from "@/lib/parentize";
import { useParentType } from "@/hooks/useParentType";
import logo from "@/assets/logo-ancrage.png";
import InstallPWAPrompt from "@/components/InstallPWAPrompt";
import ResumeBanner from "@/components/ResumeBanner";

type MoodKey = "calm" | "ok" | "tense" | "overflow";
const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string; adjust: number }[] = [
  { key: "calm",     emoji: "🌿", label: "Sereine",  adjust: +10 },
  { key: "ok",       emoji: "🙂", label: "Ça va",    adjust: +3  },
  { key: "tense",    emoji: "😣", label: "Tendue",   adjust: -8  },
  { key: "overflow", emoji: "🌊", label: "Débordée", adjust: -15 },
];
const todayKey = () => new Date().toISOString().slice(0, 10);

const Dashboard = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  // (planType state removed — is_premium is the single source of truth)
  const [streak, setStreak] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [calmScore, setCalmScore] = useState<number>(50);
  const [mood, setMood] = useState<MoodKey | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, current_streak, first_name")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium ?? false);
      const s = data?.current_streak ?? 0;
      setStreak(s);
      setFirstName(data?.first_name ?? "");

      // Compute calm score: base 40 + streak bonus + recent check-ins
      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { count } = await supabase
        .from("emotion_checkins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString());
      const checkins = count ?? 0;
      const score = Math.max(20, Math.min(98, 40 + Math.min(s, 20) * 2 + Math.min(checkins, 14) * 1.5));
      setCalmScore(Math.round(score));

      // Today's mood (cross-device via Supabase, optimistic from cache)
      const cached = localStorage.getItem(`calm_mood_${user.id}_${todayKey()}`);
      if (cached && MOOD_OPTIONS.some((m) => m.key === cached)) {
        setMood(cached as MoodKey);
      }
      const { data: mr } = await supabase
        .from("mood_responses")
        .select("mood")
        .eq("user_id", user.id)
        .eq("response_date", todayKey())
        .maybeSingle();
      if (mr?.mood && MOOD_OPTIONS.some((m) => m.key === mr.mood)) {
        setMood(mr.mood as MoodKey);
        localStorage.setItem(`calm_mood_${user.id}_${todayKey()}`, mr.mood);
      }
    };
    fetchProfile();
  }, [user]);

  const moodAdjust = useMemo(
    () => MOOD_OPTIONS.find((m) => m.key === mood)?.adjust ?? 0,
    [mood],
  );
  const adjustedScore = Math.max(20, Math.min(98, calmScore + moodAdjust));

  const selectMood = async (key: MoodKey) => {
    setMood(key);
    if (!user) return;
    localStorage.setItem(`calm_mood_${user.id}_${todayKey()}`, key);
    const adjust = MOOD_OPTIONS.find((m) => m.key === key)?.adjust ?? 0;
    const { error } = await supabase.from("mood_responses").upsert(
      {
        user_id: user.id,
        response_date: todayKey(),
        mood: key,
        adjust,
      },
      { onConflict: "user_id,response_date" },
    );
    if (error) console.error("mood upsert failed", error);
  };

  const dailyMsg = getDailyMessage();
  const streakInfo = getStreakLabel(streak);
  const hour = new Date().getHours();
  const isMorning = hour < 14;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div />
        <img src={logo} alt="Ancrage" className="h-10 w-auto" />
        <Link
          to="/profil"
          className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
        >
          <User className="h-3.5 w-3.5" />
          Mon espace
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pb-12 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg space-y-8"
        >
          {/* Greeting */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              {firstName ? `Ton moment, ${firstName}` : "Ton moment pour toi"}
            </h1>
            <Link
              to="/calme"
              className="inline-block text-base font-medium text-primary/80 underline-offset-4 hover:underline"
            >
              Ton calme aujourd'hui : {adjustedScore}%
              {mood && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({moodAdjust >= 0 ? "+" : ""}{moodAdjust})
                </span>
              )}
            </Link>
            <p className="text-sm text-muted-foreground">
              {isMorning ? "Comment tu commences ta journée ?" : "Comment s'est passée ta journée ?"}
            </p>
          </div>

          <ResumeBanner />

          {/* Mini check-in : Je suis plutôt… */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-card p-5 shadow-soft space-y-3"
          >
            <div className="text-center space-y-0.5">
              <p className="font-serif text-base font-semibold">Je suis plutôt…</p>
              <p className="text-[11px] text-muted-foreground">
                Ajuste ton score de calme en un geste.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const active = mood === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => selectMood(m.key)}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs transition-all ${
                      active
                        ? "border-primary bg-primary/10 shadow-soft scale-[1.03]"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl leading-none">{m.emoji}</span>
                    <span className={`font-medium leading-tight ${active ? "text-primary" : ""}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {mood && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[11px] text-muted-foreground"
                >
                  Pris en compte. <Link to="/calme" className="text-primary underline-offset-2 hover:underline">Voir le détail →</Link>
                </motion.p>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Main ritual CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to={isPremium ? "/checkin" : "/emotions"}
              className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-7 text-left text-primary-foreground shadow-soft-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="font-serif text-xl font-semibold">Je régule mon système (30 sec)</p>
                <p className="mt-1 text-sm opacity-85">
                  Reprends le contrôle maintenant
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Emergency button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Link
              to="/urgence"
              className="flex w-full items-center gap-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-left shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-destructive tracking-wide">MODE SURVIE → OFF</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Sortir du mode survie en 60 secondes</p>
              </div>
            </Link>
            <Link
              to="/danger"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground shadow-md shadow-destructive/20 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <AlertCircle className="h-4 w-4" />
              Je suis en danger — numéros & étapes
            </Link>
          </motion.div>

          {/* Daily message — "Un message t'attend" */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-5 shadow-soft text-center space-y-2"
          >
            <p className="text-xs text-muted-foreground font-medium">Un message t'attend</p>
            <p className="text-sm font-medium">
              {dailyMsg.emoji} {dailyMsg.text}
            </p>
          </motion.div>

          {/* Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary/5 border border-primary/10 p-4"
            >
              <Flame className="h-5 w-5 text-primary" />
              <div className="text-center">
                <p className="text-sm font-bold text-primary">
                  Jour {streak} — {streakInfo.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {streak} jour{streak > 1 ? "s" : ""} de suite
                </p>
              </div>
            </motion.div>
          )}

          {/* History link for paying users */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/historique"
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left shadow-soft transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold">📊 Mon historique</p>
                  <p className="text-xs text-muted-foreground">Tendances sur 30 jours</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Upsell for non-premium */}
          {isPremium === false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-card p-6 text-center shadow-soft space-y-3"
            >
              <p className="text-sm font-medium text-muted-foreground">
                Imagine si tu pouvais te sentir comme ça plus souvent.
              </p>
              <Link
                to="/paywall"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Je veux me sentir mieux
              </Link>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground"
          >
            Revenir ici = déjà avancer
          </motion.p>
        </motion.div>
      </div>
      <InstallPWAPrompt />
    </div>
  );
};

export default Dashboard;
