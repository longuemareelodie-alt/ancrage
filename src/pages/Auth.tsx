import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const action = searchParams.get("action");

  useEffect(() => {
    if (user) {
      if (action === "pay") {
        navigate("/paywall", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, navigate, redirectTo, action]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo("Un email de réinitialisation t'a été envoyé 💌");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const googleRedirect = action === "pay" ? "/paywall" : redirectTo;
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + googleRedirect,
      });
      if (result.error) {
        setError(result.error.message || "Erreur avec Google");
      }
    } catch (err: any) {
      setError(err.message || "Erreur avec Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {isForgot ? "Mot de passe oublié" : "Bon retour 💛"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isForgot
              ? "Entre ton email pour recevoir un lien de réinitialisation"
              : "Connecte-toi pour retrouver ton parcours"}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
            {info}
          </div>
        )}

        {isForgot ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="ton@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "..." : "Envoyer le lien"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(""); setInfo(""); }}
                className="font-medium text-primary hover:underline"
              >
                Retour à la connexion
              </button>
            </p>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="ton@email.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setIsForgot(true); setError(""); }}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "..." : "Se connecter"}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-xs text-muted-foreground">ou</span>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground pt-2">
              En créant un compte ou en te connectant, tu acceptes nos{" "}
              <Link to="/cgv" className="underline hover:text-foreground">
                CGV
              </Link>
              , notre{" "}
              <Link to="/confidentialite" className="underline hover:text-foreground">
                Politique de confidentialité
              </Link>{" "}
              et nos{" "}
              <Link to="/mentions-legales" className="underline hover:text-foreground">
                Mentions légales
              </Link>
              .
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
