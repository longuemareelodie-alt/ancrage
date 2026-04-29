import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw, Loader2, Mail } from "lucide-react";

/**
 * Gate for paid pages. Eligibility is resolved upstream in AuthContext, so this
 * component only renders the appropriate UI based on the centralized state.
 *
 * - While eligibility is unknown → loader (no protected content rendered).
 * - On transient failure → error UI with retry + support contact.
 * - Otherwise → redirect (no user → /auth, not paid → /paywall) or render children.
 */
const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isPaid, eligibilityPhase, refreshEligibility } = useAuth();
  const { t } = useTranslation();

  // Block ANY rendering until everything is resolved → no flash possible.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (eligibilityPhase === "error") {
    const subject = t("paid_route.support_subject", "Problème d'accès à mon compte");
    const bodyLines = [
      t(
        "paid_route.support_body_intro",
        "Bonjour, je rencontre un problème pour vérifier l'accès à mon compte.",
      ),
      "",
      `User ID : ${user?.id ?? "—"}`,
      `Email : ${user?.email ?? "—"}`,
      `URL : ${typeof window !== "undefined" ? window.location.href : "—"}`,
      `Date : ${new Date().toISOString()}`,
    ];
    const href = `mailto:contact@digitalmamanlibre.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

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
            onClick={() => void refreshEligibility()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {eligibilityPhase === "error" ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t("paid_route.retry", "Réessayer")}
          </button>
          <a
            href={href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <Mail className="h-4 w-4" />
            {t("paid_route.contact_support", "Contacter le support")}
          </a>
        </div>
      </div>
    );
  }

  if (!isPaid) return <Navigate to="/paywall" replace />;
  return <>{children}</>;
};

export default PaidRoute;
