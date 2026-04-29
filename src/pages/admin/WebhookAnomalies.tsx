import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = "open" | "investigating" | "resolved" | "ignored";
type Kind = "paid_no_premium" | "premium_no_log" | "already_active" | "webhook_failure" | "other";

interface Anomaly {
  id: string;
  kind: Kind;
  severity: "critical" | "warning" | "info";
  status: Status;
  target_user_id: string | null;
  payment_id: string | null;
  message: string | null;
  snapshot: Record<string, unknown> | null;
  ticket_id: string | null;
  occurrences: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
}

const PAGE_SIZE = 25;

const KIND_LABEL: Record<Kind, string> = {
  paid_no_premium: "Paiement sans premium",
  premium_no_log: "Premium sans log",
  already_active: "Déjà active",
  webhook_failure: "Échec webhook",
  other: "Autre",
};

const STATUS_LABEL: Record<Status, string> = {
  open: "Ouverte",
  investigating: "En cours",
  resolved: "Résolue",
  ignored: "Ignorée",
};

const STATUS_VARIANT: Record<Status, "default" | "destructive" | "secondary" | "outline"> = {
  open: "destructive",
  investigating: "secondary",
  resolved: "default",
  ignored: "outline",
};

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return format(dt, "yyyy-MM-dd HH:mm");
};
const shortId = (id: string | null) => (id ? id.slice(0, 8) + "…" : "—");

const WebhookAnomalies = () => {
  const [rows, setRows] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("open");
  const [kindFilter, setKindFilter] = useState<Kind | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<{ a: Anomaly; status: Status } | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("webhook_anomalies")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(500);
    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as unknown as Anomaly[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { open: 0, investigating: 0, resolved: 0, ignored: 0, total: rows.length };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (q) {
        const hay = `${r.target_user_id ?? ""} ${r.payment_id ?? ""} ${r.ticket_id ?? ""} ${r.message ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, kindFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const openResolve = (a: Anomaly, status: Status) => {
    setResolveTarget({ a, status });
    setResolveNote(a.resolution_note ?? "");
  };

  const confirmResolve = async () => {
    if (!resolveTarget) return;
    setUpdating(true);
    const { error } = await supabase.rpc("resolve_webhook_anomaly", {
      _anomaly_id: resolveTarget.a.id,
      _new_status: resolveTarget.status,
      _note: resolveNote || null,
    });
    setUpdating(false);
    if (error) {
      toast.error(`Mise à jour échouée: ${error.message}`);
      return;
    }
    toast.success(`Anomalie marquée: ${STATUS_LABEL[resolveTarget.status]}`);
    setResolveTarget(null);
    setResolveNote("");
    load();
  };

  return (
    <main className="container max-w-6xl py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/premium-log">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour au log
          </Link>
        </Button>
      </div>

      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Anomalies Webhook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi de toutes les alertes déclenchées (audit premium + webhooks) avec statut de résolution.
          </p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline">
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Chargement…</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2" /> Rafraîchir</>
          )}
        </Button>
      </header>

      {/* Compteurs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <button onClick={() => { setStatusFilter("all"); setPage(0); }}
          className={`text-left rounded-lg border p-3 hover:bg-muted ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-semibold mt-1">{counts.total}</div>
        </button>
        <button onClick={() => { setStatusFilter("open"); setPage(0); }}
          className={`text-left rounded-lg border p-3 hover:bg-muted ${statusFilter === "open" ? "ring-2 ring-primary" : ""}`}>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Ouvertes
          </div>
          <div className="text-2xl font-semibold mt-1 text-destructive">{counts.open}</div>
        </button>
        <button onClick={() => { setStatusFilter("investigating"); setPage(0); }}
          className={`text-left rounded-lg border p-3 hover:bg-muted ${statusFilter === "investigating" ? "ring-2 ring-primary" : ""}`}>
          <div className="text-xs text-muted-foreground">En cours</div>
          <div className="text-2xl font-semibold mt-1">{counts.investigating}</div>
        </button>
        <button onClick={() => { setStatusFilter("resolved"); setPage(0); }}
          className={`text-left rounded-lg border p-3 hover:bg-muted ${statusFilter === "resolved" ? "ring-2 ring-primary" : ""}`}>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Résolues
          </div>
          <div className="text-2xl font-semibold mt-1">{counts.resolved}</div>
        </button>
        <button onClick={() => { setStatusFilter("ignored"); setPage(0); }}
          className={`text-left rounded-lg border p-3 hover:bg-muted ${statusFilter === "ignored" ? "ring-2 ring-primary" : ""}`}>
          <div className="text-xs text-muted-foreground">Ignorées</div>
          <div className="text-2xl font-semibold mt-1">{counts.ignored}</div>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={kindFilter} onValueChange={(v) => { setKindFilter(v as any); setPage(0); }}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground">Recherche</label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="user_id, payment_id, ticket, message…" className="pl-8" />
          </div>
        </div>
        {(kindFilter !== "all" || search || statusFilter !== "open") && (
          <Button variant="ghost" size="sm" onClick={() => { setKindFilter("all"); setSearch(""); setStatusFilter("open"); setPage(0); }}>
            Réinitialiser
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Tableau */}
      <div className="overflow-x-auto rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>User / Payment</TableHead>
              <TableHead>Occ.</TableHead>
              <TableHead>Première / Dernière</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={8} className="text-center py-8">
                <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Chargement…
              </TableCell></TableRow>
            )}
            {!loading && pageRows.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Aucune anomalie pour ces filtres.
              </TableCell></TableRow>
            )}
            {pageRows.map((a) => {
              const isExpanded = expanded === a.id;
              return (
                <>
                  <TableRow key={a.id}>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setExpanded(isExpanded ? null : a.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{KIND_LABEL[a.kind]}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{a.ticket_id ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div className="font-mono">{shortId(a.target_user_id)}</div>
                      <div className="font-mono text-muted-foreground">{a.payment_id ?? "—"}</div>
                    </TableCell>
                    <TableCell>
                      {a.occurrences > 1 ? (
                        <Badge variant="secondary">×{a.occurrences}</Badge>
                      ) : a.occurrences}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      <div>{fmtDate(a.first_seen_at)}</div>
                      <div className="text-muted-foreground">{fmtDate(a.last_seen_at)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select value={a.status} onValueChange={(v) => openResolve(a, v as Status)}>
                        <SelectTrigger className="w-36 h-8 text-xs ml-auto"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Ouverte</SelectItem>
                          <SelectItem value="investigating">En cours</SelectItem>
                          <SelectItem value="resolved">Résoudre</SelectItem>
                          <SelectItem value="ignored">Ignorer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={a.id + "-exp"} className="bg-muted/30">
                      <TableCell colSpan={8} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Message</div>
                            <div>{a.message ?? "—"}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Résolution</div>
                            {a.resolved_at ? (
                              <div>
                                <div>Le {fmtDate(a.resolved_at)} par {shortId(a.resolved_by)}</div>
                                {a.resolution_note && <div className="text-muted-foreground italic mt-1">"{a.resolution_note}"</div>}
                              </div>
                            ) : <span className="text-muted-foreground">Non résolue</span>}
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Snapshot</div>
                            <pre className="text-xs bg-background border rounded p-2 overflow-auto max-h-48">
                              {JSON.stringify(a.snapshot, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Précédent</Button>
            <span className="px-3 py-1.5 text-muted-foreground">Page {safePage + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>Suivant</Button>
          </div>
        </div>
      )}

      {/* Dialog de résolution */}
      <Dialog open={!!resolveTarget} onOpenChange={(o) => !o && setResolveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              {resolveTarget && (
                <>Anomalie <span className="font-mono">{resolveTarget.a.ticket_id}</span> → <strong>{STATUS_LABEL[resolveTarget.status]}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm">Note (optionnelle)</label>
            <Textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Cause identifiée, action prise…" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTarget(null)} disabled={updating}>Annuler</Button>
            <Button onClick={confirmResolve} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default WebhookAnomalies;
