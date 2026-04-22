import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HeartPulse, Phone, AlertTriangle } from "lucide-react";

interface PublicRecord {
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
  updated_at: string;
}

const FicheUrgencePublique = () => {
  const { token } = useParams<{ token: string }>();
  const [record, setRecord] = useState<PublicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_medical_record_by_token", { _token: token })
      .then(({ data, error }) => {
        if (error || !data) setError(true);
        else setRecord(data as any);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Chargement de la fiche...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold">Fiche introuvable</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ce lien n'est pas valide ou la fiche n'est plus accessible.
          </p>
        </div>
      </div>
    );
  }

  const age = record.birth_date
    ? Math.floor((Date.now() - new Date(record.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header rouge bien visible pour les secours */}
      <div className="bg-red-600 px-6 py-6 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-8 w-8" />
            <div>
              <p className="text-xs uppercase tracking-wide opacity-90">Fiche médicale d'urgence</p>
              <h1 className="text-2xl font-bold">
                {record.first_name} {record.last_name}
              </h1>
              {age !== null && <p className="text-sm opacity-90">{age} ans</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-6">
        {/* Infos vitales */}
        <Section title="Infos vitales" highlight>
          <Row label="Groupe sanguin" value={record.blood_type || "Non renseigné"} big />
          <Row label="Date de naissance" value={record.birth_date || "Non renseignée"} />
        </Section>

        {/* Allergies — TRES important */}
        {record.allergies && (
          <Section title="⚠️ Allergies médicamenteuses" warning>
            <p className="whitespace-pre-line text-sm font-medium">{record.allergies}</p>
          </Section>
        )}

        {/* Traitements */}
        {record.current_treatments && (
          <Section title="Traitements en cours">
            <p className="whitespace-pre-line text-sm">{record.current_treatments}</p>
          </Section>
        )}

        {/* Antécédents */}
        {record.medical_history && (
          <Section title="Antécédents importants">
            <p className="whitespace-pre-line text-sm">{record.medical_history}</p>
          </Section>
        )}

        {/* Contacts */}
        <Section title="Contacts">
          {record.doctor_name && (
            <ContactRow label="Médecin traitant" name={record.doctor_name} phone={record.doctor_phone} />
          )}
          {record.emergency_contact_name && (
            <ContactRow label="Personne à prévenir" name={record.emergency_contact_name} phone={record.emergency_contact_phone} />
          )}
        </Section>

        <p className="text-center text-[10px] text-gray-400">
          Mise à jour : {new Date(record.updated_at).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
};

const Section = ({ title, children, highlight, warning }: any) => (
  <div className={`rounded-xl border p-4 ${warning ? "border-red-300 bg-red-50" : highlight ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
    <h2 className={`mb-2 text-sm font-bold ${warning ? "text-red-700" : "text-gray-800"}`}>{title}</h2>
    {children}
  </div>
);

const Row = ({ label, value, big }: { label: string; value: string; big?: boolean }) => (
  <div className="flex items-baseline justify-between border-b border-gray-200 py-2 last:border-0">
    <span className="text-xs text-gray-600">{label}</span>
    <span className={`font-semibold ${big ? "text-xl text-red-600" : "text-sm"}`}>{value}</span>
  </div>
);

const ContactRow = ({ label, name, phone }: { label: string; name: string; phone: string }) => (
  <div className="border-b border-gray-200 py-2 last:border-0">
    <p className="text-xs text-gray-600">{label}</p>
    <p className="mt-1 text-sm font-semibold">{name}</p>
    {phone && (
      <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        <Phone className="h-3 w-3" /> {phone}
      </a>
    )}
  </div>
);

export default FicheUrgencePublique;
