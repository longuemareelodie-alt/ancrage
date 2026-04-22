import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import { ArrowLeft, Save, QrCode, Eye, RefreshCw, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
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
  social_security_number: string;
  public_token: string;
  is_public: boolean;
}

const emptyRecord: Record = {
  first_name: "", last_name: "", birth_date: null, blood_type: "",
  allergies: "", current_treatments: "", doctor_name: "", doctor_phone: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  medical_history: "", social_security_number: "", public_token: "", is_public: true,
};

const SanteFicheMedicale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record>(emptyRecord);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRecord(data as any);
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...record, user_id: user.id, birth_date: record.birth_date || null };
    const { data, error } = await supabase
      .from("medical_records")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();
    if (error) toast.error("Erreur lors de l'enregistrement");
    else {
      toast.success("Fiche enregistrée ✨");
      if (data) setRecord(data as any);
    }
    setSaving(false);
  };

  const regenerateToken = async () => {
    const { data, error } = await supabase.rpc("regenerate_medical_token");
    if (error || !data) toast.error("Erreur");
    else {
      setRecord((p) => ({ ...p, public_token: data as string }));
      toast.success("Nouveau lien généré, l'ancien ne fonctionne plus");
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

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">🆘 Fiche Médicale d'Urgence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          En cas d'urgence, les secours peuvent scanner ton QR code pour accéder à tes infos vitales.
        </p>
      </SectionBlock>

      {record.public_token && (
        <SectionBlock>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Ma fiche publique</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Partage ce QR avec tes proches ou affiche-le</p>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                <QrCode className="h-4 w-4" /> {showQR ? "Masquer" : "Voir QR"}
              </button>
            </div>

            {showQR && (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-white p-6">
                <QRCodeSVG value={publicUrl} size={200} level="M" />
                <p className="text-center text-[10px] text-muted-foreground break-all">{publicUrl}</p>
                <div className="flex w-full gap-2">
                  <button
                    onClick={copyLink}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copié" : "Copier le lien"}
                  </button>
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium"
                  >
                    <Eye className="h-3.5 w-3.5" /> Aperçu
                  </a>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-1 text-[11px] text-muted-foreground underline"
                    >
                      <RefreshCw className="h-3 w-3" /> Générer un nouveau lien
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Régénérer le lien d'urgence ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <span className="block">
                          L'ancien lien et le QR code actuel cesseront immédiatement de fonctionner.
                        </span>
                        <span className="block font-medium text-foreground">
                          Tous tes proches et secours qui possèdent l'ancien QR ne pourront plus accéder à ta fiche. Tu devras leur partager le nouveau.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={regenerateToken}>
                        Confirmer et régénérer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-relaxed text-amber-900">
                Ce lien signé reste actif tant que tu ne le régénères pas. Si tu perds ton QR ou doutes qu'il soit entre de mauvaises mains, régénère-le pour révoquer l'ancien.
              </p>
            </div>

            <label className="mt-4 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={record.is_public}
                onChange={(e) => setRecord({ ...record, is_public: e.target.checked })}
                className="h-4 w-4"
              />
              <span>Fiche accessible publiquement via le lien</span>
            </label>
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
          <Field label="Numéro de sécurité sociale" value={record.social_security_number} onChange={(v) => setRecord({ ...record, social_security_number: v })} />

          <h2 className="pt-2 text-sm font-bold">Médical</h2>
          <Field label="Allergies médicamenteuses" multiline value={record.allergies} onChange={(v) => setRecord({ ...record, allergies: v })} />
          <Field label="Traitements en cours" multiline value={record.current_treatments} onChange={(v) => setRecord({ ...record, current_treatments: v })} />
          <Field label="Antécédents importants" multiline value={record.medical_history} onChange={(v) => setRecord({ ...record, medical_history: v })} />

          <h2 className="pt-2 text-sm font-bold">Contacts</h2>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Médecin traitant" value={record.doctor_name} onChange={(v) => setRecord({ ...record, doctor_name: v })} />
            <Field label="Tél médecin" type="tel" value={record.doctor_phone} onChange={(v) => setRecord({ ...record, doctor_phone: v })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Personne à prévenir" value={record.emergency_contact_name} onChange={(v) => setRecord({ ...record, emergency_contact_name: v })} />
            <Field label="Téléphone" type="tel" value={record.emergency_contact_phone} onChange={(v) => setRecord({ ...record, emergency_contact_phone: v })} />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
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
