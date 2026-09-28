import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HeartPulse, Phone, AlertTriangle, Lock } from "lucide-react";

export interface EmergencySheet {
  first_name?: string;
  last_name?: string;
  birth_date?: string | null;
  blood_type?: string;
  allergies?: string;
  current_treatments?: string;
  medical_history?: string;
  emergency_notes?: string;
  doctor_name?: string;
  doctor_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  updated_at?: string;
}

type Status = "loading" | "ok" | "invalid" | "disabled" | "rate_limited";

const FicheUrgencePublique = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [sheet, setSheet] = useState<EmergencySheet | null>(null);

  useEffect(() => {
    supabase.rpc("get_emergency_sheet" as any, { _token: token ?? "" }).then(({ data, error }) => {
      const d = data as any;
      if (error || !d) { setStatus("invalid"); return; }
      if (d.status === "ok") { setSheet(d); setStatus("ok"); }
      else setStatus(d.status);
    });
  }, [token]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">Chargement…</div>;
  }
  if (status !== "ok" || !sheet) {
    const msg = status === "disabled"
      ? "Cette fiche d'urgence n'est plus disponible."
      : status === "rate_limited"
      ? "Trop de consultations en peu de temps. Réessaie dans quelques minutes."
      : "Ce QR code n'est pas valide ou a été remplacé.";
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6 text-center text-black">
        <div className="max-w-sm">
          <Lock className="mx-auto h-10 w-10 text-red-600" />
          <h1 className="mt-4 text-xl font-bold">🆘 Fiche d'urgence Éclosia</h1>
          <p className="mt-2 text-sm text-gray-600">{msg}</p>
        </div>
      </div>
    );
  }
  return <EmergencySheetView sheet={sheet} />;
};

export const EmergencySheetView = ({ sheet }: { sheet: EmergencySheet }) => {
  const age = sheet.birth_date
    ? Math.floor((Date.now() - new Date(sheet.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;
  const name = [sheet.first_name, sheet.last_name].filter(Boolean).join(" ");
  return (
    <div className="bg-white text-black">
      <div className="bg-red-600 px-6 py-5 text-white">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <HeartPulse className="h-8 w-8 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wide opacity-90">🆘 Fiche d'urgence Éclosia</p>
            {name && <h1 className="text-2xl font-bold">{name}</h1>}
            {age !== null && <p className="text-sm opacity-90">{age} ans · née le {new Date(sheet.birth_date!).toLocaleDateString("fr-FR")}</p>}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-3 p-5">
        <p className="text-xs text-gray-600">Informations mises à disposition par la personne pour faciliter sa prise en charge en cas d'urgence.</p>
        {sheet.blood_type && <Section title="Groupe sanguin" highlight><p className="text-xl font-bold text-red-600">{sheet.blood_type}</p></Section>}
        {sheet.allergies && <Section title="⚠️ Allergies" warning><p className="whitespace-pre-line text-sm font-medium">{sheet.allergies}</p></Section>}
        {sheet.current_treatments && <Section title="Traitements importants"><p className="whitespace-pre-line text-sm">{sheet.current_treatments}</p></Section>}
        {sheet.medical_history && <Section title="Antécédents essentiels"><p className="whitespace-pre-line text-sm">{sheet.medical_history}</p></Section>}
        {sheet.emergency_notes && <Section title="Informations importantes"><p className="whitespace-pre-line text-sm">{sheet.emergency_notes}</p></Section>}
        {(sheet.emergency_contact_name || sheet.doctor_name) && (
          <Section title="Contacts">
            {sheet.emergency_contact_name && <ContactRow label="Contact d'urgence" name={sheet.emergency_contact_name} phone={sheet.emergency_contact_phone} />}
            {sheet.doctor_name && <ContactRow label="Médecin" name={sheet.doctor_name} phone={sheet.doctor_phone} />}
          </Section>
        )}
        <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <p>Ces informations sont fournies par l'utilisateur et ne remplacent pas un dossier médical ni l'évaluation d'un professionnel de santé.</p>
        </div>
        {sheet.updated_at && <p className="text-center text-[10px] text-gray-400">Mise à jour : {new Date(sheet.updated_at).toLocaleDateString("fr-FR")}</p>}
      </div>
    </div>
  );
};

const Section = ({ title, children, highlight, warning }: any) => (
  <div className={`rounded-xl border p-4 ${warning ? "border-red-300 bg-red-50" : highlight ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
    <h2 className={`mb-1.5 text-sm font-bold ${warning ? "text-red-700" : "text-gray-800"}`}>{title}</h2>
    {children}
  </div>
);

const ContactRow = ({ label, name, phone }: { label: string; name: string; phone?: string }) => (
  <div className="border-b border-gray-200 py-2 last:border-0">
    <p className="text-xs text-gray-600">{label}</p>
    <p className="mt-0.5 text-sm font-semibold">{name}</p>
    {phone && (
      <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        <Phone className="h-3 w-3" /> {phone}
      </a>
    )}
  </div>
);

export default FicheUrgencePublique;
