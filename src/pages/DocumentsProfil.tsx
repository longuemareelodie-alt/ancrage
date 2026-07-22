import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, FileText, Upload, Star, StarOff, Search, Trash2, Eye,
  AlertTriangle, Calendar, Stethoscope, Filter, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Profile { id: string; first_name: string; relation: string }

interface Doc {
  id: string;
  profile_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  doc_type: string;
  issued_date: string | null;
  expiry_date: string | null;
  doctor_name: string | null;
  notes: string | null;
  is_favorite: boolean;
}

const DOC_TYPES: { value: string; label: string; emoji: string }[] = [
  { value: "ordonnance", label: "Ordonnance", emoji: "💊" },
  { value: "analyse", label: "Analyse / Biologie", emoji: "🧪" },
  { value: "imagerie", label: "Imagerie", emoji: "🩻" },
  { value: "certificat", label: "Certificat médical", emoji: "📜" },
  { value: "compte_rendu", label: "Compte-rendu", emoji: "📝" },
  { value: "carte", label: "Carte / Attestation", emoji: "🪪" },
  { value: "autre", label: "Autre", emoji: "📄" },
];

const typeLabel = (v: string) => DOC_TYPES.find((t) => t.value === v) ?? DOC_TYPES[DOC_TYPES.length - 1];

export default function DocumentsProfil() {
  const { profileId } = useParams<{ profileId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const load = async () => {
    if (!user || !profileId) return;
    setLoading(true);
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("family_medical_profiles").select("id,first_name,relation").eq("id", profileId).maybeSingle(),
      supabase.from("family_medical_documents").select("*").eq("user_id", user.id).eq("profile_id", profileId).order("created_at", { ascending: false }),
    ]);
    setProfile((p as Profile) || null);
    setDocs((d as Doc[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user, profileId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => filterType === "all" || d.doc_type === filterType)
      .filter((d) =>
        !q ||
        d.file_name.toLowerCase().includes(q) ||
        (d.doctor_name || "").toLowerCase().includes(q) ||
        (d.notes || "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      });
  }, [docs, query, filterType]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return docs
      .filter((d) => d.expiry_date)
      .map((d) => ({ doc: d, days: differenceInDays(parseISO(d.expiry_date!), today) }))
      .filter((x) => x.days <= 30)
      .sort((a, b) => a.days - b.days);
  }, [docs]);

  const openPreview = async (doc: Doc) => {
    setPreviewDoc(doc);
    setPreviewUrl(null);
    const { data, error } = await supabase.storage.from("family-medical-docs").createSignedUrl(doc.storage_path, 300);
    if (error) { toast.error("Impossible d'ouvrir le document"); return; }
    setPreviewUrl(data.signedUrl);
  };

  const downloadDoc = async (doc: Doc) => {
    const { data, error } = await supabase.storage.from("family-medical-docs").createSignedUrl(doc.storage_path, 300, { download: doc.file_name });
    if (error) { toast.error("Erreur"); return; }
    window.open(data.signedUrl, "_blank");
  };

  const toggleFav = async (doc: Doc) => {
    const { error } = await supabase.from("family_medical_documents").update({ is_favorite: !doc.is_favorite }).eq("id", doc.id);
    if (error) { toast.error("Erreur"); return; }
    setDocs((d) => d.map((x) => (x.id === doc.id ? { ...x, is_favorite: !x.is_favorite } : x)));
  };

  const removeDoc = async (doc: Doc) => {
    if (!confirm(`Supprimer « ${doc.file_name} » ?`)) return;
    await supabase.storage.from("family-medical-docs").remove([doc.storage_path]);
    const { error } = await supabase.from("family_medical_documents").delete().eq("id", doc.id);
    if (error) { toast.error("Erreur"); return; }
    setDocs((d) => d.filter((x) => x.id !== doc.id));
    toast.success("Document supprimé");
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 pt-20 pb-32 max-w-4xl">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/famille"><ArrowLeft className="h-4 w-4 mr-1" /> Famille</Link>
        </Button>
      </div>

      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Documents & Ordonnances
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile ? `${profile.first_name} — ${profile.relation}` : "Chargement…"}
        </p>
      </motion.header>

      {expiringSoon.length > 0 && (
        <Card className="mb-4 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  {expiringSoon.length} document{expiringSoon.length > 1 ? "s" : ""} expire{expiringSoon.length > 1 ? "nt" : ""} bientôt
                </p>
                <div className="mt-2 space-y-1">
                  {expiringSoon.slice(0, 3).map(({ doc, days }) => (
                    <button key={doc.id} onClick={() => openPreview(doc)} className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200 hover:underline">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="truncate">{doc.file_name}</span>
                      <span className="text-xs">— {days < 0 ? `expiré il y a ${-days}j` : days === 0 ? "expire aujourd'hui" : `dans ${days}j`}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher (nom, médecin, notes)…" className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="sm:w-52"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4 mr-1" /> Ajouter</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Aucun document pour l'instant.</p>
          <Button className="mt-4" onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4 mr-1" /> Ajouter un document</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((d) => {
            const t = typeLabel(d.doc_type);
            const expDays = d.expiry_date ? differenceInDays(parseISO(d.expiry_date), new Date()) : null;
            return (
              <Card key={d.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl leading-none">{t.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPreview(d)} className="font-medium truncate hover:underline text-left">{d.file_name}</button>
                        {d.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 flex-shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">{t.label}</Badge>
                        {d.doctor_name && <Badge variant="outline" className="text-xs"><Stethoscope className="h-3 w-3 mr-1" />{d.doctor_name}</Badge>}
                        {d.issued_date && <Badge variant="outline" className="text-xs"><Calendar className="h-3 w-3 mr-1" />{format(parseISO(d.issued_date), "d MMM yyyy", { locale: fr })}</Badge>}
                        {expDays !== null && (
                          <Badge className={`text-xs ${expDays < 0 ? "bg-rose-100 text-rose-800" : expDays <= 30 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {expDays < 0 ? `expiré` : `expire ${format(parseISO(d.expiry_date!), "d MMM yyyy", { locale: fr })}`}
                          </Badge>
                        )}
                      </div>
                      {d.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{d.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => toggleFav(d)}>
                      {d.is_favorite ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(d)}>Modifier</Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadDoc(d)}><Download className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openPreview(d)}><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => removeDoc(d)} className="text-rose-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        userId={user.id}
        profileId={profileId!}
        onSaved={load}
      />

      <EditDialog
        doc={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      <Dialog open={!!previewDoc} onOpenChange={(o) => !o && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
          <DialogHeader><DialogTitle className="truncate">{previewDoc?.file_name}</DialogTitle></DialogHeader>
          <div className="flex-1 min-h-0 rounded overflow-hidden bg-muted">
            {previewUrl ? (
              previewDoc?.mime_type?.startsWith("image/")
                ? <img src={previewUrl} alt="" className="w-full h-full object-contain" />
                : <iframe src={previewUrl} className="w-full h-full" title="preview" />
            ) : <div className="flex items-center justify-center h-full text-muted-foreground">Chargement…</div>}
          </div>
          <DialogFooter>
            {previewDoc && <Button variant="outline" onClick={() => downloadDoc(previewDoc)}><Download className="h-4 w-4 mr-1" /> Télécharger</Button>}
            <Button onClick={() => setPreviewDoc(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadDialog({ open, onClose, userId, profileId, onSaved }: { open: boolean; onClose: () => void; userId: string; profileId: string; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("ordonnance");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setFile(null); setDocType("ordonnance"); setIssuedDate(""); setExpiryDate(""); setDoctorName(""); setNotes(""); };

  const submit = async () => {
    if (!file) { toast.error("Choisis un fichier"); return; }
    setSaving(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/${profileId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("family-medical-docs").upload(path, file, { contentType: file.type });
    if (upErr) { toast.error("Échec de l'upload"); setSaving(false); return; }
    const { error } = await supabase.from("family_medical_documents").insert({
      user_id: userId, profile_id: profileId, file_name: file.name,
      storage_path: path, mime_type: file.type || "application/octet-stream", size_bytes: file.size,
      doc_type: docType,
      issued_date: issuedDate || null,
      expiry_date: expiryDate || null,
      doctor_name: doctorName || null,
      notes: notes || null,
      category: docType,
    });
    if (error) { toast.error("Erreur enregistrement"); setSaving(false); return; }
    toast.success("Document ajouté");
    reset(); setSaving(false); onClose(); onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Fichier (PDF ou image)</Label>
            <Input type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div><Label>Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Date d'émission</Label><Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} /></div>
            <div><Label>Date d'expiration</Label><Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></div>
          </div>
          <div><Label>Médecin / praticien</Label><Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Dupont" /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={submit} disabled={saving || !file}>{saving ? "Envoi…" : "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({ doc, onClose, onSaved }: { doc: Doc | null; onClose: () => void; onSaved: () => void }) {
  const [docType, setDocType] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!doc) return;
    setDocType(doc.doc_type); setIssuedDate(doc.issued_date || "");
    setExpiryDate(doc.expiry_date || ""); setDoctorName(doc.doctor_name || "");
    setNotes(doc.notes || ""); setFileName(doc.file_name);
  }, [doc]);

  const save = async () => {
    if (!doc) return;
    const { error } = await supabase.from("family_medical_documents").update({
      file_name: fileName, doc_type: docType, issued_date: issuedDate || null,
      expiry_date: expiryDate || null, doctor_name: doctorName || null, notes: notes || null,
      category: docType,
    }).eq("id", doc.id);
    if (error) { toast.error("Erreur"); return; }
    toast.success("Enregistré"); onClose(); onSaved();
  };

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Modifier le document</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nom</Label><Input value={fileName} onChange={(e) => setFileName(e.target.value)} /></div>
          <div><Label>Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Date d'émission</Label><Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} /></div>
            <div><Label>Date d'expiration</Label><Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></div>
          </div>
          <div><Label>Médecin / praticien</Label><Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
