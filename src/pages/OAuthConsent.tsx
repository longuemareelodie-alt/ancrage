import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthClient = {
  name?: string;
  client_name?: string;
  logo_uri?: string;
  redirect_uris?: string[];
};
type AuthorizationDetails = {
  client?: OAuthClient;
  scopes?: string[];
  requested_scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
  user_email?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};
const oauthApi = () =>
  (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const humaniseScope = (s: string): string => {
  switch (s) {
    case "openid":
      return "Vérifier ton identité Eclosia";
    case "email":
      return "Connaître ton adresse email";
    case "profile":
      return "Voir ton nom et ton profil de base";
    default:
      return `Permission supplémentaire : ${s}`;
  }
};

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Cette page nécessite un paramètre authorization_id.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/auth?redirect=${encodeURIComponent(next)}`;
        return;
      }
      try {
        const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (e: any) {
        if (active) setError(e?.message ?? "Erreur inconnue");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = approve
        ? await oauthApi().approveAuthorization(authorizationId)
        : await oauthApi().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("Aucune redirection retournée par le serveur d'autorisation.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "Erreur inconnue");
    }
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            Impossible de charger cette demande d'accès
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  const clientName =
    details.client?.name || details.client?.client_name || "une application";
  const scopes = details.scopes ?? details.requested_scopes ?? [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Connecter {clientName} à Eclosia
          </h1>
          <p className="text-sm text-muted-foreground">
            {clientName} pourra utiliser Eclosia en ton nom, avec tes propres
            données.
          </p>
        </div>

        <div className="rounded-xl bg-primary/5 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Ce que {clientName} va pouvoir faire
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            <li>• Lire ton journal, tes check-ins et tes portraits mensuels</li>
            <li>• Ajouter de nouvelles entrées de journal à ta place</li>
            <li>• Voir tes stats d'ambassadrice (si tu es ambassadrice)</li>
          </ul>
          {scopes.length > 0 && (
            <>
              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Informations partagées
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {scopes.map((s) => (
                  <li key={s}>• {humaniseScope(s)}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground text-center">
          Eclosia continue d'appliquer ses règles d'accès : {clientName} ne peut
          voir que tes propres données, jamais celles d'autres utilisatrices.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => decide(true)}
            disabled={busy}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "…" : "Autoriser"}
          </button>
          <button
            type="button"
            onClick={() => decide(false)}
            disabled={busy}
            className="w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Refuser
          </button>
        </div>
      </motion.div>
    </main>
  );
};

export default OAuthConsent;
