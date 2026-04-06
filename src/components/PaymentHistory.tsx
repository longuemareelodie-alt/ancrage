import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  created_at: string;
}

const planLabels: Record<string, string> = {
  monthly: "Abonnement mensuel",
  yearly: "Abonnement annuel",
  one_time: "Accès unique",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-green-100 text-green-700" },
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Annulé", className: "bg-destructive/10 text-destructive" },
  expired: { label: "Expiré", className: "bg-muted text-muted-foreground" },
};

const PaymentHistory = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("id, plan, status, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setSubscriptions(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const downloadInvoice = async (subscriptionId: string) => {
    setDownloadingId(subscriptionId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: { subscriptionId },
      });

      if (error) {
        toast.error("Erreur lors du téléchargement de la facture.");
        return;
      }

      // data is already a Blob or ArrayBuffer from the response
      const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-ancrage-${subscriptionId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger la facture.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-8 text-center">
        <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">Aucun paiement pour l'instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => {
        const status = statusLabels[sub.status] ?? {
          label: sub.status,
          className: "bg-muted text-muted-foreground",
        };
        const isDownloading = downloadingId === sub.id;
        return (
          <div key={sub.id} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {planLabels[sub.plan] ?? sub.plan}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(sub.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold">
                  {(sub.amount / 100).toFixed(2).replace(".", ",")}€
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}>
                  {status.label}
                </span>
                <button
                  onClick={() => downloadInvoice(sub.id)}
                  disabled={isDownloading}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                  title="Télécharger la facture"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentHistory;
