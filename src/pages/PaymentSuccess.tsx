import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Download, Loader2, BookOpen, Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-ancrage.png";
import confetti from "canvas-confetti";

const PaymentSuccess = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentIdFromUrl = searchParams.get("payment_id");
  const [firstName, setFirstName] = useState("");
  const [hasPendingCheckin, setHasPendingCheckin] = useState(false);
  const [latestPaymentId, setLatestPaymentId] = useState<string | null>(paymentIdFromUrl);
  
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("ancrage:pendingCheckin");
        if (raw) {
          const parsed = JSON.parse(raw) as { emotionId?: string; savedAt?: number };
          if (
            parsed?.emotionId &&
            parsed.savedAt &&
            Date.now() - parsed.savedAt < 2 * 60 * 60 * 1000
          ) {
            setHasPendingCheckin(true);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.first_name) setFirstName(data.first_name);
      });

    // If Mollie returned a payment_id in the URL, prefer it directly so
    // the receipt button shows up immediately. Otherwise fall back to
    // the user's most recent successful payment.
    if (paymentIdFromUrl) return;
    supabase
      .from("premium_activation_log")
      .select("payment_id, raw")
      .eq("user_id", user.id)
      .in("status", ["paid", "already_active"])
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.payment_id) {
          setLatestPaymentId(data.payment_id);
        }
      });
  }, [user, paymentIdFromUrl]);

  const handleDownloadInvoice = async () => {
    if (!latestPaymentId || downloadingInvoice) return;
    setDownloadingInvoice(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Session expirée");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentId: latestPaymentId }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-ancrage-${latestPaymentId.replace(/^tr_/, "").slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({
        title: "Téléchargement impossible",
        description: e instanceof Error ? e.message : "Réessaie dans un instant.",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <img src={logo} alt="Eclosia" className="mx-auto h-14 w-auto" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15"
        >
          <CheckCircle className="h-10 w-10 text-primary" />
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">
            {firstName ? `Bienvenue, ${firstName} 💛` : "Bienvenue 💛"}
          </h1>
          <p className="text-muted-foreground">
            Ton accès premium est maintenant actif.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <p className="font-bold">Ce qui t'attend</p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground text-left">
            {[
              "Tous les exercices débloqués",
              "Le parcours guidé complet",
              "Les outils de suivi et de progression",
              "Un espace sécurisé, à ton rythme",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link
            to={hasPendingCheckin ? "/checkin" : "/dashboard"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {hasPendingCheckin ? "Reprendre mon check-in" : "Commencer maintenant"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {latestPaymentId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="space-y-2"
          >
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
            >
              {downloadingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Télécharger ma facture
            </button>
            <p className="text-[11px] text-muted-foreground">PDF · ANCRAGE</p>
          </motion.div>
        )}

        <p className="text-xs text-muted-foreground">
          Ton corps peut enfin redescendre. Tu es au bon endroit.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;