import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Brain, Puzzle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-ancrage.png";

const Dashboard = () => {
  const { user } = useAuth();

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
            {/* Aide immédiate */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <Link
                to="/emotions"
                className="flex w-full items-center gap-4 rounded-2xl bg-primary p-6 text-left text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">⚡ Aide immédiate</p>
                  <p className="mt-1 text-sm opacity-80">Aide-moi maintenant</p>
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
    </div>
  );
};

export default Dashboard;
