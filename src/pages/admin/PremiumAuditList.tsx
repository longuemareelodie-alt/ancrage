import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  ShieldCheck,
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

type AnomalyKind = "paid_no_premium" | "premium_no_log" | "already_active";

interface Anomaly {
  key: string;
  kind: AnomalyKind;
  severity: "critical" | "warning" | "info";
  user_id: string | null;
  email: string | null;
  payment_id: string | null;
  amount: number | null;
  is_premium: boolean | null;
  log_status: string;
  timestamp: string | null;
  message: string | null;
  raw: Record<string, unknown>;
}

interface AuditResult {
  paid_without_premium: Array<{
    user_id: string;
    payment_id: string | null;
    amount: number | null;
    paid_at: string | null;
    is_premium: boolean | null;
    email: string | null;
  }>;
  premium_without_paid_log: Array<{
    user_id: string;
    email: string | null;
    plan_type: string | null;
    profile_created_at: string | null;
    profile_updated_at: string | null;
  }>;
  already_active: Array<{
    id: string;
    user_id: string | null;
    payment_id: string | null;
    amount: number | null;
    message: string | null;
    created_at: string | null;
    email: string | null;
  }>;
  generated_at: string;
}

const PAGE_SIZE = 25;

const KIND_LABEL: Record<AnomalyKind, string> = {
  paid_no_premium: "Paiement sans premium",
  premium_no_log: "Premium sans log de paiement",
  already_active: "Activation déjà active",
};

const fmtAmount = (a: number | null) => (a != null ? `${(a / 100).toFixed(2)} €` : "—");
const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return format(dt, "yyyy-MM-dd HH:mm");
};
const shortId = (id: string | null) => (id ? id.slice(0, 8) + "…" : "—");

const flatten = (data: AuditResult): Anomaly[] => {
  const out: Anomaly[] = [];
  for (const r of data.paid_without_premium) {
    out.push({
      key: `pnp:${r.user_id}:${r.payment_id ?? "none"}`,
      kind: "paid_no_premium",
      severity: "critical",
      user_id: r.user_id,
      email: r.email,
      payment_id: r.payment_id,
      amount: r.amount,
      is_premium: r.is_premium,
      log_status: "paid",
      timestamp: r.paid_at,
      message: "Paiement enregistré mais profil non premium",
      raw: r as unknown as Record<string, unknown>,
    });
  }
  for (const r of data.premium_without_paid_log) {
    out.push({
      key: `pnl:${r.user_id}`,
      kind: "premium_no_log",
      severity: "critical",
      user_id: r.user_id,
      email: r.email,
      payment_id: null,
      amount: null,
      is_premium: true,
      log_status: "missing",
      timestamp: r.profile_updated_at,
      message: `Profil premium (${r.plan_type ?? "—"}) sans log paid`,
      raw: r as unknown as Record<string, unknown>,
    });
  }
  for (const r of data.already_active) {
    out.push({
      key: `aac:${r.id}`,
      kind: "already_active",
      severity: "info",
      user_id: r.user_id,
      email: r.email,
      payment_id: r.payment_id,
      amount: r.amount,
      is_premium: null,
      log_status: "already_active",
      timestamp: r.created_at,
      message: r.message,
      raw: r as unknown as Record<string, unknown>,
    });
  }
  // tri par date desc
  out.sort((a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""));
  return out;
};

const PremiumAuditList = () => {
  const [data, setData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<AnomalyKind | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [logging, setLogging] = useState<string | null>(null);
  const [loggedKeys, setLoggedKeys] = useState<Set<string>>(new Set());

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    const { data: result, error } = await supabase.rpc("get_premium_audit");
    if (error) {
      setError(error.message);
      setData(null);
    } else {
      setData(result as unknown as AuditResult);
      setPage(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const allAnomalies = useMemo(() => (data ? flatten(data) : []), [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAnomalies.filter((a) => {
      if (kindFilter !== "all" && a.kind !== kindFilter) return false;
      if (q) {
        const hay = `${a.email ?? ""} ${a.user_id ?? ""} ${a.payment_id ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allAnomalies, kindFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const counts = useMemo(() => {
    const c = { paid_no_premium: 0, premium_no_log: 0, already_active: 0 };
    for (const a of allAnomalies) c[a.kind]++;
    return c;
  }, [allAnomalies]);

  const criticalCount = counts.paid_no_premium + counts.premium_no_log;

  const logOne = async (a: Anomaly) => {
    if (loggedKeys.has(a.key)) return;
    setLogging(a.key);
    const { data: auth } = await supabase.auth.getUser();
    const adminId = auth.user?.id ?? null;
    const ticketId = `AUDIT-${a.kind.toUpperCase().slice(0, 3)}-${(a.user_id ?? "anon").slice(0, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error } = await supabase.from("support_logs").insert([
      {
        user_id: adminId,
        source: `admin_audit:${a.kind}`,
        ticket_id: ticketId,
        error_code: a.kind,
        error_message: `Premium audit anomaly: ${a.kind}`,
        last_state: JSON.stringify(a.raw).slice(0, 500),
        url: typeof window !== "undefined" ? window.location.href : null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        metadata: {
          kind: a.kind,
          ticket_id: ticketId,
          target_user_id: a.user_id,
          payment_id: a.payment_id,
          is_premium: a.is_premium,
          log_status: a.log_status,
          timestamps: { event_at: a.timestamp, audited_at: data?.generated_at ?? null },
          snapshot: a.raw,
          logged_by_admin: adminId,
          logged_at: new Date().toISOString(),
        } as any,
      },
    ]);
    setLogging(null);
    if (error) {
      toast.error(`Diagnostic non enregistré: ${error.message}`);
      return;
    }
    setLoggedKeys((prev) => new Set(prev).add(a.key));
    toast.success(`Diagnostic enregistré (${ticketId})`);
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
            <ShieldCheck className="h-6 w-6 text-primary" />
            Incohérences premium
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue unifiée des anomalies détectées entre paiements, log d'activation et statut premium.
          </p>
          {data && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {criticalCount === 0 ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Tout est cohérent
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> {criticalCount} critique(s)
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Audit du {fmtDate(data.generated_at)} · {allAnomalies.length} entrée(s)
              </span>
            </div>
          )}
        </div>
        <Button onClick={runAudit} disabled={loading} variant="outline">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyse…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" /> Relancer l'audit
            </>
          )}
        </Button>
      </header>

      {/* Compteurs par type */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => { setKindFilter("paid_no_premium"); setPage(0); }}
            className={`text-left rounded-lg border p-4 transition hover:bg-muted ${kindFilter === "paid_no_premium" ? "ring-2 ring-primary" : ""}`}
          >
            <div className="text-xs text-muted-foreground">Paiement sans premium</div>
            <div className="text-2xl font-semibold mt-1">{counts.paid_no_premium}</div>
          </button>
          <button
            onClick={() => { setKindFilter("premium_no_log"); setPage(0); }}
            className={`text-left rounded-lg border p-4 transition hover:bg-muted ${kindFilter === "premium_no_log" ? "ring-2 ring-primary" : ""}`}
          >
            <div className="text-xs text-muted-foreground">Premium sans log</div>
            <div className="text-2xl font-semibold mt-1">{counts.premium_no_log}</div>
          </button>
          <button
            onClick={() => { setKindFilter("already_active"); setPage(0); }}
            className={`text-left rounded-lg border p-4 transition hover:bg-muted ${kindFilter === "already_active" ? "ring-2 ring-primary" : ""}`}
          >
            <div className="text-xs text-muted-foreground">Déjà active</div>
            <div className="text-2xl font-semibold mt-1">{counts.already_active}</div>
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Type d'erreur</label>
          <Select value={kindFilter} onValueChange={(v) => { setKindFilter(v as any); setPage(0); }}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="paid_no_premium">Paiement sans premium</SelectItem>
              <SelectItem value="premium_no_log">Premium sans log</SelectItem>
              <SelectItem value="already_active">Déjà active</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground">Recherche (email, user_id, payment_id)</label>
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="ex: alice@…  ou  tr_xxx"
          />
        </div>
        {(kindFilter !== "all" || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setKindFilter("all"); setSearch(""); setPage(0); }}>
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
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Payment ID</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Chargement…
                </TableCell>
              </TableRow>
            )}
            {!loading && pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Aucune incohérence pour ces filtres.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((a) => {
              const done = loggedKeys.has(a.key);
              return (
                <TableRow key={a.key}>
                  <TableCell>
                    <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "outline"}>
                      {KIND_LABEL[a.kind]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{a.email ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{shortId(a.user_id)}</TableCell>
                  <TableCell className="font-mono text-xs">{a.payment_id ?? "—"}</TableCell>
                  <TableCell>{fmtAmount(a.amount)}</TableCell>
                  <TableCell>
                    {a.is_premium === null ? "—" : a.is_premium ? "Oui" : "Non"}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{fmtDate(a.timestamp)}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm" title={a.message ?? ""}>
                    {a.message ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={done ? "secondary" : "outline"}
                      disabled={done || logging === a.key}
                      onClick={() => logOne(a)}
                    >
                      {logging === a.key ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : done ? (
                        <ClipboardCheck className="h-3 w-3" />
                      ) : (
                        "Diagnostic"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
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
            <Button variant="outline" size="sm" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              Précédent
            </Button>
            <span className="px-3 py-1.5 text-muted-foreground">
              Page {safePage + 1} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
              Suivant
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default PremiumAuditList;
