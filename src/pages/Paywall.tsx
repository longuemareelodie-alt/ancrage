import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Lock, Check, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";

const Paywall = () => {
  const { user } = useAuth();
  const { startPayment, startSubscription, loading: paymentLoading } = useMolliePayment();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const handleSubscription = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/paywall&action=pay";
      return;
    }
    startSubscription(selectedPlan);
  };

  const handleOneTime = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/paywall&action=pay";
      return;
    }
    startPayment();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-md space-y-8"
      >
        {/* Emotional header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-4xl"
          >
            💛
          </motion.div>
          <h1 className="text-xl font-bold">
            Tu peux continuer seule…
            <br />
            <span className="text-primary">ou te faire accompagner</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu viens de commencer à apaiser ton corps.
            <br />
            Imagine si tu pouvais aller plus loin, doucement, sans te sentir seule.
          </p>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-primary/5 p-4 text-center border border-primary/10"
        >
          <p className="text-sm italic text-muted-foreground">
            "Je pensais être seule… et ça m'a vraiment aidée."
          </p>
          <div className="flex justify-center gap-0.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
            ))}
          </div>
        </motion.div>

        {/* Plan toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card p-6 shadow-md ring-2 ring-primary/30 space-y-5 relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
            RECOMMANDÉ
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Accompagnement Premium</p>
          </div>

          {/* Monthly / Yearly toggle */}
          <div className="flex rounded-xl bg-secondary p-1 gap-1">
            <button
              onClick={() => setSelectedPlan("monthly")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                selectedPlan === "monthly"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setSelectedPlan("yearly")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors relative ${
                selectedPlan === "yearly"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                -45%
              </span>
            </button>
          </div>

          <div className="text-center">
            {selectedPlan === "monthly" ? (
              <>
                <p className="text-3xl font-bold">9€<span className="text-base font-normal text-muted-foreground">/mois</span></p>
                <p className="text-xs text-muted-foreground">Sans engagement · Annulable à tout moment</p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold">59€<span className="text-base font-normal text-muted-foreground">/an</span></p>
                <p className="text-xs text-muted-foreground">Soit 4,92€/mois · Économise 49€</p>
              </>
            )}
          </div>

          <ul className="space-y-2">
            {[
              "Soutien émotionnel quotidien",
              "Messages personnalisés selon ton état",
              "Notifications de soutien",
              "Suivi de progression émotionnelle",
              "Exercices approfondis",
              "Contenu qui évolue avec toi",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleSubscription}
            disabled={paymentLoading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {paymentLoading ? "Chargement…" : "Je veux être accompagnée"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Tu peux arrêter quand tu veux. Aucun jugement.
          </p>
        </motion.div>

        {/* One-time offer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-card p-5 shadow-sm space-y-3"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Accès unique</p>
            <p className="mt-1 text-2xl font-bold">29€</p>
            <p className="text-xs text-muted-foreground">Paiement unique · Accès à vie</p>
          </div>
          <ul className="space-y-1.5">
            {[
              "Check-in émotionnel",
              "Exercices de régulation",
              "Parcours guidé",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleOneTime}
            disabled={paymentLoading}
            className="w-full rounded-xl border border-border bg-background py-3 text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {paymentLoading ? "Chargement…" : "Accéder pour 29€"}
          </button>
        </motion.div>

        {/* Security + back */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Paiement 100% sécurisé via Mollie</span>
          </div>
          <Link
            to="/dashboard"
            className="inline-block text-sm text-muted-foreground underline underline-offset-4"
          >
            Continuer seule
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Paywall;
