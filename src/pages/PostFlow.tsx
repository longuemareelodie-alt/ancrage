import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PostFlow = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setIsPremium(data?.is_premium ?? false));
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-5xl block"
        >
          🌿
        </motion.span>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Et maintenant ?</h1>
          <p className="text-sm text-muted-foreground">
            Tu viens de faire redescendre ton corps. Bravo.
          </p>
        </div>

        <div className="space-y-4">
          {/* Option 1: FREE — continue calming */}
          <Link
            to="/emotions"
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold">🌿 Continuer à s'apaiser</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Un exercice court pour prolonger le calme
              </p>
            </div>
          </Link>

          {/* Option 2: PREMIUM — deeper reflection */}
          {isPremium ? (
            <Link
              to="/comprendre"
              className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 p-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ring-1 ring-primary/20"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold">💛 Comprendre ce que tu ressens</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Réflexion guidée pour aller plus loin
                </p>
              </div>
            </Link>
          ) : (
            <Link
              to="/paywall"
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-left shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold">💛 Comprendre ce que tu ressens</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Réflexion guidée • Premium
                </p>
              </div>
              <div className="absolute -right-1 -top-1 rounded-bl-lg bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                PREMIUM
              </div>
            </Link>
          )}
        </div>

        <Link
          to="/dashboard"
          className="inline-block text-sm text-muted-foreground underline underline-offset-4"
        >
          Retour à mon espace
        </Link>
      </motion.div>
    </div>
  );
};

export default PostFlow;
