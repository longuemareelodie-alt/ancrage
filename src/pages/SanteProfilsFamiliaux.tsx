import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Download,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface FamilyProfile {
  id: string;
  first_name: string;
  relation: string;
  birth_date: string | null;
  blood_type: string;
  allergies: string;
  diagnoses: string;
  current_treatments: string;
  medical_history: string;
  doctor_name: string;
  doctor_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}

interface DocItem {
  id: string;
  profile_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  category: string;
}

const RELATIONS = [
  "Enfant",
  "Conjoint·e",
  "Moi-même",
  "Parent",
  "Autre",
];

const emptyProfile = (): Omit<FamilyProfile, "id"> => ({
  first_name: "",
  relation: "Enfant",
  birth_date: null,
  blood_type: "",
  allergies: "",
  diagnoses: "",
  current_treatments: "",
  medical_history: "",
  doctor_name: "",
  doctor_phone: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
});

const SanteProfilsFamiliaux = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ doc: DocItem; url: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profs }, { data: dx }] = await Promise.all([
        supabase
          .from("family_medical_profiles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("family_medical_documents")
          .select("*")
          .eq("user_id", user.id),
      ]);
      setProfiles((profs as any) || []);
      setDocs((dx as any) || []);
      if (profs && profs.length > 0) setOpenId(profs[0].id);
      setLoading(false);
    })();
  }, [user]);

  const addProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("family_medical_profiles")
      .insert({ user_id: user.id, ...emptyProfile() })
      .select()
      .single();
    if (error || !data) {
      toast.error("Impossible d'ajouter le profil");
      return;
    }
    setProfiles((p) => [...p, data as any]);
    setOpenId((data as any).id);
  };

  const updateProfile = (id: string, patch: Partial<FamilyProfile>) => {
    setProfiles((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const saveProfile = async (p: FamilyProfile) => {
    const { id, ...rest } = p;
    const { error } = await supabase
      .from("family_medical_profiles")
      .update({ ...rest, birth_date: p.birth_date || null })
      .eq("id", id);
    if (error) toast.error("Erreur lors de l'enregistrement");
    else toast.success("Profil enregistré ✨");
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Supprimer ce profil et tous ses documents ?")) return;
    const { error } = await supabase
      .from("family_medical_profiles")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    setProfiles((p) => p.filter((it) => it.id !== id));
    setDocs((d) => d.filter((it) => it.profile_id !== id));
    toast.success("Profil supprimé");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button
          onClick={() => navigate("/sante")}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Profils médicaux familiaux</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Un profil par membre de la famille — allergies, diagnostics,
              traitements, médecins référents et documents rattachés.
            </p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-3">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              docs={docs.filter((d) => d.profile_id === p.id)}
              open={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onChange={(patch) => updateProfile(p.id, patch)}
              onSave={() => saveProfile(p)}
              onDelete={() => deleteProfile(p.id)}
              onDocsChange={(next) =>
                setDocs((cur) => [
                  ...cur.filter((d) => d.profile_id !== p.id),
                  ...next,
                ])
              }
              userId={user!.id}
            />
          ))}

          <button
            onClick={addProfile}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" /> Ajouter un membre
          </button>

          {profiles.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Aucun profil pour l'instant. Ajoute un premier membre de ta famille.
            </p>
          )}
        </div>
      </SectionBlock>
    </div>
  );
};

const ProfileCard = ({
  profile,
  docs,
  open,
  onToggle,
  onChange,
  onSave,
  onDelete,
  onDocsChange,
  userId,
}: {
  profile: FamilyProfile;
  docs: DocItem[];
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<FamilyProfile>) => void;
  onSave: () => void;
  onDelete: () => void;
  onDocsChange: (next: DocItem[]) => void;
  userId: string;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `${userId}/${profile.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("family-medical-docs")
      .upload(path, file);
    if (upErr) {
      toast.error("Upload échoué");
      setUploading(false);
      return;
    }
    const { data, error } = await supabase
      .from("family_medical_documents")
      .insert({
        user_id: userId,
        profile_id: profile.id,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        size_bytes: file.size,
        category: "autre",
      })
      .select()
      .single();
    if (error || !data) toast.error("Erreur enregistrement document");
    else {
      onDocsChange([...docs, data as any]);
      toast.success("Document ajouté");
    }
    setUploading(false);
  };

  const removeDoc = async (doc: DocItem) => {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.storage.from("family-medical-docs").remove([doc.storage_path]);
    const { error } = await supabase
      .from("family_medical_documents")
      .delete()
      .eq("id", doc.id);
    if (error) toast.error("Suppression impossible");
    else {
      onDocsChange(docs.filter((d) => d.id !== doc.id));
      toast.success("Document supprimé");
    }
  };

  const openDoc = async (doc: DocItem) => {
    const { data, error } = await supabase.storage
      .from("family-medical-docs")
      .createSignedUrl(doc.storage_path, 300, { download: doc.file_name });
    if (error || !data?.signedUrl) {
      console.error("openDoc error", error);
      toast.error("Lien indisponible");
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const title =
    profile.first_name?.trim() ||
    (profile.relation ? `Nouveau profil — ${profile.relation}` : "Nouveau profil");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(profile.first_name?.[0] || "?").toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-[11px] text-muted-foreground">
              {profile.relation || "—"}
              {docs.length > 0 && ` · ${docs.length} doc${docs.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Prénom"
              value={profile.first_name}
              onChange={(v) => onChange({ first_name: v })}
            />
            <SelectField
              label="Lien de parenté"
              value={profile.relation}
              options={RELATIONS}
              onChange={(v) => onChange({ relation: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Date de naissance"
              type="date"
              value={profile.birth_date || ""}
              onChange={(v) => onChange({ birth_date: v })}
            />
            <Field
              label="Groupe sanguin"
              placeholder="A+, O-..."
              value={profile.blood_type}
              onChange={(v) => onChange({ blood_type: v })}
            />
          </div>

          <h3 className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Médical
          </h3>
          <Field
            label="Allergies"
            multiline
            value={profile.allergies}
            onChange={(v) => onChange({ allergies: v })}
          />
          <Field
            label="Diagnostics"
            multiline
            value={profile.diagnoses}
            onChange={(v) => onChange({ diagnoses: v })}
          />
          <Field
            label="Traitements en cours"
            multiline
            value={profile.current_treatments}
            onChange={(v) => onChange({ current_treatments: v })}
          />
          <Field
            label="Antécédents"
            multiline
            value={profile.medical_history}
            onChange={(v) => onChange({ medical_history: v })}
          />

          <h3 className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Médecins référents
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Médecin"
              value={profile.doctor_name}
              onChange={(v) => onChange({ doctor_name: v })}
            />
            <Field
              label="Téléphone"
              type="tel"
              value={profile.doctor_phone}
              onChange={(v) => onChange({ doctor_phone: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Contact d'urgence"
              value={profile.emergency_contact_name}
              onChange={(v) => onChange({ emergency_contact_name: v })}
            />
            <Field
              label="Téléphone"
              type="tel"
              value={profile.emergency_contact_phone}
              onChange={(v) => onChange({ emergency_contact_phone: v })}
            />
          </div>

          <Field
            label="Notes"
            multiline
            value={profile.notes}
            onChange={(v) => onChange({ notes: v })}
          />

          {/* Documents rattachés */}
          <div>
            <h3 className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Documents rattachés
            </h3>
            <div className="mt-2 space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <button
                    onClick={() => openDoc(d)}
                    className="flex-1 truncate text-left text-xs font-medium hover:underline"
                  >
                    {d.file_name}
                  </button>
                  <button
                    onClick={() => openDoc(d)}
                    className="rounded p-1 text-muted-foreground hover:text-primary"
                    aria-label="Ouvrir"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeDoc(d)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background py-2 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                <Paperclip className="h-3.5 w-3.5" />
                {uploading ? "Envoi..." : "Ajouter un document"}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-1 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) => (
  <div>
    <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />
    )}
  </div>
);

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default SanteProfilsFamiliaux;
