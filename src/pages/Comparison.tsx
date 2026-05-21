import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import Breadcrumb from "@/components/Breadcrumb";

const Comparison = () => {
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    startPayment();
  };

  const features = [
    "Rituel quotidien complet",
    "Bouton urgence \u201CÇa déborde\u201D",
    "Espace santé (RDV, médicaments, fiche urgence)",
    "Ressources France",
    "Notes privées",
    "Badges et progression",
    "Parcours 4 phases",
    "Accès à vie — aucun abonnement",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Comparer les options" }]} />
      <div className="flex flex-col px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">
            Un seul accès.
            <br />
            <span className="text-primary">Pour toute ta vie.</span>
          </h1>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-md ring-2 ring-primary/30 space-y-5 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
            ACCÈS À VIE
          </div>
          <div className="text-center pt-2">
            <p className="text-sm font-medium text-muted-foreground">ANCRAGE</p>
            <p className="mt-2 text-4xl font-bold">57€</p>
            <p className="text-xs text-muted-foreground mt-1">Paiement unique · Accès à vie</p>
          </div>
          <ul className="space-y-2">
            {features.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {paymentLoading ? "Chargement…" : "Je veux me sentir mieux — 57€"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Paiement unique. Accès à vie. 100% sécurisé via Mollie.
          </p>
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
    </div>
  );
};

export default Comparison;
