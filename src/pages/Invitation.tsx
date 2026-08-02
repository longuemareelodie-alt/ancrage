import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import {
  InvitationPreview,
  fetchInvitationByToken,
  roleEmoji,
  roleLabel,
} from "@/lib/familyInvitations";

/**
 * Page publique d'invitation. Elle rassure d'abord (qui invite, à quel titre),
 * puis propose une seule action : créer son espace.
 */
const Invitation = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [preview, setPreview] = useState<InvitationPreview | null>(null);

  useEffect(() => {
    if (!token) {
      setPreview({ found: false });
      return;
    }
    fetchInvitationByToken(token).then(setPreview);
  }, [token]);

  if (!preview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const invalid =
    !preview.found ||
    preview.status === "revoked" ||
    preview.status === "expired";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card p-8 text-center shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Eclosia
        </p>

        {invalid ? (
          <>
            <h1 className="mt-6 font-serif text-2xl leading-snug text-night">
              Cette invitation n'est plus valable
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {preview.status === "expired"
                ? "Le lien a expiré. Demande simplement une nouvelle invitation à la personne qui te l'a envoyée."
                : preview.status === "revoked"
                  ? "Cette invitation a été annulée. Tu peux en demander une nouvelle."
                  : "Le lien semble incomplet. Vérifie l'e-mail reçu, ou demande une nouvelle invitation."}
            </p>
          </>
        ) : preview.status === "accepted" ? (
          <>
            <h1 className="mt-6 font-serif text-2xl leading-snug text-night">
              Tu as déjà rejoint Eclosia 🌸
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Connecte-toi pour retrouver ton espace.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground"
            >
              Me connecter
            </Link>
          </>
        ) : (
          <>
            <div className="mt-6 text-4xl">{roleEmoji(preview.role ?? "")}</div>
            <h1 className="mt-4 font-serif text-2xl leading-snug text-night">
              {preview.inviter_first_name
                ? `${preview.inviter_first_name} t'invite`
                : "Tu es invité·e"}{" "}
              à rejoindre Eclosia
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              En tant que{" "}
              <span className="font-medium text-foreground">
                {roleLabel(preview.role ?? "")}
              </span>
            </p>

            {preview.personal_note && (
              <p className="mt-6 rounded-2xl bg-muted/50 px-5 py-4 text-sm italic leading-relaxed text-foreground/80">
                « {preview.personal_note} »
              </p>
            )}

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Eclosia est un espace doux pour alléger le quotidien : organisation,
              santé, documents, supports pour les enfants — tout au même endroit.
            </p>

            <Link
              to={`/auth?invitation=${encodeURIComponent(token)}`}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Créer mon espace
            </Link>
            <p className="mt-4 text-[11px] text-muted-foreground">
              Ce lien est personnel et reste valable 30 jours.
            </p>
          </>
        )}

        {invalid && (
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground"
          >
            Découvrir Eclosia
          </Link>
        )}
      </motion.div>
    </div>
  );
};

export default Invitation;
