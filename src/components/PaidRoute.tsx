import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/lib/supabaseRetry";
import { isGrandfatheredAccount } from "@/lib/paywallPolicy";

type Phase = "checking" | "retrying" | "ready" | "error";

/**
 * Allows access to any paying user (lifetime access after one-time payment).
 * Redirects free users to /paywall.
 *
 * Resilient to transient network/Supabase errors: retries with exponential
 * backoff and shows a clear "temporary error" state instead of mistakenly
 * sending paying users back to /paywall on a network blip.
 */
const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [isPaid, setIsPaid] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!user) {
      setPhase("ready");
      return;
    }

    let cancelled = false;
    setPhase("checking");

    (async () => {
      const result = await withRetry(
        () =>
          supabase
            .from("profiles")
            .select("is_premium, created_at")
            .eq("user_id", user.id)
            .single(),
        {
          maxAttempts: 4,
          baseDelayMs: 500,
          onRetry: () => {
            if (!cancelled) setPhase("retrying");
          },
        },
      );
      if (cancelled) return;

      if (result.transientFailure) {
        setPhase("error");
        return;
      }

      const profile = result.data as any;
      const premium = !!profile?.is_premium;
      const grandfathered = isGrandfatheredAccount(profile?.created_at);
      setIsPaid(premium || grandfathered);
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, retryToken]);

  if (loading || phase === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (phase === "retrying") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {t("paid_route.retrying", "Connexion lente, on réessaie…")}
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold">
              {t("paid_route.error_title", "Erreur temporaire")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "paid_route.error_text",
                "Impossible de vérifier ton accès pour le moment. Vérifie ta connexion et réessaie.",
              )}
            </p>
          </div>
          <button
            onClick={() => setRetryToken((n) => n + 1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            {t("paid_route.retry", "Réessayer")}
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isPaid) return <Navigate to="/paywall" replace />;
  return <>{children}</>;
};

export default PaidRoute;
