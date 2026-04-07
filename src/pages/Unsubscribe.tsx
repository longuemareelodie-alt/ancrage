import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("used");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };

    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (data?.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Désabonnement</h1>

        {status === "loading" && (
          <p className="text-muted-foreground">Vérification en cours…</p>
        )}

        {status === "valid" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Tu es sur le point de te désabonner des emails d'ANCRAGE.
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={submitting}
              className="rounded-xl bg-destructive px-6 py-3 font-semibold text-destructive-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? "En cours…" : "Confirmer le désabonnement"}
            </button>
          </div>
        )}

        {status === "success" && (
          <p className="text-muted-foreground">
            ✅ Tu as été désabonné(e) avec succès.
          </p>
        )}

        {status === "used" && (
          <p className="text-muted-foreground">
            Tu es déjà désabonné(e) de ces emails.
          </p>
        )}

        {status === "invalid" && (
          <p className="text-muted-foreground">
            Ce lien est invalide ou a expiré.
          </p>
        )}

        {status === "error" && (
          <p className="text-muted-foreground">
            Une erreur est survenue. Réessaie plus tard.
          </p>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
