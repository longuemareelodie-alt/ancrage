import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderLock, Upload, Search, FileText, Image as ImageIcon, Download, Trash2,
  FolderPlus, Star, StarOff, AlertCircle, Lock, Plus, Eye, EyeOff, Pencil, KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

/** Catégories enrichies avec regroupements et mots-clés d'auto-classement. */
const CATEGORIES = [
  // FINANCES (nouveau — cœur du Coffre Premium)
  { name: "Banque", emoji: "🏦", group: "Finances", keywords: ["releve", "relevé", "banque", "bancaire", "bic", "iban", "rib"] },
  { name: "Impôts", emoji: "📊", group: "Finances", keywords: ["impot", "impôt", "fisc", "avis", "declaration", "déclaration", "urssaf"] },
  { name: "Salaires", emoji: "💼", group: "Finances", keywords: ["bulletin", "paie", "salaire", "fiche-de-paie"] },
  { name: "Factures", emoji: "🧾", group: "Finances", keywords: ["facture", "invoice", "quittance", "edf", "engie", "eau", "gaz"] },
  { name: "Assurances", emoji: "🛡️", group: "Finances", keywords: ["assurance", "mutuelle", "maif", "macif", "matmut", "attestation"] },
  { name: "Crédits & Prêts", emoji: "💳", group: "Finances", keywords: ["credit", "crédit", "pret", "prêt", "emprunt", "tableau-amortissement"] },
  { name: "Épargne", emoji: "🌱", group: "Finances", keywords: ["epargne", "épargne", "livret", "pel", "cel", "assurance-vie", "pea"] },
  { name: "Contrats", emoji: "📄", group: "Finances", keywords: ["contrat", "bail", "abonnement"] },
  { name: "Garanties", emoji: "📜", group: "Finances", keywords: ["garantie", "achat", "ticket", "sav"] },
  // VIE COURANTE
  { name: "Santé", emoji: "❤️", group: "Vie", keywords: ["ordonnance", "medic", "sante", "hopital", "medecin", "vaccin", "radio", "carte-vitale"] },
  { name: "CAF", emoji: "🏛️", group: "Vie", keywords: ["caf", "allocation", "cnaf", "apl"] },
  { name: "École", emoji: "🎓", group: "Vie", keywords: ["ecole", "école", "college", "lycee", "scolaire", "bulletin-scolaire", "inscription"] },
  { name: "Logement", emoji: "🏠", group: "Vie", keywords: ["loyer", "quittance-loyer", "edl", "syndic"] },
  { name: "Identité", emoji: "🪪", group: "Vie", keywords: ["identite", "identité", "passeport", "permis", "carte-identite"] },
  { name: "Personnel", emoji: "👤", group: "Vie", keywords: [] },
];

const SECURE_NOTE_CATEGORIES = [
  { name: "Banque", emoji: "🏦" },
  { name: "IBAN & RIB", emoji: "🏛️" },
  { name: "Cartes bancaires", emoji: "💳" },
  { name: "Codes & PIN", emoji: "🔐" },
  { name: "Contrats", emoji: "📄" },
  { name: "Abonnements", emoji: "📺" },
  { name: "Assurances", emoji: "🛡️" },
  { name: "Mots de passe", emoji: "🗝️" },
  { name: "Autre", emoji: "📝" },
];

interface Doc {
  id: string;
  name: string;
  category: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  created_at: string;
  is_favorite: boolean;
  notes: string | null;
  expiry_date: string | null;
  amount_cents: number | null;
  tags: string[];
}

interface SecureNote {
  id: string;
  title: string;
  category: string;
  content: string;
  is_favorite: boolean;
  updated_at: string;
}

interface Folder {
  id: string;
  name: string;
}

const autoCategorize = (filename: string): string => {
  const f = filename.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((k) => f.includes(k))) return cat.name;
  }
  return "Personnel";
};

const emojiFor = (name: string) =>
  CATEGORIES.find((c) => c.name === name)?.emoji ?? "📁";

const formatSize = (b?: number | null) => {
  if (!b) return "";
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
};

const eur = (cents?: number | null) =>
  cents == null
    ? null
    : (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export default function Coffre() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [editNote, setEditNote] = useState<SecureNote | null>(null);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: d }, { data: n }, { data: f }] = await Promise.all([
      supabase.from("vault_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("vault_secure_notes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("vault_folders").select("*").eq("user_id", user.id).order("name"),
    ]);
    setDocs((d as Doc[]) || []);
    setNotes((n as SecureNote[]) || []);
    setFolders((f as Folder[]) || []);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id]);

  const financeGroup = useMemo(() => CATEGORIES.filter((c) => c.group === "Finances"), []);
  const lifeGroup = useMemo(() => CATEGORIES.filter((c) => c.group === "Vie"), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (activeCat && d.category !== activeCat) return false;
      if (showFavoritesOnly && !d.is_favorite) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.notes ?? "").toLowerCase().includes(q) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [docs, search, activeCat, showFavoritesOnly]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    docs.forEach((d) => m.set(d.category, (m.get(d.category) || 0) + 1));
    return m;
  }, [docs]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    return docs
      .filter((d) => d.expiry_date)
      .map((d) => ({ doc: d, days: differenceInDays(new Date(d.expiry_date!), today) }))
      .filter((x) => x.days <= 30)
      .sort((a, b) => a.days - b.days);
  }, [docs]);

  const financeTotal = useMemo(
    () =>
      docs
        .filter((d) => financeGroup.some((c) => c.name === d.category) && d.amount_cents)
        .reduce((s, d) => s + (d.amount_cents || 0), 0),
    [docs, financeGroup]
  );

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const category = autoCategorize(file.name);
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("vault-documents").upload(path, file, {
          contentType: file.type || undefined,
        });
        if (upErr) { toast.error(`Erreur upload : ${upErr.message}`); continue; }
        const { error: dbErr } = await supabase.from("vault_documents").insert({
          user_id: user.id,
          name: file.name,
          category,
          mime_type: file.type,
          size_bytes: file.size,
          storage_path: path,
        });
        if (dbErr) toast.error(`Erreur : ${dbErr.message}`);
      }
      toast.success("Document(s) importé(s)");
      load();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openDoc = async (doc: Doc) => {
    const { data, error } = await supabase.storage.from("vault-documents").createSignedUrl(doc.storage_path, 300);
    if (error || !data) return toast.error("Impossible d'ouvrir le fichier");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  const deleteDoc = async (doc: Doc) => {
    if (!confirm(`Supprimer "${doc.name}" ?`)) return;
    await supabase.storage.from("vault-documents").remove([doc.storage_path]);
    await supabase.from("vault_documents").delete().eq("id", doc.id);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    toast.success("Supprimé");
  };

  const toggleFav = async (doc: Doc) => {
    const next = !doc.is_favorite;
    await supabase.from("vault_documents").update({ is_favorite: next }).eq("id", doc.id);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, is_favorite: next } : d)));
  };

  const createFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    const { error } = await supabase.from("vault_folders").insert({ user_id: user.id, name: newFolderName.trim() });
    if (error) return toast.error(error.message);
    setNewFolderName("");
    setNewFolderOpen(false);
    load();
    toast.success("Dossier créé");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <FolderLock className="h-8 w-8 text-primary" />
            Coffre-fort
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tes documents et données sensibles — finances, contrats, codes — retrouvables en un instant.
          </p>
        </motion.header>

        {/* Alertes expiration */}
        {expiringSoon.length > 0 && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {expiringSoon.length} document{expiringSoon.length > 1 ? "s" : ""} arrive{expiringSoon.length > 1 ? "nt" : ""} à échéance
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {expiringSoon.slice(0, 3).map((x) =>
                  `${x.doc.name} (${x.days < 0 ? `à renouveler depuis ${Math.abs(x.days)}j` : `dans ${x.days}j`})`
                ).join(" · ")}
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" /> Documents
            </TabsTrigger>
            <TabsTrigger value="secure">
              <Lock className="h-4 w-4 mr-2" /> Notes sécurisées
            </TabsTrigger>
          </TabsList>

          {/* ================= DOCUMENTS ================= */}
          <TabsContent value="documents" className="space-y-4">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1 sm:flex-initial">
                <Upload className="h-4 w-4 mr-2" /> {uploading ? "Import…" : "Importer"}
              </Button>
              <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" /> Dossier
              </Button>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly((v) => !v)}
              >
                <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} /> Favoris
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher (nom, note, tag)…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            {/* Total montants finances */}
            {financeTotal > 0 && (
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Montant total documents finances</p>
                    <p className="font-playfair text-2xl font-semibold">{eur(financeTotal)}</p>
                  </div>
                  <FolderLock className="h-8 w-8 text-primary/40" />
                </CardContent>
              </Card>
            )}

            {/* Groupes de catégories */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">💰 Finances</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                <CategoryTile emoji="📄" name="Tout" count={docs.length} active={activeCat === null} onClick={() => setActiveCat(null)} />
                {financeGroup.map((c) => (
                  <CategoryTile
                    key={c.name} emoji={c.emoji} name={c.name}
                    count={counts.get(c.name) || 0}
                    active={activeCat === c.name}
                    onClick={() => setActiveCat(c.name)}
                  />
                ))}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">🏡 Vie courante</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {lifeGroup.map((c) => (
                  <CategoryTile
                    key={c.name} emoji={c.emoji} name={c.name}
                    count={counts.get(c.name) || 0}
                    active={activeCat === c.name}
                    onClick={() => setActiveCat(c.name)}
                  />
                ))}
                {folders.map((f) => (
                  <CategoryTile
                    key={f.id} emoji="📁" name={f.name}
                    count={counts.get(f.name) || 0}
                    active={activeCat === f.name}
                    onClick={() => setActiveCat(f.name)}
                  />
                ))}
              </div>
            </div>

            {/* Liste documents */}
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  {docs.length === 0 ? (
                    <>
                      <FolderLock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Ton coffre-fort est vide.</p>
                      <p className="text-sm mt-1">Importe ton premier document pour commencer.</p>
                    </>
                  ) : (
                    <p>Aucun document ne correspond.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map((doc) => {
                  const daysLeft = doc.expiry_date ? differenceInDays(new Date(doc.expiry_date), new Date()) : null;
                  const expiryTone =
                    daysLeft === null ? ""
                      : daysLeft < 0 ? "text-rose-600"
                      : daysLeft <= 30 ? "text-amber-600"
                      : "text-muted-foreground";
                  return (
                    <Card key={doc.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg" aria-hidden>
                          {emojiFor(doc.category)}
                        </div>
                        <button onClick={() => openDoc(doc)} className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            {doc.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.category}
                            {doc.amount_cents != null && <> · <span className="font-medium">{eur(doc.amount_cents)}</span></>}
                            {" · "}{formatSize(doc.size_bytes)}
                            {" · "}{format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
                            {daysLeft !== null && (
                              <> · <span className={expiryTone}>
                                {daysLeft < 0 ? `Expiré (${Math.abs(daysLeft)}j)` : `Expire dans ${daysLeft}j`}
                              </span></>
                            )}
                          </p>
                        </button>
                        <Button size="icon" variant="ghost" onClick={() => toggleFav(doc)} title="Favori">
                          {doc.is_favorite
                            ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            : <StarOff className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditDoc(doc)} title="Détails"><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openDoc(doc)} title="Ouvrir"><Download className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteDoc(doc)} title="Supprimer"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ================= NOTES SÉCURISÉES ================= */}
          <TabsContent value="secure" className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
              <KeyRound className="h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold">Notes sécurisées</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stocke ici tes IBAN, numéros de contrats, codes clients, références abonnements. Contenu masqué par défaut, visible uniquement pour toi.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setNewNoteOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Nouvelle note
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une note…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            {notes.filter((n) =>
              !search.trim() ||
              n.title.toLowerCase().includes(search.toLowerCase()) ||
              n.category.toLowerCase().includes(search.toLowerCase())
            ).length === 0 ? (
              <Card><CardContent className="py-16 text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aucune note sécurisée.</p>
                <p className="text-sm mt-1">Ajoute ton premier IBAN, code ou contrat.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-2">
                {notes
                  .filter((n) =>
                    !search.trim() ||
                    n.title.toLowerCase().includes(search.toLowerCase()) ||
                    n.category.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((n) => (
                    <SecureNoteRow
                      key={n.id}
                      note={n}
                      onEdit={() => setEditNote(n)}
                      onDelete={async () => {
                        if (!confirm(`Supprimer "${n.title}" ?`)) return;
                        await supabase.from("vault_secure_notes").delete().eq("id", n.id);
                        setNotes((p) => p.filter((x) => x.id !== n.id));
                      }}
                      onToggleFav={async () => {
                        const next = !n.is_favorite;
                        await supabase.from("vault_secure_notes").update({ is_favorite: next }).eq("id", n.id);
                        setNotes((p) => p.map((x) => x.id === n.id ? { ...x, is_favorite: next } : x));
                      }}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Nouveau dossier */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau dossier</DialogTitle></DialogHeader>
          <div>
            <Label>Nom du dossier</Label>
            <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Ex : Voyage, Enfants…" />
          </div>
          <DialogFooter><Button onClick={createFolder}>Créer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Édition document */}
      <DocEditDialog doc={editDoc} onClose={() => setEditDoc(null)} onSaved={load} />

      {/* Note sécurisée : nouveau / édition */}
      <SecureNoteDialog
        open={newNoteOpen || editNote !== null}
        onClose={() => { setNewNoteOpen(false); setEditNote(null); }}
        userId={user?.id}
        note={editNote}
        onSaved={load}
      />
    </div>
  );
}

function CategoryTile({ emoji, name, count, active, onClick }: { emoji: string; name: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-2.5 text-left transition-all active:scale-95 ${
        active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="text-base mb-0.5">{emoji}</div>
      <p className="text-xs font-medium text-foreground truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground">{count} doc{count > 1 ? "s" : ""}</p>
    </button>
  );
}

function DocEditDialog({ doc, onClose, onSaved }: { doc: Doc | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [amount, setAmount] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (doc) {
      setName(doc.name);
      setCategory(doc.category);
      setNotes(doc.notes || "");
      setExpiryDate(doc.expiry_date || "");
      setAmount(doc.amount_cents != null ? String(doc.amount_cents / 100) : "");
      setTags((doc.tags || []).join(", "));
    }
  }, [doc]);

  const save = async () => {
    if (!doc) return;
    const cents = amount ? Math.round(parseFloat(amount.replace(",", ".")) * 100) : null;
    const { error } = await supabase.from("vault_documents").update({
      name,
      category,
      notes: notes || null,
      expiry_date: expiryDate || null,
      amount_cents: cents,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    }).eq("id", doc.id);
    if (error) return toast.error(error.message);
    toast.success("Enregistré");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={doc !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Détails du document</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nom</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="mr-2">{c.emoji}</span>{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Montant (€)</Label>
              <Input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex : 350" />
            </div>
            <div>
              <Label>Date d'expiration</Label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Étiquettes (séparées par des virgules)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex : 2026, CIC" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes utiles pour retrouver ce document…" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SecureNoteRow({
  note, onEdit, onDelete, onToggleFav,
}: {
  note: SecureNote;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFav: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const cat = SECURE_NOTE_CATEGORIES.find((c) => c.name === note.category);
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg" aria-hidden>
            {cat?.emoji ?? "🔐"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {note.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
              <p className="text-sm font-medium truncate">{note.title}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">{note.category}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setReveal((v) => !v)} title={reveal ? "Masquer" : "Révéler"}>
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onToggleFav} title="Favori">
            {note.is_favorite
              ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              : <StarOff className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onEdit} title="Modifier"><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onDelete} title="Supprimer"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
        </div>
        {reveal ? (
          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">{note.content}</pre>
            <button
              onClick={() => { navigator.clipboard.writeText(note.content); toast.success("Copié"); }}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Copier
            </button>
          </div>
        ) : (
          <div className="mt-2 h-6 rounded bg-muted/50 flex items-center px-3">
            <span className="tracking-widest text-muted-foreground text-xs">••••••••••••••••</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecureNoteDialog({
  open, onClose, userId, note, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  userId?: string;
  note: SecureNote | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(SECURE_NOTE_CATEGORIES[0].name);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) return;
    if (note) {
      setTitle(note.title);
      setCategory(note.category);
      setContent(note.content);
    } else {
      setTitle("");
      setCategory(SECURE_NOTE_CATEGORIES[0].name);
      setContent("");
    }
  }, [open, note]);

  const save = async () => {
    if (!userId || !title.trim() || !content.trim()) return toast.error("Titre et contenu requis");
    if (note) {
      const { error } = await supabase.from("vault_secure_notes").update({
        title: title.trim(), category, content,
      }).eq("id", note.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("vault_secure_notes").insert({
        user_id: userId, title: title.trim(), category, content,
      });
      if (error) return toast.error(error.message);
    }
    toast.success("Enregistré");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{note ? "Modifier la note" : "Nouvelle note sécurisée"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : IBAN CIC courant" />
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SECURE_NOTE_CATEGORIES.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="mr-2">{c.emoji}</span>{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contenu sensible</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Ex : FR76 3000 4000 5000 6000 7000 123" className="font-mono text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">
              Masqué par défaut. Accessible uniquement depuis ton compte connecté.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
