import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import logo from "@/assets/logo-ancrage.png";

const PaymentCanceled = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <img src={logo} alt="Eclosia" className="mx-auto h-14 w-auto" />

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <XCircle className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Paiement non finalisé</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aucune somme n'a été débitée. Tu peux réessayer quand tu te sens prête.
          </p>
        </div>

        <div className="space-y-2">
          <Link
            to="/comparaison"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer le paiement
          </Link>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-medium text-foreground"
          >
            Retour à l'accueil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCanceled;
