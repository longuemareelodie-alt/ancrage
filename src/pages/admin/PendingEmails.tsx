/**
 * /admin/pending-emails — file d'attente des emails d'activation post-paiement.
 *
 * Cette page permet à un admin de :
 *   - consulter en temps réel l'état de la file `pending_account_emails` ;
 *   - filtrer par statut et par email ;
 *   - relancer manuellement un envoi (sans attendre le cron toutes les 5 min) ;
 *   - réarmer une ligne `failed` en `pending` (reset attempts) ;
 *   - voir l'historique des tentatives (attempts, last_error, prochain essai).
 *
 * La RLS limite SELECT/UPDATE aux admins. La relance manuelle passe par
 * l'edge function `retry-account-email-now` qui valide aussi le rôle admin
 * côté serveur (défense en profondeur).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PendingStatus = "pending" | "sent" | "failed";

interface PendingEmailRow {
  id: string;
  email: string;
  payment_id: string;
  user_id: string | null;
  template_name: string;
  status: PendingStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  last_attempt_at: string | null;
  next_attempt_at: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABEL: Record<PendingStatus, string> = {
  pending: "En attente",
  sent: "Envoyé",
  failed: "Échec",
};

const StatusBadge = ({ status }: { status: PendingStatus }) => {
  const cfg: Record<PendingStatus, { className: string; icon: typeof Clock }> = {
    pending: { className: "bg-amber-100 text-amber-900 border-amber-200", icon: Clock },
    sent: { className: "bg-emerald-100 text-emerald-900 border-emerald-200", icon: CheckCircle2 },
    failed: { className: "bg-rose-100 text-rose-900 border-rose-200", icon: XCircle },
  };
  const { className, icon: Icon } = cfg[status];
  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Icon className="h-3 w-3" />
      {STATUS_LABEL[status]}
    </Badge>
  );
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "dd/MM/yyyy HH:mm");
  } catch {
    return iso;
  }
};

const formatRelative = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
  } catch {
    return iso;
  }
};

const PendingEmailsAdmin = () => {
  const [rows, setRows] = useState<PendingEmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PendingStatus | "all">("all");
  const [emailQuery, setEmailQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pending_account_emails")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(`Chargement impossible : ${error.message}`);
      setRows([]);
    } else {
      setRows((data ?? []) as PendingEmailRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = emailQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !r.email.toLowerCase().includes(q) && !r.payment_id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rows, statusFilter, emailQuery]);

  const counts = useMemo(() => {
    const c: Record<PendingStatus, number> = { pending: 0, sent: 0, failed: 0 };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const callRetry = useCallback(
    async (id: string, resetOnly: boolean) => {
      setActingId(id);
      try {
        const { data, error } = await supabase.functions.invoke("retry-account-email-now", {
          body: { id, resetOnly },
        });
        if (error) throw error;
        const action = (data as { action?: string })?.action ?? "ok";
        if (action === "sent") toast.success("Email renvoyé avec succès.");
        else if (action === "reset") toast.success("Ligne réarmée en attente.");
        else if (action === "failed") toast.error("Échec définitif (max attempts atteint).");
        else if (action === "retry_scheduled") toast.warning("Échec, retry replanifié.");
        else toast.success("Action effectuée.");
        await load();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur inconnue";
        toast.error(`Action impossible : ${msg}`);
      } finally {
        setActingId(null);
      }
    },
    [load],
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/20 via-background to-background pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              to="/admin/premium-audit"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3" /> Retour audit
            </Link>
            <h1 className="font-serif text-2xl font-semibold flex items-center gap-2">
              <Inbox className="h-6 w-6 text-primary" />
              File d'emails d'activation
            </h1>
            <p className="text-xs text-muted-foreground">
              Emails post-paiement en attente d'envoi (cron toutes les 5 min). Vous pouvez relancer
              manuellement ou réarmer une ligne échouée.
            </p>
          </div>
          <Button onClick={load} variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recharger
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">En attente</p>
            <p className="text-2xl font-semibold text-amber-600">{counts.pending}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Envoyés</p>
            <p className="text-2xl font-semibold text-emerald-600">{counts.sent}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Échecs</p>
            <p className="text-2xl font-semibold text-rose-600">{counts.failed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Statut
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as PendingStatus | "all")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="sent">Envoyés</SelectItem>
                <SelectItem value="failed">Échecs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Recherche email / payment_id
            </label>
            <Input
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="ex. user@exemple.fr ou tr_xxx"
              className="h-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Tentatives</TableHead>
                  <TableHead>Prochain essai</TableHead>
                  <TableHead>Dernière erreur</TableHead>
                  <TableHead>Créé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune ligne ne correspond aux filtres.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((row) => {
                  const isActing = actingId === row.id;
                  const canRetry = row.status !== "sent";
                  const canReset = row.status === "failed";
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 font-medium">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {row.email}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {row.payment_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                        {row.status === "sent" && row.sent_at && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {formatRelative(row.sent_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {row.attempts}/{row.max_attempts}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.status === "pending" ? (
                          <div className="space-y-0.5">
                            <div className="text-xs">{formatDateTime(row.next_attempt_at)}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {formatRelative(row.next_attempt_at)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        {row.last_error ? (
                          <div className="flex items-start gap-1 text-xs text-rose-700">
                            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 break-all">{row.last_error}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                        {row.last_attempt_at && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            tenté {formatRelative(row.last_attempt_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatRelative(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {canRetry && (
                            <Button
                              size="sm"
                              variant="default"
                              disabled={isActing}
                              onClick={() => callRetry(row.id, false)}
                              title="Renvoyer immédiatement (génère un nouveau lien)"
                            >
                              {isActing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              Renvoyer
                            </Button>
                          )}
                          {canReset && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isActing}
                              onClick={() => callRetry(row.id, true)}
                              title="Réarmer en pending (attempts=0), pour reprise par le cron"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Réarmer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Le cron `retry-account-emails` tourne toutes les 5 min · Backoff 1m → 5m → 15m → 1h → 4h
          → 12h · Failed après 6 tentatives
        </p>
      </div>
    </main>
  );
};

export default PendingEmailsAdmin;
