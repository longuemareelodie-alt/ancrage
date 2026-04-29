import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Status = "pending" | "confirmed" | "error";

const MAX_ATTEMPTS = 30; // ~60s at 2s intervals
const POLL_INTERVAL_MS = 2000;

const PaymentPending = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("pending");
  const [attempts, setAttempts] = useState(0);
  const cancelled = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/payment-pending", { replace: true });
      return;
    }

    cancelled.current = false;
    let attempt = 0;

    const poll = async () => {
      if (cancelled.current) return;
      attempt += 1;
      setAttempts(attempt);

      const { data, error } = await withRetry(
        () =>
          supabase
            .from("profiles")
            .select("is_premium")
            .eq("user_id", user.id)
            .single(),
        { maxAttempts: 2, baseDelayMs: 400, timeoutMs: 6000 },
      );

      if (cancelled.current) return;

      if (!error && data?.is_premium) {
        setStatus("confirmed");
        setTimeout(() => {
          if (!cancelled.current) navigate("/payment-success", { replace: true });
        }, 1200);
        return;
      }

      if (attempt >= MAX_ATTEMPTS) {
        setStatus("error");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled.current = true;
    };
  }, [user, authLoading, navigate]);

  const progressPct = Math.min(100, Math.round((attempts / MAX_ATTEMPTS) * 100));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-7 text-center shadow-sm"
      >
        {status === "pending" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{t("payment_pending.pending.title")}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("payment_pending.pending.text")}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("payment_pending.pending.hint")}
              </p>
            </div>
          </>
        )}

        {status === "confirmed" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15"
            >
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{t("payment_pending.confirmed.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("payment_pending.confirmed.text")}</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t("payment_pending.confirmed.redirect")}</span>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{t("payment_pending.error.title")}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("payment_pending.error.text")}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setStatus("pending");
                  setAttempts(0);
                  // re-trigger effect by reloading the page state
                  window.location.reload();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                {t("payment_pending.error.retry")}
              </button>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium"
              >
                {t("payment_pending.error.dashboard")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-muted-foreground">
                {t("payment_pending.error.support")}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPending;
