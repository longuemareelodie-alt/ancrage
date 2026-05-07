import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  UserX,
  Camera,
  Check,
  MessageCircle,
  Heart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/lib/supabaseRetry";
import {
  isScreenshotSupported,
  captureAndDownloadScreenshot,
  type CaptureResult,
} from "@/lib/captureScreenshot";
import { toast } from "sonner";
import SupportContactDialog from "@/components/SupportContactDialog";

type Status = "pending" | "confirmed" | "error" | "not_found";
type LastState = "checking" | "retrying" | "error" | "not_found" | "confirmed";

const MAX_ATTEMPTS = 30; // ~60s at 2s intervals
const POLL_INTERVAL_MS = 2000;

/** Generate a short, human-readable support ticket ID. */
const generateTicketId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${ts}-${rand}`;
};

const PaymentPending = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("pending");
  const [attempts, setAttempts] = useState(0);
  const [lastState, setLastState] = useState<LastState>("checking");
  const [lastStateAt, setLastStateAt] = useState<string>(() => new Date().toISOString());
  const [lastError, setLastError] = useState<string | null>(null);
  const [ticketId] = useState<string>(() => generateTicketId());
  const [screenshotFilename, setScreenshotFilename] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  // L'offre 7 jours autonome a été retirée — la confirmation et la
  // redirection se font toujours via le flux Premium.
  const screenshotsAvailable = isScreenshotSupported();
  const cancelled = useRef(false);
  const loggedRef = useRef(false);

  // Auto-log error / not_found states once to support_logs.
  useEffect(() => {
    if (loggedRef.current) return;
    if (status !== "error" && status !== "not_found") return;
    if (!user?.id) return;
    loggedRef.current = true;

    const errorCode =
      status === "not_found"
        ? "profile_not_found"
        : lastError
          ? "activation_error"
          : "max_attempts_reached";

    supabase
      .from("support_logs")
      .insert({
        user_id: user.id,
        ticket_id: ticketId,
        source: "payment_pending",
        error_code: errorCode,
        error_message: lastError,
        last_state: lastState,
        attempts,
        url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        metadata: {
          status,
          last_state_at: lastStateAt,
          email: user.email ?? null,
        },
      })
      .then(({ error }) => {
        if (error) {
          // Non-blocking: surface in console only.
          console.warn("[support_logs] insert failed", error);
        }
      });
  }, [status, user?.id, user?.email, ticketId, lastError, lastState, attempts, lastStateAt]);

  const handleCaptureScreenshot = async () => {
    setCapturing(true);
    try {
      const result: CaptureResult = await captureAndDownloadScreenshot(`ancrage-support-${ticketId}`);
      if (result.ok) {
        setScreenshotFilename(result.filename);
        toast.success(
          t(
            "payment_pending.support.screenshot_saved",
            "Capture enregistrée dans tes téléchargements. Pense à la joindre au mail.",
          ),
        );
      } else {
        const failure = result as Extract<CaptureResult, { ok: false }>;
        if (failure.reason === "denied") {
          toast.info(
            t("payment_pending.support.screenshot_denied", "Capture annulée."),
          );
        } else if (failure.reason === "unsupported") {
          toast.error(
            t(
              "payment_pending.support.screenshot_unsupported",
              "Ton navigateur ne permet pas la capture d'écran.",
            ),
          );
        } else {
          toast.error(
            t(
              "payment_pending.support.screenshot_error",
              "Impossible de réaliser la capture. Réessaie.",
            ),
          );
        }
      }
    } finally {
      setCapturing(false);
    }
  };

  const updateLastState = (next: LastState, errorMsg?: string | null) => {
    setLastState(next);
    setLastStateAt(new Date().toISOString());
    setLastError(errorMsg ?? null);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/payment-pending", { replace: true });
      return;
    }

    // isInitiationFlow is captured at mount via component state above.

    cancelled.current = false;
    let attempt = 0;

    const poll = async () => {
      if (cancelled.current) return;
      attempt += 1;
      setAttempts(attempt);
      updateLastState("checking");

      const { data, error } = await withRetry(
        () =>
          supabase
            .from("profiles")
            .select("is_premium, has_initiation_access")
            .eq("user_id", user.id)
            .maybeSingle(),
        { maxAttempts: 2, baseDelayMs: 400, timeoutMs: 6000 },
      );

      if (cancelled.current) return;

      // Confirmation : Premium activé.
      const confirmed = data?.is_premium === true;

      if (!error && data && confirmed) {
        setStatus("confirmed");
        updateLastState("confirmed");
        setTimeout(() => {
          if (cancelled.current) return;
          navigate("/payment-success", { replace: true });
        }, 1200);
        return;
      }

      // Profile row genuinely missing (no error, no data): show a distinct state.
      // Don't keep polling — the webhook can't activate a profile that doesn't exist.
      if (!error && data === null) {
        setStatus("not_found");
        updateLastState("not_found");
        return;
      }

      if (attempt >= MAX_ATTEMPTS) {
        setStatus("error");
        updateLastState("error", error?.message ?? "max_attempts_reached");
        return;
      }

      // Still pending (or transient error) → will retry.
      updateLastState("retrying", error?.message ?? null);
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled.current = true;
    };
  }, [user?.id, authLoading, navigate]);

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
              <p className="text-sm text-muted-foreground">
                {t("payment_pending.confirmed.text")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t("payment_pending.confirmed.redirect")}</span>
            </div>
          </>
        )}

        {(status === "error" || status === "not_found") && (() => {
          const isNotFound = status === "not_found";
          const subject = isNotFound
            ? t(
                "payment_pending.not_found.support_subject",
                "Profil introuvable après paiement",
              )
            : t(
                "payment_pending.error.support_subject",
                "Problème de confirmation de paiement",
              );
          const intro = isNotFound
            ? t(
                "payment_pending.not_found.support_body",
                "Bonjour, mon profil semble introuvable après le paiement.",
              )
            : t(
                "payment_pending.error.support_body",
                "Bonjour, ma confirmation de paiement n'aboutit pas.",
              );

          const stateLabels: Record<LastState, string> = {
            checking: t("payment_pending.last_state.checking", "Vérification en cours"),
            retrying: t("payment_pending.last_state.retrying", "Nouvelle tentative"),
            error: t("payment_pending.last_state.error", "Erreur"),
            not_found: t("payment_pending.last_state.not_found", "Profil introuvable"),
            confirmed: t("payment_pending.last_state.confirmed", "Confirmé"),
          };

          const summaryHeader = t(
            "payment_pending.support.summary_header",
            "— Informations diagnostic (ne pas modifier) —",
          );

          const screenshotNote = screenshotFilename
            ? t(
                "payment_pending.support.screenshot_attached_note",
                "📎 Capture d'écran à joindre : {{filename}} (téléchargée sur ton appareil)",
                { filename: screenshotFilename },
              )
            : null;

          const body = [
            intro,
            "",
            screenshotNote,
            screenshotNote ? "" : null,
            summaryHeader,
            `Ticket ID : ${ticketId}`,
            `Dernier état : ${stateLabels[lastState]} (${lastState})`,
            `Horodatage état : ${lastStateAt}`,
            `Tentatives : ${attempts}/${MAX_ATTEMPTS}`,
            lastError ? `Dernière erreur : ${lastError}` : null,
            `User ID : ${user?.id ?? "—"}`,
            `Email : ${user?.email ?? "—"}`,
            `URL : ${typeof window !== "undefined" ? window.location.href : "—"}`,
            `User-Agent : ${typeof navigator !== "undefined" ? navigator.userAgent : "—"}`,
            `Date : ${new Date().toISOString()}`,
          ]
            .filter((l) => l !== null && l !== undefined)
            .join("\n");

          const mailto = `mailto:contact@digitalmamanlibre.com?subject=${encodeURIComponent(
            `[${ticketId}] ${subject}`,
          )}&body=${encodeURIComponent(body)}`;

          // Diagnostic block re-used by the in-app support form (no intro line,
          // no email metadata — those are surfaced as separate fields).
          const diagnosticsForDialog = [
            `Dernier état : ${stateLabels[lastState]} (${lastState})`,
            `Horodatage état : ${lastStateAt}`,
            `Tentatives : ${attempts}/${MAX_ATTEMPTS}`,
            lastError ? `Dernière erreur : ${lastError}` : null,
            `User ID : ${user?.id ?? "—"}`,
            screenshotNote ? "" : null,
            screenshotNote,
          ]
            .filter((l) => l !== null && l !== undefined)
            .join("\n");

          const formButton = (
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              {t("payment_pending.support.open_form", "Ouvrir le formulaire support")}
            </button>
          );

          // Si la personne avait commencé un check-in (émotion sélectionnée
          // avant le paiement), on lui propose de retourner au teaser pour
          // réessayer le paiement plutôt que de la perdre dans le dashboard.
          const hasPendingCheckin =
            typeof window !== "undefined" &&
            !!window.localStorage.getItem("ancrage:pendingCheckin");

          const reasonParam = isNotFound ? "profile_not_found" : "activation_error";
          const resumeCheckinHref = `/checkin?payment=failed&reason=${reasonParam}&ticket=${ticketId}`;

          const resumeCheckinButton = hasPendingCheckin ? (
            <Link
              to={resumeCheckinHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Heart className="h-4 w-4" />
              {t("payment_pending.resume_checkin", "Reprendre mon check-in")}
            </Link>
          ) : null;
          const screenshotButton = screenshotsAvailable ? (
            <button
              type="button"
              onClick={handleCaptureScreenshot}
              disabled={capturing}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-60"
            >
              {capturing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : screenshotFilename ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              {capturing
                ? t("payment_pending.support.screenshot_capturing", "Capture en cours…")
                : screenshotFilename
                  ? t(
                      "payment_pending.support.screenshot_ready",
                      "Capture prête : {{filename}}",
                      { filename: screenshotFilename },
                    )
                  : t(
                      "payment_pending.support.screenshot_cta",
                      "Joindre une capture d'écran",
                    )}
            </button>
          ) : null;

          if (!isNotFound) {
            return (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-3">
                  <h1 className="text-xl font-bold">
                    {isInitiationFlow
                      ? t(
                          "payment_pending.error.title_initiation",
                          "L'activation des 7 jours prend plus de temps que prévu",
                        )
                      : t("payment_pending.error.title")}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isInitiationFlow
                      ? t(
                          "payment_pending.error.text_initiation",
                          "Ton paiement (4,99 €) n'est pas perdu. Dès que la banque le valide, ton accès aux 7 jours d'ancrage s'ouvre automatiquement.",
                        )
                      : t("payment_pending.error.text")}
                  </p>
                  <div className="rounded-xl border bg-muted/30 p-4 text-left">
                    <p className="mb-2 text-xs font-semibold text-foreground">
                      {t("payment_pending.error.steps_title", "Étapes rapides :")}
                    </p>
                    <ol className="list-decimal space-y-1.5 ps-5 text-xs text-muted-foreground leading-relaxed marker:text-primary marker:font-semibold">
                      <li>{t("payment_pending.error.step_1")}</li>
                      <li>{t("payment_pending.error.step_2")}</li>
                      <li>{t("payment_pending.error.step_3")}</li>
                    </ol>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {t("payment_pending.support.ticket_label", "Ticket")} : {ticketId}
                  </p>
                </div>
                <div className="space-y-2">
                  {resumeCheckinButton}
                  <button
                    onClick={() => {
                      setStatus("pending");
                      setAttempts(0);
                      window.location.reload();
                    }}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold ${
                      hasPendingCheckin
                        ? "border bg-background text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("payment_pending.error.retry")}
                  </button>
                  {screenshotButton}
                  {formButton}
                  <a
                    href={mailto}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium"
                  >
                    {t("payment_pending.error.contact_support_email", "Ou contacter par email")}
                  </a>
                  <Link
                    to={isInitiationFlow ? "/initiation-7-jours" : "/dashboard"}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs text-muted-foreground"
                  >
                    {isInitiationFlow
                      ? t("payment_pending.error.back_initiation", "Retour aux 7 jours d'ancrage")
                      : t("payment_pending.error.dashboard")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {t("payment_pending.error.support")}
                  </p>
                </div>
                <SupportContactDialog
                  open={supportOpen}
                  onOpenChange={setSupportOpen}
                  context={subject}
                  diagnostics={diagnosticsForDialog}
                  ticketId={ticketId}
                />
              </>
            );
          }

          return (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <UserX className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold">
                  {t("payment_pending.not_found.title", "Profil introuvable")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "payment_pending.not_found.text",
                    "Nous n'avons pas trouvé ton profil. Contacte le support pour qu'on active ton accès manuellement.",
                  )}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  {t("payment_pending.support.ticket_label", "Ticket")} : {ticketId}
                </p>
              </div>
              <div className="space-y-2">
                {resumeCheckinButton}
                {screenshotButton}
                {formButton}
                <a
                  href={mailto}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium"
                >
                  {t("payment_pending.not_found.contact_support_email", "Ou contacter par email")}
                </a>
                <Link
                  to={isInitiationFlow ? "/initiation-7-jours" : "/dashboard"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs text-muted-foreground"
                >
                  {isInitiationFlow
                    ? t("payment_pending.error.back_initiation", "Retour aux 7 jours d'ancrage")
                    : t("payment_pending.error.dashboard")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <SupportContactDialog
                open={supportOpen}
                onOpenChange={setSupportOpen}
                context={subject}
                diagnostics={diagnosticsForDialog}
                ticketId={ticketId}
              />
            </>
          );
        })()}
      </motion.div>
    </div>
  );
};

export default PaymentPending;
