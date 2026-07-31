import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { differenceInYears } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ChevronRight,
  Phone,
  Plus,
  Trash2,
  FileText,
  Pill,
  Stethoscope,
  Printer,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SUPPORT_TYPES } from "@/data/supportTemplates";

type Profile = {
  id: string;
  first_name: string;
  relation: string;
  birth_date: string | null;
  diagnoses: string;
  allergies: string;
  current_treatments: string;
  notes: string;
  doctor_name: string;
  doctor_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  diagnosis_tags: string[];
  interests: string[];
  sensitivities: string[];
  soothers: string[];
  preferences: string;
};

type Contact = { id: string; name: string; role: string; phone: string | null; email: string | null };
type Support = { id: string; title: string; support_type: string };

const TABS = [
  { key: "apercu", label: "Aperçu" },
  { key: "profil", label: "Profil" },
  { key: "sante", label: "Santé" },
  { key: "documents", label: "Documents" },
  { key: "contacts", label: "Contacts" },
  { key: "supports", label: "Supports" },
];

const listToText = (v: string[]) => v.join(", ");
const textToList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Fiche unique d'un membre : un parent pense « Léa », pas « ordonnances ».
 * Tout ce qui concerne une personne vit ici, en onglets, sans re-navigation.
 */
const FicheMembre = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("onglet") ?? "apercu";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [siblings, setSiblings] = useState<{ id: string; first_name: string }[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    diagnosis_tags: "",
    interests: "",
    sensitivities: "",
    soothers: "",
    preferences: "",
  });
  const [newContact, setNewContact] = useState({ name: "", role: "", phone: "" });

  const load = async () => {
    const [{ data: p }, { data: all }, { data: c }, { data: s }, { count }] = await Promise.all([
      supabase.from("family_medical_profiles").select("*").eq("id", profileId!).maybeSingle(),
      supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      supabase
        .from("child_contacts")
        .select("id, name, role, phone, email")
        .eq("profile_id", profileId!)
        .order("created_at"),
      supabase
        .from("autonomy_supports")
        .select("id, title, support_type")
        .eq("profile_id", profileId!)
        .order("updated_at", { ascending: false }),
      supabase
        .from("family_medical_documents")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profileId!),
    ]);
    if (p) {
      const prof = p as unknown as Profile;
      setProfile(prof);
      setForm({
        diagnosis_tags: listToText(prof.diagnosis_tags ?? []),
        interests: listToText(prof.interests ?? []),
        sensitivities: listToText(prof.sensitivities ?? []),
        soothers: listToText(prof.soothers ?? []),
        preferences: prof.preferences ?? "",
      });
    }
    setSiblings(all ?? []);
    setContacts(c ?? []);
    setSupports(s ?? []);
    setDocCount(count ?? 0);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const age = useMemo(
    () => (profile?.birth_date ? differenceInYears(new Date(), new Date(profile.birth_date)) : null),
    [profile],
  );

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("family_medical_profiles")
      .update({
        diagnosis_tags: textToList(form.diagnosis_tags),
        interests: textToList(form.interests),
        sensitivities: textToList(form.sensitivities),
        soothers: textToList(form.soothers),
        preferences: form.preferences,
      })
      .eq("id", profileId!);
    setSaving(false);
    toast({
      description: error ? "Enregistrement impossible." : "Fiche mise à jour.",
      variant: error ? "destructive" : undefined,
    });
    if (!error) load();
  };

  const addContact = async () => {
    if (!newContact.name.trim()) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase.from("child_contacts").insert({
      user_id: uid,
      profile_id: profileId!,
      name: newContact.name.trim(),
      role: newContact.role.trim() || "autre",
      phone: newContact.phone.trim() || null,
    });
    setNewContact({ name: "", role: "", phone: "" });
    load();
  };

  if (!profile) return <HubShell title="Fiche">{null}</HubShell>;

  const chips = (label: string, values: string[]) =>
    values.length > 0 && (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground"
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    );

  return (
    <HubShell
      title={profile.first_name + (age !== null ? `, ${age} ans` : "")}
      subtitle={
        (profile.diagnosis_tags?.length ? profile.diagnosis_tags.join(" · ") : profile.relation) || undefined
      }
    >
      <button
        onClick={() => navigate("/famille")}
        className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Ma famille
      </button>

      {siblings.length > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
          {siblings.map((s) => (
            <Link
              key={s.id}
              to={"/famille/" + s.id}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium ${
                s.id === profile.id
                  ? "border-primary/50 bg-secondary/60 text-foreground"
                  : "border-border/70 text-muted-foreground"
              }`}
            >
              {s.first_name}
            </Link>
          ))}
        </div>
      )}

      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border/60 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams({ onglet: t.key })}
            className={`shrink-0 border-b-2 px-3 pb-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "apercu" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-4 rounded-[20px] border border-border/70 bg-card px-5 py-5">
            {chips("Diagnostics", profile.diagnosis_tags ?? [])}
            {chips("Sensibilités", profile.sensitivities ?? [])}
            {chips("Ce qui l'apaise", profile.soothers ?? [])}
            {chips("Centres d'intérêt", profile.interests ?? [])}
            {!profile.diagnosis_tags?.length &&
              !profile.sensitivities?.length &&
              !profile.soothers?.length && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cette fiche est encore vide. Remplis l'onglet Profil : c'est ce qui te fera gagner
                  du temps le jour où quelqu'un d'autre devra s'occuper de {profile.first_name}.
                </p>
              )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Link
              to={`/famille/${profile.id}/ordonnances`}
              className="rounded-[20px] border border-border/70 bg-card px-3 py-4 text-center"
            >
              <Pill className="mx-auto h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="mt-2 block text-[11px] font-medium text-foreground">Ordonnances</span>
            </Link>
            <Link
              to={`/famille/${profile.id}/documents`}
              className="rounded-[20px] border border-border/70 bg-card px-3 py-4 text-center"
            >
              <FileText className="mx-auto h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="mt-2 block text-[11px] font-medium text-foreground">{docCount} docs</span>
            </Link>
            <Link
              to={`/famille/${profile.id}/carnet`}
              className="rounded-[20px] border border-border/70 bg-card px-3 py-4 text-center"
            >
              <Stethoscope className="mx-auto h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="mt-2 block text-[11px] font-medium text-foreground">Carnet</span>
            </Link>
          </div>
        </div>
      )}

      {tab === "profil" && (
        <div className="space-y-4 rounded-[20px] border border-border/70 bg-card px-5 py-5">
          {[
            { key: "diagnosis_tags", label: "Diagnostics", hint: "TSA, TDAH, dyspraxie…" },
            { key: "sensitivities", label: "Sensibilités", hint: "bruit, lumière, étiquettes…" },
            { key: "soothers", label: "Ce qui l'apaise", hint: "eau, casque, compter…" },
            { key: "interests", label: "Centres d'intérêt", hint: "trains, dinosaures…" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </label>
              <Input
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.hint}
                className="mt-1.5 text-sm"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Séparés par des virgules.</p>
            </div>
          ))}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Préférences & repères
            </label>
            <Textarea
              value={form.preferences}
              onChange={(e) => setForm({ ...form, preferences: e.target.value })}
              placeholder="Ce qu'il faut savoir pour bien l'accompagner…"
              className="mt-1.5 min-h-24 text-sm"
            />
          </div>
          <Button onClick={saveProfile} disabled={saving} className="w-full">
            Enregistrer
          </Button>
        </div>
      )}

      {tab === "sante" && (
        <div className="space-y-2 pt-2">
          {[
            { label: "Allergies", value: profile.allergies },
            { label: "Traitements en cours", value: profile.current_treatments },
            { label: "Diagnostics médicaux", value: profile.diagnoses },
          ].map((b) => (
            <div key={b.label} className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {b.label}
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground">{b.value || "—"}</p>
            </div>
          ))}
          <Link
            to={`/famille/${profile.id}/carnet`}
            className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
          >
            <span className="flex-1 text-sm font-semibold text-foreground">Carnet médical complet</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </Link>
        </div>
      )}

      {tab === "documents" && (
        <div className="space-y-2 pt-2">
          <Link
            to={`/famille/${profile.id}/documents`}
            className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Documents</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{docCount} fichiers</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </Link>
          <Link
            to={`/famille/${profile.id}/ordonnances`}
            className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
          >
            <span className="flex-1 text-sm font-semibold text-foreground">Ordonnances</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </Link>
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-2 pt-2">
          {(profile.doctor_name || profile.emergency_contact_name) && (
            <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
              {profile.doctor_name && (
                <p className="flex items-center justify-between text-sm text-foreground">
                  {profile.doctor_name}
                  {profile.doctor_phone && (
                    <a href={`tel:${profile.doctor_phone}`} className="text-xs text-primary-dark">
                      <Phone className="mr-1 inline h-3 w-3" />
                      {profile.doctor_phone}
                    </a>
                  )}
                </p>
              )}
              {profile.emergency_contact_name && (
                <p className="mt-2 flex items-center justify-between text-sm text-foreground">
                  {profile.emergency_contact_name}
                  {profile.emergency_contact_phone && (
                    <a href={`tel:${profile.emergency_contact_phone}`} className="text-xs text-primary-dark">
                      <Phone className="mr-1 inline h-3 w-3" />
                      {profile.emergency_contact_phone}
                    </a>
                  )}
                </p>
              )}
            </div>
          )}

          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.role}</span>
              </span>
              {c.phone && (
                <a href={`tel:${c.phone}`} className="text-xs text-primary-dark">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                onClick={async () => {
                  await supabase.from("child_contacts").delete().eq("id", c.id);
                  load();
                }}
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              </button>
            </div>
          ))}

          <div className="space-y-2 rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-4">
            <Input
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Nom"
              className="text-sm"
            />
            <div className="flex gap-2">
              <Input
                value={newContact.role}
                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                placeholder="Rôle (école, AESH, ortho…)"
                className="text-sm"
              />
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Téléphone"
                className="w-32 text-sm"
              />
            </div>
            <Button size="sm" onClick={addContact} disabled={!newContact.name.trim()} className="w-full">
              <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} /> Ajouter un contact
            </Button>
          </div>
        </div>
      )}

      {tab === "supports" && (
        <div className="space-y-2 pt-2">
          {supports.length === 0 && (
            <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm leading-relaxed text-muted-foreground">
              Aucun support visuel pour {profile.first_name}. Le Studio en crée un en deux minutes.
            </p>
          )}
          {supports.map((s) => (
            <Link
              key={s.id}
              to={"/autonomie/support/" + s.id}
              className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-4"
            >
              <Printer className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{s.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {SUPPORT_TYPES[s.support_type as keyof typeof SUPPORT_TYPES]?.label ?? s.support_type}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
          <Link
            to="/autonomie/studio"
            className="block rounded-[20px] border border-border/70 bg-card px-5 py-4 text-center text-sm font-semibold text-foreground"
          >
            Ouvrir le Studio
          </Link>
        </div>
      )}
    </HubShell>
  );
};

export default FicheMembre;
