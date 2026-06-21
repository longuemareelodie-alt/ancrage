import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, CheckCircle2, RefreshCw, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Batch {
  sepa_batch_id: string;
  payout_count: number;
  total_cents: number;
  status_min: string;
  status_max: string;
  sepa_xml_path: string | null;
  scheduled_for: string | null;
  created_at: string;
  paid_at: string | null;
}

interface Payout {
  id: string;
  ambassador_user_id: string;
  email: string | null;
  iban_holder_name: string | null;
  iban_last4: string | null;
  amount_cents: number;
  referral_count: number;
  status: string;
  paid_at: string | null;
}

const fmtEuros = (c: number) => `${(c / 100).toFixed(2).replace(".", ",")} €`;

export default function AmbassadorPayouts() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openBatch, setOpenBatch] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_payout_batches_admin");
    if (error) toast.error("Erreur de chargement");
    else setBatches((data as unknown as Batch[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateNow = async () => {
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("generate-sepa-batch");
    setGenerating(false);
    if (error) { toast.error(error.message); return; }
    const res = data as any;
    if (res?.batch_id) {
      toast.success(`Lot ${res.batch_id} généré (${res.payout_count} virements)`);
    } else {
      toast.info(res?.message ?? "Aucun virement à générer");
    }
    load();
  };

  const openDetail = async (batchId: string) => {
    setOpenBatch(batchId);
    const { data, error } = await supabase.rpc("get_payout_batch_admin", { _batch_id: batchId });
    if (error) toast.error(error.message);
    else setPayouts((data as unknown as Payout[]) ?? []);
  };

  const markPaid = async (batchId: string) => {
    if (!confirm(`Confirmer que le virement SEPA a bien été uploadé sur CIC pour ${batchId} ?\n\nLes ambassadrices vont recevoir un email de confirmation.`)) return;
    setBusy(true);
    const { error } = await supabase.rpc("mark_payout_batch_paid_admin", { _batch_id: batchId });
    if (error) { toast.error(error.message); setBusy(false); return; }
    await supabase.functions.invoke("send-batch-payout-emails", { body: { batchId } });
    toast.success("Lot marqué comme payé, emails envoyés 📧");
    setBusy(false);
    setOpenBatch(null);
    load();
  };

  const statusBadge = (min: string, max: string) => {
    if (min === "paid" && max === "paid") return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
    if (min === "pending_upload") return <Badge variant="secondary">À uploader</Badge>;
    return <Badge variant="outline">{min} / {max}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif-display text-3xl text-primary-dark">Versements ambassadrices</h1>
            <p className="text-muted-foreground mt-1">Lots SEPA mensuels — upload manuel sur CIC.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button>
            <Button onClick={generateNow} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
              Générer un lot maintenant
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement…</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-2xl bg-card">
            Aucun lot pour le moment. Le premier sera généré automatiquement le 1er du mois.
          </div>
        ) : (
          <div className="rounded-2xl bg-card overflow-hidden shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Virements</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.sepa_batch_id}>
                    <TableCell className="font-mono text-xs">{b.sepa_batch_id}</TableCell>
                    <TableCell className="text-sm">{new Date(b.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{b.payout_count}</TableCell>
                    <TableCell className="font-semibold">{fmtEuros(b.total_cents)}</TableCell>
                    <TableCell>{statusBadge(b.status_min, b.status_max)}</TableCell>
                    <TableCell><Button variant="ghost" size="sm" onClick={() => openDetail(b.sepa_batch_id)}>Détails</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="rounded-2xl bg-secondary/20 p-5 text-sm text-foreground/80">
          <p className="font-medium mb-2">📋 Procédure mensuelle</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Tu reçois un email automatique avec le fichier XML à télécharger</li>
            <li>Tu te connectes sur CIC Entreprises → "Échanges de fichiers" → "Remise SEPA"</li>
            <li>Tu uploades le fichier XML et valides</li>
            <li>Tu reviens ici cliquer "Marquer comme payé" → les ambassadrices reçoivent leur email</li>
          </ol>
        </div>
      </div>

      <Dialog open={!!openBatch} onOpenChange={(o) => { if (!o) { setOpenBatch(null); setPayouts([]); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{openBatch}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ambassadrice</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Filleules</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">
                    <div>{p.iban_holder_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">····{p.iban_last4}</TableCell>
                  <TableCell>{p.referral_count}</TableCell>
                  <TableCell className="font-semibold">{fmtEuros(p.amount_cents)}</TableCell>
                  <TableCell>
                    {p.status === "paid"
                      ? <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Payé</Badge>
                      : <Badge variant="secondary">{p.status}</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {openBatch && payouts.some((p) => p.status !== "paid") && (
            <div className="flex justify-end pt-4">
              <Button onClick={() => markPaid(openBatch)} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Marquer comme payé & notifier les ambassadrices
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
