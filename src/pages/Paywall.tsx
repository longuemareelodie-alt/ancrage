import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Lock, Check, Infinity as InfinityIcon, ArrowRight, AlertCircle } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/lib/supabaseRetry";
import Breadcrumb from "@/components/Breadcrumb";

const Paywall = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const [isPaid, setIsPaid] = useState(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(!!user);
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? null;
  const resumeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!user) {
      setIsPaid(false);
      setStatusLoading(false);
      return;
    }
    setStatusLoading(true);
    let cancelled = false;
    (async () => {
      const { data } = await withRetry(
        () =>
          supabase
            .from("profiles")
            .select("is_premium")
            .eq("user_id", user.id)
            .single(),
        { maxAttempts: 3, baseDelayMs: 400 },
      );
      if (cancelled) return;
      setIsPaid(!!(data as any)?.is_premium);
      setStatusLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handlePurchase = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/paywall&action=pay";
      return;
    }
    startPayment();
  };

  const features = [
    t("paywall.features.ritual"),
    t("paywall.features.emergency"),
    t("paywall.features.health"),
    t("paywall.features.resources"),
    t("paywall.features.notes"),
    t("paywall.features.badges"),
    t("paywall.features.journey"),
    t("paywall.features.lifetime"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: t("paywall.breadcrumb") }]} />
      <div className="flex flex-col px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md space-y-8"
        >
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
              {t("paywall.header_title_l1")}
              <br />
              <span className="text-primary">{t("paywall.header_title_l2")}</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("paywall.header_p1")}
              <br />
              {t("paywall.header_p2")}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-card p-6 shadow-md ring-2 ring-primary/30 space-y-5 relative"
          >
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
              {t("paywall.badge")}
            </div>

            <div className="text-center pt-2">
              <p className="text-sm font-medium text-muted-foreground">{t("paywall.brand")}</p>
              <p className="mt-2 text-4xl font-bold">{t("paywall.amount")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("paywall.amount_note")}</p>
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
              {paymentLoading ? t("paywall.loading") : t("paywall.cta")}
            </button>
            <p className="text-center text-xs text-muted-foreground">{t("paywall.secure_short")}</p>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              <Trans
                i18nKey="paywall.legal"
                components={{
                  cgv: <Link to="/cgv" className="underline hover:text-primary" />,
                  privacy: <Link to="/confidentialite" className="underline hover:text-primary" />,
                  legal: <Link to="/mentions-legales" className="underline hover:text-primary" />,
                }}
              />
            </p>
          </motion.div>

          {/* Lifetime access explainer — also reflects current paid status */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={`rounded-2xl border p-5 ${
              isPaid
                ? "border-primary/40 bg-primary/10"
                : "border-primary/20 bg-primary/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <InfinityIcon className="h-5 w-5" />
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold">
                  {isPaid
                    ? t("paywall.lifetime_box.active_title")
                    : t("paywall.lifetime_box.title")}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isPaid
                    ? t("paywall.lifetime_box.active_text")
                    : t("paywall.lifetime_box.text")}
                </p>
                {!isPaid && !statusLoading && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{t("paywall.lifetime_box.bullet_one_payment")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{t("paywall.lifetime_box.bullet_no_renewal")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{t("paywall.lifetime_box.bullet_all_devices")}</span>
                    </li>
                  </ul>
                )}
                {isPaid && (
                  <Link
                    to="/dashboard"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    {t("paywall.lifetime_box.active_cta")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              <span>{t("paywall.secure_long")}</span>
            </div>
            <Link
              to="/dashboard"
              className="inline-block text-sm text-muted-foreground underline underline-offset-4"
            >
              {t("paywall.continue_alone")}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Paywall;
