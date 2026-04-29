import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, Inbox, Loader2, MessageCircle, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PremiumAuditPanel from "@/components/admin/PremiumAuditPanel";
import SupportContactDialog from "@/components/SupportContactDialog";

interface LogEntry {
  id: string;
  user_id: string | null;
  payment_id: string | null;
  status: string;
  amount: number | null;
  source: string;
  message: string | null;
  created_at: string;
  total_count: number;
}

const STATUS_OPTIONS = [
  "all",
  "paid",
  "pending",
  "failed",
  "error",
  "user_not_found",
  "already_active",
];

const PAGE_SIZE = 25;

const statusVariant = (status: string) => {
  switch (status) {
    case "paid":
    case "already_active":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "error":
    case "user_not_found":
      return "destructive";
    default:
      return "outline";
  }
};

const PremiumActivationLog = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [logTicketId] = useState<string>(
    () => `ADMIN-LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentIdFilter, setPaymentIdFilter] = useState("");
  const [paymentIdInput, setPaymentIdInput] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("get_premium_activation_log", {
      _status: statusFilter === "all" ? null : statusFilter,
      _payment_id: paymentIdFilter.trim() || null,
      _from: fromDate ? fromDate.toISOString() : null,
      _to: toDate ? new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString() : null,
      _limit: PAGE_SIZE,
      _offset: page * PAGE_SIZE,
    });
    if (rpcError) {
      setError(rpcError.message);
      setRows([]);
      setTotal(0);
    } else {
      const list = (data ?? []) as LogEntry[];
      setRows(list);
      setTotal(list[0]?.total_count ?? 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, paymentIdFilter, fromDate, toDate]);

  const onSearch = () => {
    setPage(0);
    setPaymentIdFilter(paymentIdInput);
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setPaymentIdInput("");
    setPaymentIdFilter("");
    setFromDate(undefined);
    setToDate(undefined);
    setPage(0);
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 pb-32">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("admin.premium_log.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.premium_log.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" asChild>
            <a href="/admin/premium-audit">
              <AlertCircle className="h-4 w-4 mr-2" />
              Vue des incohérences
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/admin/webhook-anomalies">
              <AlertCircle className="h-4 w-4 mr-2" />
              Anomalies Webhook
            </a>
          </Button>
        </div>
      </header>

      <PremiumAuditPanel />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg border bg-card">
        <div className="space-y-2">
          <Label>{t("admin.premium_log.filter_status")}</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(0);
              setStatusFilter(v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? t("admin.premium_log.status_all") : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label>{t("admin.premium_log.filter_payment_id")}</Label>
          <div className="flex gap-2">
            <Input
              value={paymentIdInput}
              onChange={(e) => setPaymentIdInput(e.target.value)}
              placeholder="tr_..."
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <Button size="icon" variant="outline" onClick={onSearch} aria-label="search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("admin.premium_log.filter_from")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "PP") : <span>—</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(d) => {
                  setPage(0);
                  setFromDate(d);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>{t("admin.premium_log.filter_to")}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "PP") : <span>—</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(d) => {
                  setPage(0);
                  setToDate(d);
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:col-span-4 flex items-center justify-between">
          <Button variant="ghost" onClick={resetFilters}>
            {t("admin.premium_log.reset_filters")}
          </Button>
          <Button variant="outline" onClick={() => fetchData()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            {t("admin.premium_log.refresh")}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.premium_log.col_date")}</TableHead>
                <TableHead>{t("admin.premium_log.col_status")}</TableHead>
                <TableHead>{t("admin.premium_log.col_payment_id")}</TableHead>
                <TableHead>{t("admin.premium_log.col_user")}</TableHead>
                <TableHead>{t("admin.premium_log.col_amount")}</TableHead>
                <TableHead>{t("admin.premium_log.col_message")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin inline-block text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {t("admin.premium_log.error_title", "Impossible de charger le journal")}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t(
                            "admin.premium_log.error_hint",
                            "La récupération du journal a échoué. Vérifie ta connexion puis réessaie. Si le problème persiste, contacte le support.",
                          )}
                        </p>
                        <p className="text-[11px] font-mono text-destructive break-all">
                          {error}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" size="sm" onClick={() => fetchData()}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t("admin.premium_log.refresh")}
                        </Button>
                        <Button size="sm" onClick={() => setSupportOpen(true)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {t("admin.premium_log.contact_support", "Contacter le support")}
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {t("admin.premium_log.empty")}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t(
                            "admin.premium_log.empty_hint",
                            "Aucune activation premium n'a encore été enregistrée pour ces filtres. Modifie les filtres ou réessaie plus tard.",
                          )}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        {t("admin.premium_log.reset_filters")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.payment_id ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.user_id ? row.user_id.slice(0, 8) + "…" : "—"}
                  </TableCell>
                  <TableCell>{row.amount != null ? `${(row.amount / 100).toFixed(2)} €` : "—"}</TableCell>
                  <TableCell className="max-w-xs truncate" title={row.message ?? ""}>
                    {row.message ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            {t("admin.premium_log.pagination", {
              from: total === 0 ? 0 : page * PAGE_SIZE + 1,
              to: Math.min((page + 1) * PAGE_SIZE, total),
              total,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("admin.premium_log.prev")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("admin.premium_log.next")}
            </Button>
          </div>
        </div>
      </section>

      <SupportContactDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        context={t(
          "admin.premium_log.support_subject",
          "Erreur d'accès au journal d'activations premium",
        )}
        ticketId={logTicketId}
        diagnostics={[
          `Source : admin/PremiumActivationLog`,
          `Ticket : ${logTicketId}`,
          `Filtre statut : ${statusFilter}`,
          `Filtre payment_id : ${paymentIdFilter || "—"}`,
          `Plage : ${fromDate ? format(fromDate, "yyyy-MM-dd") : "—"} → ${toDate ? format(toDate, "yyyy-MM-dd") : "—"}`,
          `Erreur : ${error ?? "—"}`,
          `URL : ${typeof window !== "undefined" ? window.location.href : "—"}`,
        ].join("\n")}
      />
    </main>
  );
};

export default PremiumActivationLog;
