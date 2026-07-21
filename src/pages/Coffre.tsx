import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FolderLock, Upload, Search, FileText, Image as ImageIcon, Download, Trash2, Plus, FolderPlus, Heart, GraduationCap, Shield, FileBadge, Home, User, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DEFAULT_CATEGORIES = [
  { name: "Santé", emoji: "❤️", keywords: ["ordonnance", "medic", "sante", "hopital", "medecin", "vaccin", "analyse", "radio", "sécu", "secu", "carte-vitale"] },
  { name: "CAF", emoji: "🏛️", keywords: ["caf", "allocation", "cnaf", "apl"] },
  { name: "École", emoji: "🎓", keywords: ["ecole", "école", "college", "collège", "lycee", "lycée", "scolaire", "cantine", "bulletin", "inscription"] },
  { name: "Assurance", emoji: "🛡️", keywords: ["assurance", "mutuelle", "maif", "macif", "matmut", "attestation"] },
  { name: "Garanties", emoji: "📜", keywords: ["garantie", "facture", "achat", "ticket"] },
  { name: "Administratif", emoji: "🏢", keywords: ["impot", "impôt", "urssaf", "prefecture", "préfecture", "identite", "identité", "passeport", "permis", "edf", "engie", "eau", "loyer", "bail"] },
  { name: "Personnel", emoji: "👤", keywords: [] },
];

interface Doc {
  id: string;
  name: string;
  category: string;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
}

const autoCategorize = (filename: string): string => {
  const f = filename.toLowerCase();
  for (const cat of DEFAULT_CATEGORIES) {
    if (cat.keywords.some((k) => f.includes(k))) return cat.name;
  }
  return "Personnel";
};

const formatSize = (b?: number | null) => {
  if (!b) return "";
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
};

export default function Coffre() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!user) return;
    const [{ data: d }, { data: f }] = await Promise.all([
      supabase.from("vault_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("vault_folders").select("*").eq("user_id", user.id).order("name"),
    ]);
    setDocs((d as Doc[]) || []);
    setFolders((f as Folder[]) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const allCategories = useMemo(() => [
    ...DEFAULT_CATEGORIES.map((c) => ({ name: c.name, emoji: c.emoji, custom: false })),
    ...folders.map((f) => ({ name: f.name, emoji: "📁", custom: true })),
  ], [folders]);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (activeCat && d.category !== activeCat) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [docs, search, activeCat]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    docs.forEach((d) => m.set(d.category, (m.get(d.category) || 0) + 1));
    return m;
  }, [docs]);

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

  const moveDoc = async (doc: Doc, newCat: string) => {
    await supabase.from("vault_documents").update({ category: newCat }).eq("id", doc.id);
    setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, category: newCat } : d)));
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
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <FolderLock className="h-8 w-8 text-primary" />
            Coffre-fort
          </h1>
          <p className="mt-2 text-muted-foreground">Tes documents importants, chiffrés et retrouvables en un instant.</p>
        </motion.header>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex-1 sm:flex-initial">
            <Upload className="h-4 w-4 mr-2" /> {uploading ? "Import en cours…" : "Importer un document"}
          </Button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          <Button variant="outline" onClick={() => setNewFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" /> Nouveau dossier
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un document…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Catégories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <CategoryTile emoji="📄" name="Tout" count={docs.length} active={activeCat === null} onClick={() => setActiveCat(null)} />
          {allCategories.map((c) => (
            <CategoryTile
              key={c.name}
              emoji={c.emoji}
              name={c.name}
              count={counts.get(c.name) || 0}
              active={activeCat === c.name}
              onClick={() => setActiveCat(c.name)}
            />
          ))}
        </div>

        {/* Liste */}
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
            {filtered.map((doc) => (
              <Card key={doc.id} className="transition-all hover:shadow-md">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {doc.mime_type?.startsWith("image/") ? <ImageIcon className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                  </div>
                  <button onClick={() => openDoc(doc)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category} · {formatSize(doc.size_bytes)} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </button>
                  <Select value={doc.category} onValueChange={(v) => moveDoc(doc, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs hidden sm:flex"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allCategories.map((c) => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => openDoc(doc)}><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteDoc(doc)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}

function CategoryTile({ emoji, name, count, active, onClick }: { emoji: string; name: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition-all active:scale-95 ${
        active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="text-xl mb-1">{emoji}</div>
      <p className="text-sm font-medium text-foreground truncate">{name}</p>
      <p className="text-xs text-muted-foreground">{count} document{count > 1 ? "s" : ""}</p>
    </button>
  );
}
