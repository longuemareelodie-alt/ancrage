import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Puzzle, User, Lock, Heart, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import logo from "@/assets/logo-ancrage.png";
import InAppReminder from "@/components/InAppReminder";
import InstallPWAPrompt from "@/components/InstallPWAPrompt";

const Dashboard = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium ?? false);
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div />
        <img src={logo} alt="Ancrage" className="h-10 w-auto" />
        <Link
          to={user ? "/profil" : "/auth"}
          className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
        >
          <User className="h-3.5 w-3.5" />
          {user ? "Mon espace" : "Connexion"}
        </Link>
      </div>

      <InAppReminder />

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg space-y-10 text-center"
        >
          {/* Greeting */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tu es ici</p>
            <h1 className="text-2xl font-bold">Comment tu te sens maintenant ?</h1>
            <p className="text-xs text-muted-foreground">Ton corps peut redescendre</p>
          </div>

          {/* 3 main CTAs */}
          <div className="space-y-4">
            {/* Check-in émotionnel */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Link
                to="/checkin"
                className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-left text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">💛 Check-in du jour</p>
                  <p className="mt-1 text-sm opacity-80">Comment tu te sens ?</p>
                </div>
              </Link>
            </motion.div>

            {/* Aide immédiate */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link
                to="/emotions"
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">⚡ Aide immédiate</p>
                  <p className="mt-1 text-sm text-muted-foreground">Aide-moi maintenant</p>
                </div>
              </Link>
            </motion.div>

            {/* Comprendre ton état */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                to="/comprendre"
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">🌿 Comprendre ton état</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Je veux comprendre ce que je ressens
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Avancer aujourd'hui */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <Link
                to="/avancer"
                className="flex w-full items-center gap-4 rounded-2xl bg-card p-6 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">🧩 Avancer aujourd'hui</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Je veux avancer sans m'épuiser
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* History link for premium users */}
          {user && isPremium === true && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link
                to="/historique"
                className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 p-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">📊 Mon historique émotionnel</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tendances et progression sur 30 jours</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Upsell banner for non-premium */}
          {user && isPremium === false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="rounded-2xl bg-card p-6 text-center shadow-sm space-y-3"
            >
              <div className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <p className="font-bold">Débloque le programme complet</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Accède à tous les exercices, au parcours guidé et aux outils de suivi
              </p>
              <a
                onClick={(e) => { e.preventDefault(); startPayment(); }}
                className={`inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${paymentLoading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {paymentLoading ? "Chargement…" : "Je veux que ça s'arrête maintenant — 29€"}
              </a>
              <p className="text-xs text-muted-foreground">Accès à vie · Sans abonnement</p>
            </motion.div>
          )}

          {/* Retention hook */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-xs text-muted-foreground"
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
