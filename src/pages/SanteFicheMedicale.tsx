import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import { ArrowLeft, Save, QrCode, Eye, RefreshCw, Copy, Check, AlertTriangle, Printer, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { EmergencySheetView, type EmergencySheet } from "./FicheUrgencePublique";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Record {
  id?: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  blood_type: string;
  allergies: string;
  current_treatments: string;
  doctor_name: string;
  doctor_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  emergency_notes: string;
  social_security_number: string;
  public_token: string;
  access_code?: string | null;
  is_public: boolean;
  shared_fields: string[];
}

const SHAREABLE: { key: string; label: string }[] = [
  { key: "first_name", label: "Prénom" },
  { key: "last_name", label: "Nom" },
  { key: "birth_date", label: "Date de naissance" },
  { key: "blood_type", label: "Groupe sanguin" },
  { key: "allergies", label: "Allergies" },
  { key: "current_treatments", label: "Traitements" },
  { key: "medical_history", label: "Antécédents" },
  { key: "emergency_notes", label: "Infos importantes" },
  { key: "emergency_contact", label: "Contact d'urgence" },
  { key: "doctor", label: "Médecin" },
];
const DEFAULT_SHARED = ["first_name", "last_name", "blood_type", "allergies", "current_treatments", "medical_history", "emergency_notes", "emergency_contact"];

const emptyRecord: Record = {
  first_name: "", last_name: "", birth_date: null, blood_type: "",
  allergies: "", current_treatments: "", doctor_name: "", doctor_phone: "",
  emergency_contact_name: "", emergency_contact_phone: "", emergency_notes: "",
  medical_history: "", social_security_number: "", public_token: "", is_public: true,
  shared_fields: DEFAULT_SHARED,
};

const buildPreview = (r: Record): EmergencySheet => {
  const f = r.shared_fields ?? [];
  const s: EmergencySheet = {};
  if (f.includes("first_name")) s.first_name = r.first_name;
  if (f.includes("last_name")) s.last_name = r.last_name;
  if (f.includes("birth_date")) s.birth_date = r.birth_date;
  if (f.includes("blood_type")) s.blood_type = r.blood_type;
  if (f.includes("allergies")) s.allergies = r.allergies;
  if (f.includes("current_treatments")) s.current_treatments = r.current_treatments;
  if (f.includes("medical_history")) s.medical_history = r.medical_history;
  if (f.includes("emergency_notes")) s.emergency_notes = r.emergency_notes;
  if (f.includes("emergency_contact")) { s.emergency_contact_name = r.emergency_contact_name; s.emergency_contact_phone = r.emergency_contact_phone; }
  if (f.includes("doctor")) { s.doctor_name = r.doctor_name; s.doctor_phone = r.doctor_phone; }
  return s;
};

const normalize = (d: any): Record => ({ ...emptyRecord, ...d, emergency_notes: d?.emergency_notes ?? "" });

const SanteFicheMedicale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record>(emptyRecord);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accesses, setAccesses] = useState<{ event: string; accessed_at: string }[]>([]);

  const loadAccesses = async (id?: string) => {
    if (!id) return;
    const { data } = await supabase
      .from("medical_record_access_log" as any)
      .select("event, accessed_at")
      .eq("record_id", id)
      .order("accessed_at", { ascending: false })
      .limit(10);
    setAccesses((data as any) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRecord(normalize(data));
          loadAccesses((data as any).id);
        }
        setLoading(false);
      });
  }, [user]);

  const persist = async (next: Record, okMsg: string) => {
    if (!user) return;
    setSaving(true);
    // Le lien est géré uniquement par le serveur.
    const { public_token: _omit, access_code: _omitCode, id: _id, ...rest } = next as any;
    const payload = { ...rest, user_id: user.id, birth_date: next.birth_date || null };
    const { data, error } = await supabase
      .from("medical_records")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();
    if (error) toast.error("Erreur lors de l'enregistrement");
    else {
      toast.success(okMsg);
      if (data) setRecord(normalize(data));
    }
    setSaving(false);
  };

  const save = () => persist(record, "Fiche enregistrée ✨");
  const setActive = (v: boolean) => persist({ ...record, is_public: v }, v ? "Fiche d'urgence activée" : "Fiche d'urgence désactivée : le QR ne montre plus rien");
  const toggleField = (k: string) => {
    const f = record.shared_fields.includes(k) ? record.shared_fields.filter((x) => x !== k) : [...record.shared_fields, k];
    setRecord({ ...record, shared_fields: f });
  };

  const regenerateToken = async () => {
    const { data, error } = await supabase.rpc("regenerate_medical_token");
    if (error || !data) {
      toast.error("Erreur lors de la régénération");
      return;
    }
    const result = data as { success: boolean; token?: string; retry_after_seconds?: number };
    if (!result.success) {
      const wait = result.retry_after_seconds ?? 0;
      const minutes = Math.ceil(wait / 60);
      toast.error(`Trop de régénérations. Réessaie dans ${minutes > 1 ? `${minutes} minutes` : `${wait} secondes`}.`);
      return;
    }
    if (result.token) {
      setRecord((p) => ({ ...p, public_token: result.token! }));
      toast.success("Nouveau QR généré, l'ancien ne fonctionne plus");
    }
  };

  const publicUrl = record.public_token
    ? `${window.location.origin}/fiche-urgence/${record.public_token}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  }

  const printQR = () => {
    const svg = document.getElementById("sos-qr")?.outerHTML ?? "";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Fiche d'urgence</title></head><body style="font-family:sans-serif;text-align:center;padding:40px">
      <h1>🆘 FICHE D'URGENCE</h1><p>Scannez ce QR code pour consulter les informations essentielles.</p>
      <div style="margin:24px auto;width:240px">${svg.replace(/width="\d+"/, 'width="240"').replace(/height="\d+"/, 'height="240"')}</div>
      <p style="font-size:12px;color:#555">Informations destinées à faciliter la prise en charge en cas d'urgence.</p>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const lastView = accesses.find((a) => a.event === "view");

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">🆘 Ma fiche d'urgence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          📱 Le QR ouvre uniquement les informations que tu coches. Ton dossier médical complet reste privé 🔒
        </p>
      </SectionBlock>

      {record.public_token && (
        <SectionBlock>
          <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold">Activer ma fiche d'urgence</span>
                <span className="block text-xs text-muted-foreground">{record.is_public ? "Le QR fonctionne sans connexion." : "Désactivée : le QR n'affiche plus rien."}</span>
              </span>
              <input type="checkbox" checked={record.is_public} disabled={saving} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5" aria-label="Activer ma fiche d'urgence" />
            </label>

            <div>
              <p className="text-sm font-semibold">Informations affichées</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SHAREABLE.map((s) => {
                  const on = record.shared_fields.includes(s.key);
                  return (
                    <button key={s.key} type="button" onClick={() => toggleField(s.key)} aria-pressed={on}
                      className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                      {on ? "✓ " : ""}{s.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Jamais partagés : numéro de sécurité sociale, adresse, documents, ordonnances. Pense à enregistrer après ton choix.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowQR(!showQR)} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <QrCode className="h-4 w-4" /> {showQR ? "Masquer le QR" : "Générer mon QR d'urgence"}
              </button>
              <button onClick={() => setShowPreview(!showPreview)} className="flex items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} Aperçu
              </button>
            </div>

            {showPreview && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Voici ce que verra une personne qui scanne ton QR.</p>
                <div className="overflow-hidden rounded-xl border border-border"><EmergencySheetView sheet={buildPreview(record)} /></div>
              </div>
            )}

            {showQR && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-5">
                <QRCodeSVG id="sos-qr" value={publicUrl} size={200} level="M" />
                <p className="text-center text-[10px] text-muted-foreground break-all">{publicUrl}</p>
                <div className="flex w-full gap-2">
                  <button onClick={copyLink} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copié" : "Copier le lien"}
                  </button>
                  <button onClick={printQR} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                    <Printer className="h-3.5 w-3.5" /> Imprimer
                  </button>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground underline">
                      <RefreshCw className="h-3 w-3" /> Régénérer mon QR
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Régénérer le QR d'urgence ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        L'ancien QR cessera immédiatement de fonctionner. Limite : 1 régénération toutes les 5 minutes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={regenerateToken}>Confirmer et régénérer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <div className="rounded-lg bg-background/60 p-3">
              <p className="text-xs font-semibold">🔒 Activité de ma fiche d'urgence</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {lastView ? `Dernier accès : ${new Date(lastView.accessed_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}` : "Aucun accès pour l'instant."}
              </p>
              {accesses.length > 1 && (
                <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                  {accesses.slice(1, 6).map((a, i) => (
                    <li key={i}>{new Date(a.accessed_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })} · {a.event === "view" ? "consultée" : "tentative (fiche désactivée)"}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SectionBlock>
      )}

      <SectionBlock>
        <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Prénom" value={record.first_name} onChange={(v) => setRecord({ ...record, first_name: v })} />
            <Field label="Nom" value={record.last_name} onChange={(v) => setRecord({ ...record, last_name: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date de naissance" type="date" value={record.birth_date || ""} onChange={(v) => setRecord({ ...record, birth_date: v })} />
            <Field label="Groupe sanguin" placeholder="A+, O-..." value={record.blood_type} onChange={(v) => setRecord({ ...record, blood_type: v })} />
          </div>
          <Field label="Numéro de sécurité sociale (privé, jamais partagé)" value={record.social_security_number} onChange={(v) => setRecord({ ...record, social_security_number: v })} />

          <h2 className="pt-2 text-sm font-bold">Médical</h2>
          <Field label="Allergies médicamenteuses" multiline value={record.allergies} onChange={(v) => setRecord({ ...record, allergies: v })} />
          <Field label="Traitements en cours" multiline value={record.current_treatments} onChange={(v) => setRecord({ ...record, current_treatments: v })} />
          <Field label="Antécédents importants" multiline value={record.medical_history} onChange={(v) => setRecord({ ...record, medical_history: v })} />
          <Field label="Informations importantes en cas d'urgence" multiline value={record.emergency_notes} onChange={(v) => setRecord({ ...record, emergency_notes: v })} />

          <h2 className="pt-2 text-sm font-bold">Contacts</h2>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Médecin traitant" value={record.doctor_name} onChange={(v) => setRecord({ ...record, doctor_name: v })} />
            <Field label="Tél médecin" type="tel" value={record.doctor_phone} onChange={(v) => setRecord({ ...record, doctor_phone: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Personne à prévenir" value={record.emergency_contact_name} onChange={(v) => setRecord({ ...record, emergency_contact_name: v })} />
            <Field label="Téléphone" type="tel" value={record.emergency_contact_phone} onChange={(v) => setRecord({ ...record, emergency_contact_phone: v })} />
          </div>

          <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer la fiche"}
          </button>
        </div>
      </SectionBlock>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; multiline?: boolean; }) => (
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

export default SanteFicheMedicale;
