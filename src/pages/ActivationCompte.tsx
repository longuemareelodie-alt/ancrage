/**
 * /activation-compte — Étape pédagogique entre l'email de bienvenue (envoyé
 * par mollie-webhook / retry-account-emails / send-activation-to-existing) et
 * la page /set-password qui consomme effectivement le token de récupération.
 *
 * Pourquoi cette étape ?
 *  - Après un paiement Mollie réussi, l'utilisateur reçoit un mail avec un
 *    lien magique. Atterrir directement sur un formulaire de mot de passe
 *    sans contexte est froid et désoriente (« Pourquoi on me demande ça ? »).
 *  - Cette page rassure : « ton paiement est confirmé, voilà ce qu'il reste
 *    à faire », résume le parcours en 3 étapes claires, puis transmet le
 *    token (présent dans le hash) à /set-password en un clic.
 *
 * Détails techniques :
 *  - Supabase met le token dans le **hash** (`#access_token=...&type=recovery`)
 *    OU place un code d'erreur (`#error_code=otp_expired`) selon le cas.
 *  - On conserve `location.hash` lors de la navigation vers /set-password
 *    sinon Supabase n'aurait plus rien à consommer.
 *  - Compat ascendante : les anciens mails pointant vers /set-password
 *    continuent de fonctionner sans changement.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, KeyRound, LogIn, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LinkState =
  | "checking" // Lecture du hash en cours
  | "valid" // Token recovery présent → on peut activer
  | "expired" // Lien expiré (otp_expired / access_denied)
  | "missing"; // Aucun token → l'utilisateur est arrivé directement sur /activation-compte

const ActivationCompte = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [errorDetail, setErrorDetail] = useState("");
  const [hashToForward, setHashToForward] = useState("");

  // « Renvoyer l'email d'activation » : on demande l'adresse à l'utilisateur
  // puis on déclenche un nouveau lien magique via Supabase. La réponse reste
  // volontairement générique pour ne pas révéler l'existence d'un compte.
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendInfo, setResendInfo] = useState("");
  const [resendError, setResendError] = useState("");

  // L'email envoyé par le webhook ajoute `?welcome=1`. On le retransmet à
  // /set-password pour qu'il garde le wording « Active ton compte ».
  const isWelcome = searchParams.get("welcome") === "1";

  useEffect(() => {
    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(rawHash);

    const errorCode = hashParams.get("error_code") ?? hashParams.get("error");
    const errorDescription = hashParams.get("error_description");

    if (errorCode) {
      setLinkState("expired");
      setErrorDetail(errorDescription?.replace(/\+/g, " ") ?? errorCode);
      return;
    }

    const hasRecoveryToken =
      hashParams.get("type") === "recovery" || hashParams.get("access_token");

    if (!hasRecoveryToken) {
      setLinkState("missing");
      return;
    }

    // Conserver le hash brut tel quel — Supabase a besoin du fragment
    // intact pour créer la session sur /set-password.
    setHashToForward(window.location.hash);
    setLinkState("valid");
  }, []);

  const handleContinue = () => {
    // On préserve `?welcome=1` côté query, et on ré-attache le hash original.
    const target = `/set-password${isWelcome ? "?welcome=1" : ""}${hashToForward}`;
    navigate(target, { replace: true });
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
        redirectTo: `${window.location.origin}/activation-compte?welcome=1`,
      });
      if (error) throw error;
      setResendInfo(
        "Si cette adresse correspond à un compte, un nouveau lien d'activation vient d'être envoyé. Vérifie ta boîte (et tes spams).",
      );
      setResendEmail("");
    } catch (err: any) {
      setResendError(err?.message || "Impossible d'envoyer le lien. Réessaie dans un instant.");
    } finally {
      setResending(false);
    }
  };

  const headline = useMemo(() => {
    if (linkState === "expired") return "Ton lien a expiré";
    if (linkState === "missing") return "Activation de ton compte";
    return "Bienvenue, ton paiement est confirmé 🎉";
  }, [linkState]);

  const subline = useMemo(() => {
    if (linkState === "expired")
      return "Pour ta sécurité, le lien d'activation n'est valide qu'une heure. Demande-en un nouveau ci-dessous.";
    if (linkState === "missing")
      return "Pour activer ton compte, ouvre l'email de bienvenue qu'on vient de t'envoyer et clique sur le lien qu'il contient.";
    return "Encore une étape pour finaliser la création de ton compte ANCRAGE.";
  }, [linkState]);

  const steps = [
    {
      icon: CheckCircle2,
      title: "Paiement confirmé",
      desc: "Ton accès est enregistré, à vie. Tu retrouveras ta facture dans ton profil.",
      done: true,
    },
    {
      icon: KeyRound,
      title: "Choisis ton mot de passe",
      desc: "8 caractères minimum. Il te servira à te reconnecter quand tu voudras.",
      done: false,
      current: true,
    },
    {
      icon: LogIn,
      title: "Connecte-toi quand tu veux",
      desc: "Email + mot de passe. On t'amène directement à ton tableau de bord.",
      done: false,
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <header className="text-center space-y-2">
          <h1 className="font-serif text-2xl font-bold leading-tight">{headline}</h1>
          <p className="text-sm text-muted-foreground">{subline}</p>
        </header>

        {linkState === "checking" && (
          <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            Vérification du lien d'activation…
          </div>
        )}

        {linkState === "valid" && (
          <>
            <ol className="space-y-3">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border p-4 ${
                      step.current
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        step.done
                          ? "bg-primary text-primary-foreground"
                          : step.current
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">
                        {step.title}
                        {step.current && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                            Étape en cours
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Définir mon mot de passe <ArrowRight className="h-4 w-4" />
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Lien personnel, valide une seule fois.
            </p>
          </>
        )}

        {(linkState === "expired" || linkState === "missing") && (
          <div className="space-y-4">
            {linkState === "expired" && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {errorDetail || "Ce lien n'est plus valide."}
              </div>
            )}

            {linkState === "missing" && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground/85 leading-relaxed space-y-3">
                <p>
                  <strong>Tu n'as pas reçu l'email ?</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                  <li>Vérifie ton dossier spam / courrier indésirable.</li>
                  <li>L'envoi peut prendre 1 à 2 minutes après le paiement.</li>
                  <li>Sinon, renvoie-toi un nouveau lien ci-dessous.</li>
                </ul>
              </div>
            )}

            <form
              onSubmit={handleResend}
              className="space-y-3 rounded-xl border border-border bg-card p-4"
            >
              <label htmlFor="resend-email" className="block text-sm font-semibold">
                Renvoyer l'email d'activation
              </label>
              <input
                id="resend-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ton.email@exemple.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {resendError && (
                <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                  {resendError}
                </div>
              )}
              {resendInfo && (
                <div className="rounded-lg bg-primary/10 p-2 text-xs text-primary">
                  {resendInfo}
                </div>
              )}
              <button
                type="submit"
                disabled={resending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {resending ? "Envoi en cours…" : "Renvoyer l'email d'activation"}
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Le lien est valide 1 heure.
              </p>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Déjà activé ?{" "}
              <Link to="/auth" className="underline hover:text-foreground">
                Connecte-toi
              </Link>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivationCompte;
