import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Heart, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";

const Comparison = () => {
  const { user } = useAuth();
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/comparaison&action=pay";
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
        className="mx-auto w-full max-w-lg space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">
            Tu peux avancer seule…
            <br />
            <span className="text-primary">ou être accompagnée chaque jour</span>
          </h1>
        </div>

        {/* Comparison cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left — 29€ */}
          <div className="rounded-xl bg-card p-4 shadow-sm space-y-3">
            <div className="text-center">
              <p className="text-lg font-bold">29€</p>
              <p className="text-[10px] text-muted-foreground">Paiement unique</p>
            </div>
            <ul className="space-y-2">
              {[
                "Je m'apaise quand ça ne va pas",
                "J'avance seule",
                "J'utilise les exercices",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Premium */}
          <div className="rounded-xl bg-card p-4 shadow-md ring-2 ring-primary/30 space-y-3 relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground whitespace-nowrap">
              RECOMMANDÉ
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">9€<span className="text-xs font-normal">/mois</span></p>
              <p className="text-[10px] text-muted-foreground">ou 59€/an</p>
            </div>
            <ul className="space-y-2">
              {[
                "Je suis accompagnée chaque jour",
                "L'app s'adapte à moi",
                "Je ne me sens plus seule",
                "Je vois mon évolution",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-xs">
                  <Heart className="h-3 w-3 shrink-0 text-primary mt-0.5" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {paymentLoading ? "Chargement…" : "Je veux être accompagnée"}
          </button>
          <Link
            to="/dashboard"
            className="block text-center text-sm text-muted-foreground underline underline-offset-4"
          >
            Continuer seule
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Paiement sécurisé · Sans engagement</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Comparison;
