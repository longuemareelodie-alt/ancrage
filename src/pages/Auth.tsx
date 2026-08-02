import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { PREMIUM_SCOPE_LABEL } from "@/lib/premiumOffer";
import {
  fetchInvitationByToken,
  rememberPendingInvitation,
  roleLabel,
} from "@/lib/familyInvitations";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const action = searchParams.get("action");
  const invitationToken = searchParams.get("invitation");
  const [invitationHint, setInvitationHint] = useState<string | null>(null);

  // Invitation reçue : on prépare le terrain (adresse préremplie, jeton gardé)
  useEffect(() => {
    if (!invitationToken) return;
    rememberPendingInvitation(invitationToken);
    let active = true;
    fetchInvitationByToken(invitationToken).then((inv) => {
      if (!active || !inv.found || inv.status !== "pending") return;
      if (inv.invited_email) setEmail(inv.invited_email);
      setInvitationHint(
        `${inv.inviter_first_name ? `${inv.inviter_first_name} t'a invité·e` : "Tu as été invité·e"} en tant que ${roleLabel(inv.role ?? "").toLowerCase()}. Connecte-toi avec cette adresse pour rattacher l'invitation.`,
      );
    });
    return () => {
      active = false;
    };
  }, [invitationToken]);

  useEffect(() => {
    if (user) {
      navigate(action === "pay" ? "/paywall" : redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo, action]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo(t("auth.reset_sent"));
    } catch (err: any) {
      setError(err.message || t("auth.generic_error"));
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || t("auth.generic_error"));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{isForgot ? t("auth.title_forgot") : t("auth.title_login")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isForgot ? t("auth.subtitle_forgot") : t("auth.subtitle_login")}
          </p>
        </div>

        {invitationHint && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/80">
            {invitationHint}
          </div>
        )}

        {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {info && <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</div>}

        {isForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("auth.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t("auth.email_placeholder")} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {loading ? t("auth.loading_dots") : t("auth.submit_send_link")}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <button type="button" onClick={() => { setIsForgot(false); setError(""); setInfo(""); }}
                className="font-medium text-primary hover:underline">
                {t("auth.back_to_login")}
              </button>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("auth.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={t("auth.email_placeholder")} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("auth.password")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••" />
              </div>
              <div className="text-end">
                <button type="button" onClick={() => { setIsForgot(true); setError(""); }}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline">
                  {t("auth.forgot")}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
                {loading ? t("auth.loading_dots") : t("auth.submit_login")}
              </button>
            </form>

            {/* Pas de compte → mode "paiement-d'abord". Plus de signup classique :
                un compte n'est créé qu'après un paiement Mollie réussi. */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">
                Pas encore de compte ?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les comptes ne sont créés qu'après un paiement. Découvre l'offre
                Premium et son {PREMIUM_SCOPE_LABEL}.
              </p>
              <Link
                to="/"
                className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Découvrir l'offre Premium
              </Link>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground pt-2">
              <Trans i18nKey="auth.legal_intro" />{" "}
              <Link to="/cgv" className="underline hover:text-foreground">{t("auth.legal_cgv")}</Link>
              {t("auth.legal_and")}{" "}
              <Link to="/confidentialite" className="underline hover:text-foreground">{t("auth.legal_privacy")}</Link>
              {t("auth.legal_and2")}{" "}
              <Link to="/mentions-legales" className="underline hover:text-foreground">{t("auth.legal_legal")}</Link>.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
