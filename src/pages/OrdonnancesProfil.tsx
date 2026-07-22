import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pill, Calendar, CheckCircle2, Clock, AlertTriangle, Eye, Stethoscope, FileText, Download, Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Profile { id: string; first_name: string; relation: string }
interface Ordonnance {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  created_at: string;
  issued_date: string | null;
  expiry_date: string | null;
  doctor_name: string | null;
  notes: string | null;
}

type Status = "en_cours" | "termine" | "bientot";

const getStatus = (o: Ordonnance): Status => {
  if (!o.expiry_date) return "en_cours";
  const days = differenceInDays(parseISO(o.expiry_date), new Date());
  if (days < 0) return "termine";
  if (days <= 14) return "bientot";
  return "en_cours";
};

const STATUS_META: Record<Status, { label: string; icon: any; className: string }> = {
  en_cours: { label: "En cours", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  bientot: { label: "Renouvellement proche", icon: Clock, className: "bg-amber-100 text-amber-800 border-amber-200" },
  termine: { label: "Terminée", icon: AlertTriangle, className: "bg-rose-100 text-rose-800 border-rose-200" },
};

export default function OrdonnancesProfil() {
  const { profileId } = useParams<{ profileId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<Ordonnance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [preview, setPreview] = useState<{ url: string; mime: string; name: string } | null>(null);
  const [shareFor, setShareFor] = useState<Ordonnance | null>(null);
  const [shareDuration, setShareDuration] = useState<string>("3600");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareExpiresAt, setShareExpiresAt] = useState<Date | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!user || !profileId) return;
    setLoading(true);
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("family_medical_profiles").select("id,first_name,relation").eq("id", profileId).maybeSingle(),
      supabase
        .from("family_medical_documents")
        .select("id,file_name,storage_path,mime_type,created_at,issued_date,expiry_date,doctor_name,notes")
        .eq("user_id", user.id)
        .eq("profile_id", profileId)
        .eq("doc_type", "ordonnance")
        .order("issued_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);
    setProfile((p as Profile) || null);
    setItems((d as Ordonnance[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, profileId]);

  const counts = useMemo(() => {
    const c = { all: items.length, en_cours: 0, bientot: 0, termine: 0 };
    items.forEach((i) => { c[getStatus(i)] += 1; });
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => getStatus(i) === filter)),
    [items, filter]
  );

  const openPreview = async (o: Ordonnance) => {
    const { data, error } = await supabase.storage
      .from("family-medical-docs")
      .createSignedUrl(o.storage_path, 300);
    if (error || !data?.signedUrl) {
      toast.error("Impossible d'ouvrir le document");
      return;
    }
    setPreview({ url: data.signedUrl, mime: o.mime_type, name: o.file_name });
  };

  const downloadFile = async (o: Ordonnance) => {
    const { data, error } = await supabase.storage
      .from("family-medical-docs")
      .createSignedUrl(o.storage_path, 60, { download: o.file_name });
    if (error || !data?.signedUrl) {
      toast.error("Téléchargement impossible");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = o.file_name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const openShare = (o: Ordonnance) => {
    setShareFor(o);
    setShareUrl(null);
    setShareExpiresAt(null);
    setShareDuration("3600");
    setCopied(false);
  };

  const generateShareLink = async () => {
    if (!shareFor) return;
    setShareLoading(true);
    const seconds = parseInt(shareDuration, 10);
    const { data, error } = await supabase.storage
      .from("family-medical-docs")
      .createSignedUrl(shareFor.storage_path, seconds);
    setShareLoading(false);
    if (error || !data?.signedUrl) {
      toast.error("Impossible de générer le lien de partage");
      return;
    }
    setShareUrl(data.signedUrl);
    setShareExpiresAt(new Date(Date.now() + seconds * 1000));
    toast.success("Lien de partage généré");
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Lien copié");
    } catch {
      toast.error("Copie impossible");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/famille" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Famille
          </Link>
          <div className="flex gap-2">
            <Link to={`/famille/${profileId}/carnet`}>
              <Button variant="ghost" size="sm"><Stethoscope className="h-4 w-4 mr-1" />Carnet</Button>
            </Link>
            <Link to={`/famille/${profileId}/documents`}>
              <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-1" />Documents</Button>
            </Link>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" /> Ordonnances
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile ? `${profile.first_name} — ${profile.relation}` : "…"} · Historique chronologique des traitements.
          </p>
        </motion.div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["all", "en_cours", "bientot", "termine"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
              }`}
            >
              {k === "all" ? "Toutes" : STATUS_META[k].label} · {counts[k]}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="h-10 w-10 mx-auto text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Aucune ordonnance {filter !== "all" ? STATUS_META[filter as Status].label.toLowerCase() : ""}.
                </p>
                <Link to={`/famille/${profileId}/documents`}>
                  <Button variant="outline" size="sm" className="mt-4">Ajouter une ordonnance</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filtered.map((o, idx) => {
              const status = getStatus(o);
              const meta = STATUS_META[status];
              const Icon = meta.icon;
              const issued = o.issued_date ? format(parseISO(o.issued_date), "d MMM yyyy", { locale: fr }) : format(parseISO(o.created_at), "d MMM yyyy", { locale: fr });
              const renew = o.expiry_date ? format(parseISO(o.expiry_date), "d MMM yyyy", { locale: fr }) : null;
              const daysLeft = o.expiry_date ? differenceInDays(parseISO(o.expiry_date), new Date()) : null;
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Card className="relative overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full w-1 ${
                      status === "en_cours" ? "bg-emerald-400" : status === "bientot" ? "bg-amber-400" : "bg-rose-400"
                    }`} />
                    <CardContent className="p-4 pl-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium truncate">{o.file_name}</h3>
                            <Badge variant="outline" className={`text-[11px] ${meta.className}`}>
                              <Icon className="h-3 w-3 mr-1" />{meta.label}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Prescrite le {issued}</span>
                            {renew && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Renouvellement : {renew}
                                {daysLeft !== null && (
                                  <span className={`ml-1 ${daysLeft < 0 ? "text-rose-600" : daysLeft <= 14 ? "text-amber-600" : ""}`}>
                                    ({daysLeft < 0 ? `il y a ${-daysLeft}j` : daysLeft === 0 ? "aujourd'hui" : `dans ${daysLeft}j`})
                                  </span>
                                )}
                              </span>
                            )}
                            {o.doctor_name && <span>Dr {o.doctor_name}</span>}
                          </div>
                          {o.notes && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{o.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => openPreview(o)} title="Ouvrir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadFile(o)} title="Télécharger">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openShare(o)} title="Partager">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="truncate">{preview?.name}</DialogTitle></DialogHeader>
          {preview && (
            preview.mime.startsWith("image/") ? (
              <img src={preview.url} alt={preview.name} className="max-h-[70vh] w-full object-contain rounded" />
            ) : (
              <iframe src={preview.url} title={preview.name} className="w-full h-[70vh] rounded border" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
