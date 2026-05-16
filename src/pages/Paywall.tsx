import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Lock, Check, Infinity as InfinityIcon, ArrowRight, AlertCircle, Tag, X, RefreshCw, HeartPulse, Brain } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/lib/supabaseRetry";
import {
  PAYWALL_ENFORCEMENT_CUTOFF_ISO,
  classifyProfileCreatedAt,
} from "@/lib/paywallPolicy";
import Breadcrumb from "@/components/Breadcrumb";

const Paywall = () => {
  const { user, refreshEligibility, isPaid: ctxIsPaid } = useAuth();
  const { t } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const [isPaid, setIsPaid] = useState(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(!!user);
  const [profileCreatedAt, setProfileCreatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? null;
  const resumeBtnRef = useRef<HTMLButtonElement | null>(null);

  // ---- Promo code (client-side preview only; server is authoritative) ----
  // Catalog must mirror server PROMO_CATALOG in create-mollie-payment.
  const PROMO_CATALOG: Record<string, { discountCents: number; label: string }> = {
    ANCRAGE15: { discountCents: 1500, label: "Ancrage15" },
  };
  const BASE_PRICE_CENTS = 5900;
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError(t("paywall.promo.empty", "Saisis un code promo."));
      return;
    }
    if (!PROMO_CATALOG[code]) {
      setAppliedPromo(null);
      setPromoError(t("paywall.promo.invalid", "Code promo invalide."));
      return;
    }
    setAppliedPromo(code);
    setPromoError(null);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const discountCents = appliedPromo ? PROMO_CATALOG[appliedPromo].discountCents : 0;
  const finalCents = Math.max(0, BASE_PRICE_CENTS - discountCents);
  const formatEur = (cents: number) =>
    `${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2).replace(".", ",")}€`;

  useEffect(() => {
    if (!user) {
      setIsPaid(false);
      setProfileCreatedAt(null);
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
            .select("is_premium, created_at")
            .eq("user_id", user.id)
            .single(),
        { maxAttempts: 3, baseDelayMs: 400 },
      );
      if (cancelled) return;
      const row = data as { is_premium?: boolean; created_at?: string } | null;
      setIsPaid(!!row?.is_premium);
      setProfileCreatedAt(row?.created_at ?? null);
      setStatusLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handlePurchase = () => {
    startPayment({ promoCode: appliedPromo });
  };

  const handleRefreshAccess = async () => {
    if (!user || refreshing) return;
    setRefreshing(true);
    try {
      // Re-read profile locally (drives this page's banner) and refresh the
      // global auth eligibility (drives PaidRoute / redirects).
      const [{ data }] = await Promise.all([
        withRetry(
          () =>
            supabase
              .from("profiles")
              .select("is_premium, created_at")
              .eq("user_id", user.id)
              .single(),
          { maxAttempts: 3, baseDelayMs: 400 },
        ),
        refreshEligibility(),
      ]);
      const row = data as { is_premium?: boolean; created_at?: string } | null;
      const paid = !!row?.is_premium;
      setIsPaid(paid);
      setProfileCreatedAt(row?.created_at ?? null);
      if (paid || ctxIsPaid) {
        toast.success(t("paywall.refresh.success", "Accès débloqué ! Bon retour 💛"));
        // Send them to where they tried to go, or the dashboard.
        window.location.href = fromPath ?? "/dashboard";
      } else {
        toast.info(
          t(
            "paywall.refresh.still_blocked",
            "Aucun paiement confirmé pour le moment. Réessaie dans quelques instants.",
          ),
        );
      }
    } catch {
      toast.error(
        t("paywall.refresh.error", "Impossible de vérifier ton accès. Réessaie."),
      );
    } finally {
      setRefreshing(false);
    }
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

  // Friendly label for the page the user tried to reach (used in the banner).
  const fromLabelKey = (() => {
    if (!fromPath) return null;
    const p = fromPath.split("?")[0];
    if (p.startsWith("/dashboard")) return "paywall.redirected.page.dashboard";
    if (p.startsWith("/calme")) return "paywall.redirected.page.calme";
    if (p.startsWith("/emotion")) return "paywall.redirected.page.emotions";
    if (p.startsWith("/checkin")) return "paywall.redirected.page.checkin";
    if (p.startsWith("/historique")) return "paywall.redirected.page.historique";
    if (p.startsWith("/comprendre")) return "paywall.redirected.page.comprendre";
    if (p.startsWith("/avancer")) return "paywall.redirected.page.avancer";
    if (p.startsWith("/parcours")) return "paywall.redirected.page.parcours";
    if (p.startsWith("/profil")) return "paywall.redirected.page.profil";
    if (p.startsWith("/sante")) return "paywall.redirected.page.sante";
    return "paywall.redirected.page.generic";
  })();

  // Compute the *reason* the user is blocked. Three buckets:
  //  - "redirected" : came from a protected page (fromPath set)
  //  - "after_cutoff" : logged-in, profile created on/after the enforcement
  //                     cutoff and not premium → must pay to enter
  //  - null         : nothing to highlight (already paid, anonymous visitor,
  //                    or grandfathered account just browsing)
  const cutoffMs = new Date(PAYWALL_ENFORCEMENT_CUTOFF_ISO).getTime();
  const createdStatus = classifyProfileCreatedAt(profileCreatedAt);
  const createdMs =
    createdStatus === "valid" ? new Date(profileCreatedAt as string).getTime() : NaN;
  const isAfterCutoff =
    !!user &&
    !isPaid &&
    !statusLoading &&
    // If we couldn't read the profile (missing/invalid), be conservative and
    // show the message — they ARE blocked by PaidRoute anyway.
    (createdStatus !== "valid" ||
      (Number.isFinite(createdMs) && Number.isFinite(cutoffMs) && createdMs >= cutoffMs));

  const blockReason: "redirected" | "after_cutoff" | null = (() => {
    if (isPaid || statusLoading) return null;
    if (fromPath) return "redirected";
    if (isAfterCutoff) return "after_cutoff";
    return null;
  })();

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
          {blockReason && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <AlertCircle className="h-[18px] w-[18px]" />
                </span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    {blockReason === "after_cutoff"
                      ? t("paywall.blocked.title")
                      : t("paywall.redirected.title")}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {blockReason === "after_cutoff"
                      ? t("paywall.blocked.text")
                      : fromLabelKey
                        ? t("paywall.redirected.text_with_page", {
                            page: t(fromLabelKey),
                          })
                        : t("paywall.redirected.text")}
                  </p>
                  <button
                    ref={resumeBtnRef}
                    onClick={handlePurchase}
                    disabled={paymentLoading}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                  >
                    {paymentLoading
                      ? t("paywall.loading")
                      : blockReason === "after_cutoff"
                        ? t("paywall.blocked.cta")
                        : t("paywall.redirected.resume_cta")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  {user && (
                    <button
                      type="button"
                      onClick={handleRefreshAccess}
                      disabled={refreshing}
                      className="ms-2 mt-1 inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-background px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      {refreshing
                        ? t("paywall.refresh.loading", "Vérification…")
                        : t("paywall.refresh.cta", "J'ai déjà payé — rafraîchir")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

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
              {appliedPromo ? (
                <div className="mt-2 flex items-baseline justify-center gap-2">
                  <p className="text-xl font-medium text-muted-foreground line-through">
                    {formatEur(BASE_PRICE_CENTS)}
                  </p>
                  <p className="text-4xl font-bold text-primary">{formatEur(finalCents)}</p>
                </div>
              ) : (
                <p className="mt-2 text-4xl font-bold">{t("paywall.amount")}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t("paywall.amount_note")}</p>
              {appliedPromo && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  <Tag className="h-3.5 w-3.5" />
                  {t("paywall.promo.applied", {
                    code: appliedPromo,
                    amount: formatEur(discountCents),
                    defaultValue: "{{code}} appliqué — {{amount}} de réduction",
                  })}
                  <button
                    type="button"
                    onClick={removePromo}
                    aria-label={t("paywall.promo.remove", "Retirer le code promo")}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </p>
              )}
            </div>

            {/* Promo code input */}
            {!appliedPromo && (
              <div className="space-y-1.5">
                <label
                  htmlFor="promo-code"
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t("paywall.promo.label", "Tu as un code promo ?")}
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      if (promoError) setPromoError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyPromo();
                      }
                    }}
                    placeholder={t("paywall.promo.placeholder", "Saisis ton code")}
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!promoError}
                    aria-describedby={promoError ? "promo-code-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="rounded-xl border border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    {t("paywall.promo.apply", "Appliquer")}
                  </button>
                </div>
                {promoError && (
                  <p id="promo-code-error" className="text-xs text-destructive">
                    {promoError}
                  </p>
                )}
              </div>
            )}

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
              {paymentLoading
                ? t("paywall.loading")
                : appliedPromo
                  ? t("paywall.cta_with_amount", {
                      amount: formatEur(finalCents),
                      defaultValue: "Je veux me sentir mieux — {{amount}}",
                    })
                  : t("paywall.cta")}
            </button>
            {user && !isPaid && (
              <button
                type="button"
                onClick={handleRefreshAccess}
                disabled={refreshing}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-background py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing
                  ? t("paywall.refresh.loading", "Vérification…")
                  : t("paywall.refresh.cta_long", "J'ai déjà payé — vérifier mon accès")}
              </button>
            )}
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

          {/* Pitches inclus dans l'accès à vie */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Inclus dans ton accès à vie
            </p>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold">🏥 Cerveau médical familial</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Profils, coffre-fort, timeline, préparation RDV. Toute la charge médicale
                    de ta famille en un seul endroit.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Brain className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold">🧠 Charge mentale</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Décharge du jour, mode cerveau saturé, gestion énergie. Pour tenir
                    sans s'effondrer.
                  </p>
                </div>
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
