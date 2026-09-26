import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Order = { payment_id: string; email: string | null; created_at: string; status: string; amount: number };

const LABEL: Record<string, string> = {
  paid: "Payée", open: "En cours", pending: "En attente", authorized: "Autorisée",
  expired: "Expirée", canceled: "Annulée", failed: "Échouée",
};
const variantOf = (s: string) =>
  s === "paid" ? "default" : ["expired", "canceled", "failed"].includes(s) ? "secondary" : "outline";

export default function FounderOrders() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    const { data, error } = await (supabase.rpc as any)("get_founder_orders_admin");
    if (error) setError(error.message); else setRows((data ?? []) as Order[]);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const paid = useMemo(() => rows.filter((r) => r.status === "paid").length, [rows]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-28">
      <Link to="/admin/premium-log" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Commandes 29 €</h1>
          <p className="text-sm text-muted-foreground">{rows.length} commande(s) · {paid} payée(s)</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className="mr-1 h-4 w-4" /> Actualiser
        </Button>
      </div>

      {error && <div className="mb-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Aucune commande 29 € pour l'instant.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {rows.map((r) => (
            <li key={r.payment_id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.email ?? "Email inconnu"}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(r.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })} · {r.payment_id}
                </p>
              </div>
              <Badge variant={variantOf(r.status) as any}>{LABEL[r.status] ?? r.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
