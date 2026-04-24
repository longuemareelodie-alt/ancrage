import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type EmergencyStep = "loading" | "blocked" | "breathe" | "message" | "done";

const Emergency = () => {
  const [step, setStep] = useState<EmergencyStep>("loading");
  const [breathCount, setBreathCount] = useState(0);
  const [usage, setUsage] = useState<{
    plan_type: string;
    used_today: number;
    daily_limit: number;
    unlimited: boolean;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    const consumeQuota = async () => {
      const { data, error } = await supabase.rpc("use_emergency" as any);
      if (error) {
        console.error("use_emergency error", error);
        // Fail open to "breathe" so a user in distress is never blocked by a backend hiccup
        setStep("breathe");
        return;
      }
      const result = data as any;
      setUsage({
        plan_type: result?.plan_type ?? "none",
        used_today: result?.used_today ?? 0,
        daily_limit: result?.daily_limit ?? 0,
        unlimited: !!result?.unlimited,
        remaining: result?.remaining ?? 0,
      });
      if (result?.allowed) {
        setStep("breathe");
      } else {
        setStep("blocked");
      }
    };
    consumeQuota();
  }, []);

  const handleBreathe = () => {
    if (breathCount < 4) {
      setBreathCount((c) => c + 1);
    }
    if (breathCount >= 3) {
      setTimeout(() => setStep("message"), 1000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 py-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary" aria-label="Retour au tableau de bord">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          {usage && !usage.unlimited && step !== "blocked" && step !== "loading" && (
            <span className="text-xs text-muted-foreground">
              {usage.remaining} / {usage.daily_limit} aujourd'hui
            </span>
          )}
          <QuickBackLinks variant="inline" />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            />
          )}

          {step === "blocked" && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-6 max-w-sm"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-9 w-9 text-primary" />
              </div>
              <div className="space-y-3">
                <h1 className="text-xl font-bold">Tu as utilisé tes 3 accès du jour</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Avec ton accès unique, tu peux ouvrir le bouton urgence 3 fois par jour.
                  Ça redescend toujours — reviens demain, ou passe à l'abonnement pour un accès illimité.
                </p>
              </div>
              <div className="space-y-3 w-full">
                <Link
                  to="/paywall?upgrade=subscription"
                  className="block w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Passer à l'abonnement
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full rounded-full border border-border px-6 py-3 text-center text-sm font-medium"
                >
                  Retour à mon espace
                </Link>
              </div>
            </motion.div>
          )}

          {step === "breathe" && (
            <motion.div
              key="breathe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10"
              >
                <Heart className="h-14 w-14 text-primary" />
              </motion.div>

              <div className="space-y-3">
                <h1 className="text-xl font-bold">On ralentit ensemble.</h1>
                <p className="text-sm text-muted-foreground">
                  Inspire… expire… doucement.
                </p>
              </div>

              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      i < breathCount ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBreathe}
                className="rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
              >
                {breathCount === 0 ? "Je respire" : `Encore… (${breathCount}/4)`}
              </motion.button>
            </motion.div>
          )}

          {step === "message" && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="text-5xl"
              >
                🫂
              </motion.span>

              <div className="space-y-4 max-w-sm">
                <h2 className="text-xl font-bold">Je suis là.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  On ralentit ensemble. Tu n'as rien à faire de plus.
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="rounded-xl bg-primary/10 p-4"
                >
                  <p className="text-sm text-primary font-semibold">
                    Ça va redescendre. Ça redescend toujours.
                  </p>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep("done")}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
              >
                Ça va un peu mieux
              </motion.button>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="text-5xl"
              >
                💛
              </motion.span>

              <div className="space-y-3 max-w-sm">
                <h2 className="text-xl font-bold">Tu viens de faire quelque chose pour toi.</h2>
                <p className="text-sm text-muted-foreground">
                  Imagine si tu pouvais te sentir comme ça plus souvent.
                </p>
              </div>

              <div className="space-y-3 w-full max-w-xs">
                <Link
                  to="/dashboard"
                  className="block w-full rounded-full bg-primary px-6 py-3 text-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Retour à mon espace
                </Link>
                {usage?.plan_type !== "subscription" && (
                  <Link
                    to="/paywall?upgrade=subscription"
                    className="block w-full rounded-full border border-border px-6 py-3 text-center text-sm font-medium"
                  >
                    Aller plus loin
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Emergency;
