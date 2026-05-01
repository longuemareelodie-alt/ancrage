/**
 * /set-password — Activation page consumed by the magic link emailed to a
 * user after a successful payment (see mollie-webhook + retry-account-emails).
 *
 * The link Supabase generates redirects here with the recovery token in the
 * URL hash (`#access_token=...&type=recovery`). The Supabase JS client picks
 * it up automatically and creates a session, after which `updateUser({
 * password })` lets the user set their first password.
 *
 * If the link is broken, expired, or already used, we surface a clear error
 * + a "renvoyer un lien" button that calls `resetPasswordForEmail` to mint a
 * fresh one. We do NOT silently send the user to /auth — they came from an
 * email and need feedback they can act on.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Phase =
  | "checking" // Initial — wait for Supabase to consume the hash & set a session
  | "ready" // Session active OR user already authenticated → show the form
  | "expired" // Link expired (otp_expired) — offer to resend
  | "invalid" // Link malformed / already used / unknown error
  | "success"; // Password set, redirecting

const SUPABASE_ERROR_TO_PHASE: Record<string, Phase> = {
  otp_expired: "expired",
  access_denied: "expired",
  expired_token: "expired",
};

const SetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isWelcome = searchParams.get("welcome") === "1";

  const [phase, setPhase] = useState<Phase>("checking");
  const [errorDetail, setErrorDetail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Resend-link form state
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState("");
  const [resendError, setResendError] = useState("");

  /**
   * Inspect the URL hash on mount.
   *
   * Supabase puts auth callback parameters in the URL fragment, e.g.:
   *   #access_token=...&refresh_token=...&type=recovery
   * or, when the link is bad:
   *   #error=access_denied&error_code=otp_expired&error_description=...
   *
   * `supabase.auth` parses the fragment and emits an `onAuthStateChange`
   * event — we listen for that to flip into "ready", and we read the hash
   * directly to detect explicit error codes.
   */
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    const errorCode = hashParams.get("error_code") ?? hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (errorCode) {
      const mapped = SUPABASE_ERROR_TO_PHASE[errorCode] ?? "invalid";
      setPhase(mapped);
      setErrorDetail(errorDescription?.replace(/\+/g, " ") ?? errorCode);
      return;
    }

    // If we already have a user (e.g. they refreshed mid-flow), we're good.
    if (user) {
      setPhase("ready");
      return;
    }

    // Wait briefly for Supabase to consume the hash. If no session shows up
    // within a few seconds AND there's no recovery token in the hash, the
    // link is invalid.
    const hasRecoveryToken =
      hashParams.get("type") === "recovery" || hashParams.get("access_token");

    if (!hasRecoveryToken) {
      setPhase("invalid");
      setErrorDetail("Lien d'activation manquant ou incomplet.");
      return;
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setPhase("ready");
      }
    });

    // Safety net: if nothing happens after 6s, surface an error.
    const timeout = window.setTimeout(() => {
      setPhase((p) => (p === "checking" ? "invalid" : p));
      setErrorDetail((d) => d || "Le lien n'a pas pu être validé. Réessaie ou demande-en un nouveau.");
    }, 6000);

    return () => {
      subscription.subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
    // We intentionally do NOT depend on `user` — once we set "ready" the
    // form takes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(() => {
    if (phase === "success") return "Compte activé";
    if (phase === "expired") return "Lien expiré";
    if (phase === "invalid") return "Lien invalide";
    return isWelcome ? "Active ton compte" : "Définis ton mot de passe";
  }, [phase, isWelcome]);

  const subtitle = useMemo(() => {
    if (phase === "success") return "Tu vas être redirigée…";
    if (phase === "expired")
      return "Pour ta sécurité, le lien que tu as reçu n'est valide qu'une heure. Demande-en un nouveau ci-dessous.";
    if (phase === "invalid")
      return "Ce lien n'est plus utilisable (déjà ouvert, modifié, ou abîmé par ton client mail).";
    if (phase === "checking") return "Validation du lien d'activation…";
    return isWelcome
      ? "Choisis un mot de passe pour finaliser la création de ton compte."
      : "Choisis un nouveau mot de passe sécurisé.";
  }, [phase, isWelcome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 8) {
      setFormError("8 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        // Most common errors here:
        //  - "Auth session missing!" → token consumed/expired between page
        //    load and submit. Treat as expired so the user can resend.
        //  - "New password should be different..." → just show as form error.
        if (/session missing|jwt expired|token has expired/i.test(error.message)) {
          setPhase("expired");
          setErrorDetail(error.message);
          return;
        }
        throw error;
      }
      setPhase("success");
      window.setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (err: any) {
      setFormError(err.message || "Une erreur est survenue. Réessaie.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError("");
    setResendInfo("");

    const email = resendEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setResendError("Adresse email invalide.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password?welcome=1`,
      });
      // Note: Supabase intentionally does not reveal whether the address
      // exists — we always show a generic "if the address is known" message.
      if (error) throw error;
      setResendInfo("Si cette adresse correspond à un compte, un nouveau lien vient d'être envoyé. Vérifie ta boîte (et tes spams).");
      setResendEmail("");
    } catch (err: any) {
      setResendError(err.message || "Impossible d'envoyer le lien. Réessaie dans un instant.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {phase === "checking" && (
          <div className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            Un instant…
          </div>
        )}

        {phase === "success" && (
          <div className="rounded-lg bg-primary/10 p-4 text-center text-sm text-primary">
            ✅ Mot de passe enregistré. Bienvenue !
          </div>
        )}

        {phase === "ready" && (
          <>
            {formError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="set-pw-new">
                  Mot de passe
                </label>
                <input
                  id="set-pw-new"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  8 caractères minimum.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="set-pw-confirm">
                  Confirme
                </label>
                <input
                  id="set-pw-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "..." : isWelcome ? "Activer mon compte" : "Mettre à jour"}
              </button>
            </form>
          </>
        )}

        {(phase === "expired" || phase === "invalid") && (
          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {errorDetail}
            </div>

            <form onSubmit={handleResend} className="space-y-3 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">Recevoir un nouveau lien</p>
              <input
                type="email"
                autoComplete="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                placeholder="ton@email.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {resendError && (
                <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">{resendError}</div>
              )}
              {resendInfo && (
                <div className="rounded-lg bg-primary/10 p-2 text-xs text-primary">{resendInfo}</div>
              )}
              <button
                type="submit"
                disabled={resending}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {resending ? "..." : "M'envoyer un nouveau lien"}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              <Link to="/auth" className="underline hover:text-foreground">
                Revenir à la connexion
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SetPassword;
