import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import QuickBackLinks from "@/components/QuickBackLinks";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMolliePayment } from "@/hooks/useMolliePayment";

const PostFlow = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const [isPremium, setIsPremium] = useState(false);
  const handlePayment = () => {
    if (!user) { window.location.href = "/auth?redirect=/post-flow&action=pay"; return; }
    startPayment();
  };

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="absolute left-0 right-0 top-4 flex justify-center">
        <QuickBackLinks variant="inline" />
      </div>
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
          💛
        </motion.span>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{t("post_flow.title")}</h1>
          <p className="text-sm text-muted-foreground">
            Imagine si tu pouvais te sentir comme ça plus souvent.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-5 text-start shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-bold">{t("post_flow.back_dashboard")}</p>
              <p className="mt-1 text-sm text-muted-foreground">Ton rituel t'attend</p>
            </div>
          </Link>

          {!isPremium && (
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="block w-full rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-5 text-center text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              <p className="font-bold">{paymentLoading ? "Chargement…" : "Aller plus loin — 59€"}</p>
              <p className="mt-1 text-sm opacity-80">Être accompagnée chaque jour</p>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PostFlow;
