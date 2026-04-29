import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaidNoPremium {
  user_id: string;
  payment_id: string | null;
  amount: number | null;
  paid_at: string | null;
  is_premium: boolean | null;
  email: string | null;
}
interface PremiumNoLog {
  user_id: string;
  email: string | null;
  plan_type: string | null;
  profile_created_at: string | null;
  profile_updated_at: string | null;
}
interface AlreadyActive {
  id: string;
  user_id: string | null;
  payment_id: string | null;
  amount: number | null;
  message: string | null;
  created_at: string | null;
  email: string | null;
}
interface AuditResult {
  paid_without_premium: PaidNoPremium[];
  premium_without_paid_log: PremiumNoLog[];
  already_active: AlreadyActive[];
  generated_at: string;
}

const fmtAmount = (a: number | null) => (a != null ? `${(a / 100).toFixed(2)} €` : "—");
const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return format(dt, "yyyy-MM-dd HH:mm");
};
const shortId = (id: string | null) => (id ? id.slice(0, 8) + "…" : "—");

type AnomalyKind = "paid_no_premium" | "premium_no_log" | "already_active";

const buildTicketId = (kind: AnomalyKind, ref: string) => {
  const k = kind === "paid_no_premium" ? "PNP" : kind === "premium_no_log" ? "PNL" : "AAC";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUDIT-${k}-${ref.slice(0, 6).toUpperCase()}-${rand}`;
};

const PremiumAuditPanel = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoLog, setAutoLog] = useState(true);
  const [loggedKeys, setLoggedKeys] = useState<Set<string>>(new Set());
  const [logging, setLogging] = useState<string | null>(null);

  const logAnomaly = async (
    kind: AnomalyKind,
    key: string,
    payload: Record<string, unknown>,
    opts: { silent?: boolean } = {}
  ) => {
    if (loggedKeys.has(key)) return { skipped: true };
    setLogging(key);
    const { data: auth } = await supabase.auth.getUser();
    const adminId = auth.user?.id ?? null;
    const ticketId = buildTicketId(kind, key);
    const { error } = await supabase.from("support_logs").insert([{
      user_id: adminId,
      source: `admin_audit:${kind}`,
      ticket_id: ticketId,
      error_code: kind,
      error_message: `Premium audit anomaly: ${kind}`,
      last_state: JSON.stringify(payload).slice(0, 500),
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      metadata: {
        kind,
        ticket_id: ticketId,
        target_user_id: (payload.user_id as string | null) ?? null,
        payment_id: (payload.payment_id as string | null) ?? null,
        is_premium: (payload.is_premium as boolean | null) ?? null,
        log_status: (payload.log_status as string | null) ?? null,
        timestamps: (payload.timestamps as Record<string, string | null> | null) ?? null,
        snapshot: payload as Record<string, unknown>,
        logged_by_admin: adminId,
        logged_at: new Date().toISOString(),
      } as any,
    }]);
    setLogging(null);
    if (error) {
      if (!opts.silent) toast.error(`Diagnostic non enregistré: ${error.message}`);
      return { error };
    }
    setLoggedKeys((prev) => new Set(prev).add(key));
    if (!opts.silent) toast.success(`Diagnostic enregistré (${ticketId})`);
    return { ticketId };
  };

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setLoggedKeys(new Set());
    const { data: result, error } = await supabase.rpc("get_premium_audit");
    if (error) {
      setError(error.message);
      setData(null);
    } else {
      setData(result as unknown as AuditResult);
    }
    setLoading(false);
  };

  // Vérification automatique au montage
  useEffect(() => {
    runAudit();
  }, []);

  // Enregistrement automatique des diagnostics
  useEffect(() => {
    if (!data || !autoLog) return;
    (async () => {
      let count = 0;
      for (const r of data.paid_without_premium) {
        const key = `pnp:${r.user_id}:${r.payment_id ?? "none"}`;
        const res = await logAnomaly("paid_no_premium", key, {
          user_id: r.user_id,
          payment_id: r.payment_id,
          amount: r.amount,
          email: r.email,
          is_premium: r.is_premium,
          log_status: "paid",
          timestamps: { paid_at: r.paid_at, audited_at: data.generated_at },
        }, { silent: true });
        if ((res as any)?.ticketId) count++;
      }
      for (const r of data.premium_without_paid_log) {
        const key = `pnl:${r.user_id}`;
        const res = await logAnomaly("premium_no_log", key, {
          user_id: r.user_id,
          payment_id: null,
          email: r.email,
          plan_type: r.plan_type,
          is_premium: true,
          log_status: "missing",
          timestamps: {
            profile_created_at: r.profile_created_at,
            profile_updated_at: r.profile_updated_at,
            audited_at: data.generated_at,
          },
        }, { silent: true });
        if ((res as any)?.ticketId) count++;
      }
      for (const r of data.already_active) {
        const key = `aac:${r.id}`;
        const res = await logAnomaly("already_active", key, {
          user_id: r.user_id,
          payment_id: r.payment_id,
          amount: r.amount,
          email: r.email,
          message: r.message,
          log_status: "already_active",
          timestamps: { event_at: r.created_at, audited_at: data.generated_at },
        }, { silent: true });
        if ((res as any)?.ticketId) count++;
      }
      if (count > 0) toast.success(`${count} diagnostic(s) enregistré(s) automatiquement`);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, autoLog]);

  const criticalCount = data
    ? data.paid_without_premium.length + data.premium_without_paid_log.length
    : 0;
  const totalAnomalies = data
    ? criticalCount + data.already_active.length
    : 0;

  return (
    <section className="rounded-lg border bg-card p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t("admin.audit.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.audit.subtitle")}
          </p>
          {data && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {criticalCount === 0 ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("admin.audit.status_healthy", "Tout est cohérent")}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t("admin.audit.status_anomalies", { count: criticalCount, defaultValue: "{{count}} incohérence(s) critique(s)" })}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {t("admin.audit.generated_at", { date: fmtDate(data.generated_at) })}
                {" · "}
                {t("admin.audit.total", { count: totalAnomalies, defaultValue: "{{count}} entrée(s) au total" })}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={runAudit} disabled={loading} variant="outline">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("admin.audit.running")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("admin.audit.run")}
              </>
            )}
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Switch checked={autoLog} onCheckedChange={setAutoLog} />
            <span>Journaliser automatiquement chaque alerte</span>
          </label>
          {loggedKeys.size > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ClipboardCheck className="h-3 w-3" />
              {loggedKeys.size} diagnostic(s) enregistré(s)
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {data && (
        <div className="space-y-6">
          {/* Section 1 */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {t("admin.audit.section_paid_no_premium")}
              <Badge variant={data.paid_without_premium.length ? "destructive" : "outline"}>
                {data.paid_without_premium.length}
              </Badge>
            </h3>
            {data.paid_without_premium.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.audit.empty")}</p>
            ) : (
              <div className="overflow-x-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.audit.col_email")}</TableHead>
                      <TableHead>{t("admin.audit.col_user")}</TableHead>
                      <TableHead>{t("admin.audit.col_payment_id")}</TableHead>
                      <TableHead>{t("admin.audit.col_amount")}</TableHead>
                      <TableHead>{t("admin.audit.col_paid_at")}</TableHead>
                      <TableHead>{t("admin.audit.col_is_premium")}</TableHead>
                      <TableHead className="text-right">Diagnostic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.paid_without_premium.map((r) => {
                      const key = `pnp:${r.user_id}:${r.payment_id ?? "none"}`;
                      const done = loggedKeys.has(key);
                      return (
                      <TableRow key={r.user_id + r.paid_at}>
                        <TableCell className="text-sm">{r.email ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
                        <TableCell className="font-mono text-xs">{r.payment_id ?? "—"}</TableCell>
                        <TableCell>{fmtAmount(r.amount)}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.paid_at)}</TableCell>
                        <TableCell>
                          {r.is_premium === null
                            ? "—"
                            : r.is_premium
                              ? t("admin.audit.yes")
                              : t("admin.audit.no")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant={done ? "secondary" : "outline"} disabled={done || logging === key}
                            onClick={() => logAnomaly("paid_no_premium", key, {
                              user_id: r.user_id, payment_id: r.payment_id, amount: r.amount, email: r.email,
                              is_premium: r.is_premium, log_status: "paid",
                              timestamps: { paid_at: r.paid_at, audited_at: data.generated_at },
                            })}>
                            {logging === key ? <Loader2 className="h-3 w-3 animate-spin" /> : done ? <ClipboardCheck className="h-3 w-3" /> : "Enregistrer"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );})}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {t("admin.audit.section_premium_no_log")}
              <Badge variant={data.premium_without_paid_log.length ? "destructive" : "outline"}>
                {data.premium_without_paid_log.length}
              </Badge>
            </h3>
            {data.premium_without_paid_log.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.audit.empty")}</p>
            ) : (
              <div className="overflow-x-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.audit.col_email")}</TableHead>
                      <TableHead>{t("admin.audit.col_user")}</TableHead>
                      <TableHead>{t("admin.audit.col_plan")}</TableHead>
                      <TableHead>{t("admin.audit.col_updated_at")}</TableHead>
                      <TableHead>{t("admin.audit.col_created_at")}</TableHead>
                      <TableHead className="text-right">Diagnostic</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.premium_without_paid_log.map((r) => {
                      const key = `pnl:${r.user_id}`;
                      const done = loggedKeys.has(key);
                      return (
                      <TableRow key={r.user_id}>
                        <TableCell className="text-sm">{r.email ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
                        <TableCell>{r.plan_type ?? "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.profile_updated_at)}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.profile_created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant={done ? "secondary" : "outline"} disabled={done || logging === key}
                            onClick={() => logAnomaly("premium_no_log", key, {
                              user_id: r.user_id, payment_id: null, email: r.email, plan_type: r.plan_type,
                              is_premium: true, log_status: "missing",
                              timestamps: { profile_created_at: r.profile_created_at, profile_updated_at: r.profile_updated_at, audited_at: data.generated_at },
                            })}>
                            {logging === key ? <Loader2 className="h-3 w-3 animate-spin" /> : done ? <ClipboardCheck className="h-3 w-3" /> : "Enregistrer"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );})}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {t("admin.audit.section_already_active")}
              <Badge variant={data.already_active.length ? "secondary" : "outline"}>
                {data.already_active.length}
              </Badge>
            </h3>
            {data.already_active.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("admin.audit.empty")}</p>
            ) : (
              <div className="overflow-x-auto rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.audit.col_created_at")}</TableHead>
                      <TableHead>{t("admin.audit.col_email")}</TableHead>
                      <TableHead>{t("admin.audit.col_user")}</TableHead>
                      <TableHead>{t("admin.audit.col_payment_id")}</TableHead>
                      <TableHead>{t("admin.audit.col_amount")}</TableHead>
                      <TableHead>{t("admin.audit.col_message")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.already_active.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.created_at)}</TableCell>
                        <TableCell className="text-sm">{r.email ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
                        <TableCell className="font-mono text-xs">{r.payment_id ?? "—"}</TableCell>
                        <TableCell>{fmtAmount(r.amount)}</TableCell>
                        <TableCell className="max-w-xs truncate" title={r.message ?? ""}>
                          {r.message ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PremiumAuditPanel;
