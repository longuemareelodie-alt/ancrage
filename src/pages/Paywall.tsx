import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import Breadcrumb from "@/components/Breadcrumb";

const Paywall = () => {
  const { user } = useAuth();
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePurchase = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/paywall&action=pay";
      return;
    }
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
            Un seul accès.
            <br />
            <span className="text-primary">Pour toute ta vie.</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu viens de faire quelque chose pour toi.
            <br />
            Imagine si tu pouvais te sentir comme ça plus souvent.
          </p>
        </div>

        {/* Single offer card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card p-6 shadow-md ring-2 ring-primary/30 space-y-5 relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
            ACCÈS À VIE
          </div>

          <div className="text-center pt-2">
            <p className="text-sm font-medium text-muted-foreground">ANCRAGE</p>
            <p className="mt-2 text-4xl font-bold">39€</p>
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

          <button
            onClick={handlePurchase}
            disabled={paymentLoading}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {paymentLoading ? "Chargement…" : "Je veux me sentir mieux — 39€"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Paiement unique. Accès à vie. 100% sécurisé via Mollie.
          </p>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            En cliquant sur « Je veux me sentir mieux — 39€ », j'accepte les{" "}
            <Link to="/cgv" className="underline hover:text-primary">
              Conditions générales de vente
            </Link>{" "}
            et reconnais que l'accès au contenu numérique débute immédiatement
            après le paiement, ce qui entraîne la renonciation expresse à mon
            droit de rétractation. Voir aussi la{" "}
            <Link to="/confidentialite" className="underline hover:text-primary">
              Politique de confidentialité
            </Link>{" "}
            et les{" "}
            <Link to="/mentions-legales" className="underline hover:text-primary">
              Mentions légales
            </Link>
            .
          </p>
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
