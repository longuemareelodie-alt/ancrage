import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

const PremiumAuditPanel = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("get_premium_audit");
    if (error) {
      setError(error.message);
      setData(null);
    } else {
      setData(data as unknown as AuditResult);
    }
    setLoading(false);
  };

  const totalAnomalies = data
    ? data.paid_without_premium.length +
      data.premium_without_paid_log.length +
      data.already_active.length
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
            <p className="text-xs text-muted-foreground mt-2">
              {t("admin.audit.generated_at", { date: fmtDate(data.generated_at) })}
              {" · "}
              <Badge variant={totalAnomalies > 0 ? "destructive" : "default"}>
                {totalAnomalies}
              </Badge>
            </p>
          )}
        </div>
        <Button onClick={runAudit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("admin.audit.running")}
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("admin.audit.run")}
            </>
          )}
        </Button>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.paid_without_premium.map((r) => (
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
                      </TableRow>
                    ))}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.premium_without_paid_log.map((r) => (
                      <TableRow key={r.user_id}>
                        <TableCell className="text-sm">{r.email ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{shortId(r.user_id)}</TableCell>
                        <TableCell>{r.plan_type ?? "—"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.profile_updated_at)}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{fmtDate(r.profile_created_at)}</TableCell>
                      </TableRow>
                    ))}
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
