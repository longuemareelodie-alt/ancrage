import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Heart, Flame, BarChart3, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDailyMessage } from "@/data/dailyMessages";
import { getStreakLabel } from "@/data/streakLabels";
import logo from "@/assets/logo-ancrage.png";
import InstallPWAPrompt from "@/components/InstallPWAPrompt";

const Dashboard = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, current_streak, first_name")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium ?? false);
      setStreak(data?.current_streak ?? 0);
      setFirstName(data?.first_name ?? "");
    };
    fetchProfile();
  }, [user]);

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
          className="w-full max-w-lg space-y-6"
        >
          {/* Greeting */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold">
              {firstName ? `Ton moment, ${firstName}` : "Ton moment pour toi"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isMorning ? "Comment tu commences ta journée ?" : "Comment s'est passée ta journée ?"}
            </p>
          </div>

          {/* Main ritual CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to={isPremium ? "/checkin" : "/emotions"}
              className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-left text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">Je prends 30 secondes</p>
                <p className="mt-1 text-sm opacity-80">
                  {isMorning ? "Mon rituel du matin" : "Mon rituel du soir"}
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Emergency button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/urgence"
              className="flex w-full items-center gap-4 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/20">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-destructive">Ça déborde</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Aide immédiate</p>
              </div>
            </Link>
          </motion.div>

          {/* Daily message — "Un message t'attend" */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-5 shadow-sm text-center space-y-2"
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

          {/* History link for premium */}
          {isPremium === true && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/historique"
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
              className="rounded-2xl bg-card p-5 text-center shadow-sm space-y-3"
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
