import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { celebrate } from "@/lib/gentleBadges";
import {
  Users, Plus, Syringe, FileText, Heart, AlertTriangle, Pill, Stethoscope,
  Trash2, Pencil, ChevronRight, Calendar, Phone, PlusCircle, ExternalLink,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";

interface Profile {
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

interface Vaccination {
  id: string;
  profile_id: string;
  vaccine_name: string;
  date_given: string | null;
  next_due_date: string | null;
  notes: string | null;
}

interface Document {
  id: string;
  profile_id: string;
  file_name: string;
  category: string | null;
  storage_path: string;
  created_at: string;
}

const RELATIONS = ["Enfant", "Conjoint·e", "Moi", "Parent", "Frère/Sœur", "Autre"];
const BLOOD_TYPES = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMMON_VACCINES = [
  "DTP (Diphtérie-Tétanos-Polio)",
  "ROR (Rougeole-Oreillons-Rubéole)",
  "Coqueluche",
  "Hépatite B",
  "Méningocoque C",
  "Pneumocoque",
  "HPV (Papillomavirus)",
  "Grippe",
  "COVID-19",
  "BCG (Tuberculose)",
  "Rage",
  "Fièvre jaune",
];

export default function Famille() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProfile, setOpenProfile] = useState<Profile | null>(null);
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [detailFor, setDetailFor] = useState<Profile | null>(null);
  const [sharedProfiles, setSharedProfiles] = useState<Profile[]>([]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: v }, { data: d }, { data: shared }] = await Promise.all([
      supabase.from("family_medical_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("family_vaccinations").select("*").eq("user_id", user.id).order("date_given", { ascending: false }),
      supabase.from("family_medical_documents").select("id,profile_id,file_name,category,storage_path,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      // Profils partagés par un proche qui m'a invitée : lecture seule.
      supabase.from("family_medical_profiles").select("*").neq("user_id", user.id).order("created_at", { ascending: true }),
    ]);
    setProfiles((p as Profile[]) || []);
    setVaccinations((v as Vaccination[]) || []);
    setDocuments((d as Document[]) || []);
    setSharedProfiles((shared as Profile[]) || []);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [user?.id]);

  // Rappels vaccinaux à venir
  const upcomingVaccines = useMemo(() => {
    const today = new Date();
    return vaccinations
      .filter((v) => v.next_due_date)
      .map((v) => ({ v, days: differenceInDays(new Date(v.next_due_date!), today) }))
      .filter((x) => x.days <= 60)
      .sort((a, b) => a.days - b.days);
  }, [vaccinations]);

  const removeProfile = async (id: string) => {
    if (!confirm("Supprimer ce profil et toutes ses données associées ?")) return;
    await supabase.from("family_medical_profiles").delete().eq("id", id);
    setProfiles((p) => p.filter((x) => x.id !== id));
    toast.success("Profil supprimé");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="font-playfair text-3xl md:text-4xl text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Famille
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tous les profils de ta famille — santé, allergies, vaccins, documents et notes — au même endroit.
          </p>
        </motion.header>

        {/* Alertes vaccins */}
        {upcomingVaccines.length > 0 && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
            <Syringe className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {upcomingVaccines.length} rappel{upcomingVaccines.length > 1 ? "s" : ""} de vaccin à prévoir
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {upcomingVaccines.slice(0, 3).map((x) => {
                  const p = profiles.find((pp) => pp.id === x.v.profile_id);
                  const label = x.days < 0 ? `à prévoir depuis ${Math.abs(x.days)}j` : `dans ${x.days}j`;
                  return `${p?.first_name || "?"} · ${x.v.vaccine_name} (${label})`;
                }).join(" · ")}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={() => setNewProfileOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau profil
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sante/profils-familiaux">
              <FileText className="h-4 w-4 mr-2" /> Gérer les documents
            </Link>
          </Button>
        </div>

        {/* Grille des profils */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Ta famille n'est pas encore arrivée ici.</p>
              <p className="text-sm mt-1">Ajoute les membres de ta famille pour centraliser leurs infos santé.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profiles.map((p) => {
              const age = p.birth_date ? differenceInYears(new Date(), new Date(p.birth_date)) : null;
              const nbVaccines = vaccinations.filter((v) => v.profile_id === p.id).length;
              const nbDocs = documents.filter((d) => d.profile_id === p.id).length;
              const hasAllergies = p.allergies.trim().length > 0;
              const hasTreatment = p.current_treatments.trim().length > 0;
              return (
                <Card key={p.id} className="transition-all hover:shadow-md cursor-pointer" onClick={() => setDetailFor(p)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
                        {p.first_name.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{p.first_name || "Sans nom"}</p>
                          {p.blood_type && (
                            <span className="text-[10px] font-semibold rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 dark:bg-rose-950/40 dark:text-rose-300">
                              {p.blood_type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.relation || "Membre"}{age !== null ? ` · ${age} an${age > 1 ? "s" : ""}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {hasAllergies && <Chip icon={AlertTriangle} tone="rose" label="Allergies" />}
                          {hasTreatment && <Chip icon={Pill} tone="sky" label="Traitement" />}
                          <Chip icon={Syringe} tone="sage" label={`${nbVaccines} vaccin${nbVaccines > 1 ? "s" : ""}`} />
                          <Chip icon={FileText} tone="sand" label={`${nbDocs} doc${nbDocs > 1 ? "s" : ""}`} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                          <Link
                            to={`/famille/${p.id}/carnet`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            <Stethoscope className="h-3 w-3" /> Carnet médical
                          </Link>
                          <Link
                            to={`/famille/${p.id}/documents`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" /> Documents
                          </Link>
                          <Link
                            to={`/famille/${p.id}/ordonnances`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            <Pill className="h-3 w-3" /> Ordonnances
                          </Link>
                        </div>

                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Profils partagés avec moi — consultation seule */}
        {sharedProfiles.length > 0 && (
          <section className="mt-8">
            <h2 className="font-playfair text-xl text-foreground">Partagés avec moi</h2>
            <p className="mt-1 mb-3 text-sm text-muted-foreground">
              Ces fiches vous sont partagées par un proche. Vous pouvez les consulter, pas les modifier.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sharedProfiles.map((p) => {
                const age = p.birth_date ? differenceInYears(new Date(), new Date(p.birth_date)) : null;
                return (
                  <Card key={p.id} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground shrink-0">
                          {p.first_name.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{p.first_name || "Sans nom"}</p>
                            <span className="text-[10px] font-semibold rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                              Lecture seule
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {p.relation || "Membre"}{age !== null ? ` · ${age} an${age > 1 ? "s" : ""}` : ""}
                          </p>
                          {p.allergies.trim() && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Allergies : </span>
                              {p.allergies}
                            </p>
                          )}
                          {p.current_treatments.trim() && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Traitements : </span>
                              {p.current_treatments}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>


      {/* Nouveau profil */}
      <ProfileDialog
        open={newProfileOpen || openProfile !== null}
        profile={openProfile}
        onClose={() => { setNewProfileOpen(false); setOpenProfile(null); }}
        userId={user?.id}
        onSaved={load}
      />

      {/* Détail profil */}
      <ProfileDetail
        profile={detailFor}
        onClose={() => setDetailFor(null)}
        onEdit={(p) => { setDetailFor(null); setOpenProfile(p); }}
        onDelete={async (p) => { await removeProfile(p.id); setDetailFor(null); }}
        vaccinations={vaccinations.filter((v) => v.profile_id === detailFor?.id)}
        documents={documents.filter((d) => d.profile_id === detailFor?.id)}
        onVaccineChanged={load}
        userId={user?.id}
      />
    </div>
  );
}

function Chip({ icon: Icon, tone, label }: { icon: any; tone: "rose" | "sage" | "sky" | "sand"; label: string }) {
  const cls: Record<string, string> = {
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    sage: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    sand: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls[tone]}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function ProfileDialog({
  open, profile, onClose, userId, onSaved,
}: {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  userId?: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (!open) return;
    setForm(profile || { first_name: "", relation: "Enfant", blood_type: "", allergies: "", diagnoses: "", current_treatments: "", medical_history: "", doctor_name: "", doctor_phone: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "" });
  }, [open, profile]);

  const set = (k: keyof Profile, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!userId) return;
    if (!form.first_name?.trim()) return toast.error("Prénom requis");
    const payload = {
      first_name: form.first_name ?? "",
      relation: form.relation ?? "",
      birth_date: form.birth_date || null,
      blood_type: form.blood_type ?? "",
      allergies: form.allergies ?? "",
      diagnoses: form.diagnoses ?? "",
      current_treatments: form.current_treatments ?? "",
      medical_history: form.medical_history ?? "",
      doctor_name: form.doctor_name ?? "",
      doctor_phone: form.doctor_phone ?? "",
      emergency_contact_name: form.emergency_contact_name ?? "",
      emergency_contact_phone: form.emergency_contact_phone ?? "",
      notes: form.notes ?? "",
    };
    if (profile) {
      const { error } = await supabase.from("family_medical_profiles").update(payload).eq("id", profile.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("family_medical_profiles").insert({ user_id: userId, ...payload });
      if (error) return toast.error(error.message);
      celebrate("first_child");
    }
    toast.success("Enregistré");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{profile ? "Modifier le profil" : "Nouveau profil"}</DialogTitle></DialogHeader>
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="identity">Identité</TabsTrigger>
            <TabsTrigger value="medical">Médical</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prénom *</Label>
                <Input value={form.first_name || ""} onChange={(e) => set("first_name", e.target.value)} />
              </div>
              <div>
                <Label>Relation</Label>
                <Select value={form.relation || ""} onValueChange={(v) => set("relation", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{RELATIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date de naissance</Label>
                <Input type="date" value={form.birth_date || ""} onChange={(e) => set("birth_date", e.target.value)} />
              </div>
              <div>
                <Label>Groupe sanguin</Label>
                <Select value={form.blood_type || ""} onValueChange={(v) => set("blood_type", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{BLOOD_TYPES.filter(Boolean).map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-3 pt-3">
            <div>
              <Label>Allergies</Label>
              <Textarea value={form.allergies || ""} onChange={(e) => set("allergies", e.target.value)} rows={2} placeholder="Ex : Arachides, pénicilline…" />
            </div>
            <div>
              <Label>Diagnostics / pathologies</Label>
              <Textarea value={form.diagnoses || ""} onChange={(e) => set("diagnoses", e.target.value)} rows={2} placeholder="Ex : Asthme, diabète…" />
            </div>
            <div>
              <Label>Traitements en cours</Label>
              <Textarea value={form.current_treatments || ""} onChange={(e) => set("current_treatments", e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Antécédents médicaux</Label>
              <Textarea value={form.medical_history || ""} onChange={(e) => set("medical_history", e.target.value)} rows={2} />
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Médecin traitant</Label>
                <Input value={form.doctor_name || ""} onChange={(e) => set("doctor_name", e.target.value)} />
              </div>
              <div>
                <Label>Téléphone médecin</Label>
                <Input type="tel" value={form.doctor_phone || ""} onChange={(e) => set("doctor_phone", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contact d'urgence</Label>
                <Input value={form.emergency_contact_name || ""} onChange={(e) => set("emergency_contact_name", e.target.value)} />
              </div>
              <div>
                <Label>Téléphone urgence</Label>
                <Input type="tel" value={form.emergency_contact_phone || ""} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="pt-3">
            <Label>Notes libres</Label>
            <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={6} placeholder="Toute info utile à retenir…" />
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileDetail({
  profile, onClose, onEdit, onDelete, vaccinations, documents, onVaccineChanged, userId,
}: {
  profile: Profile | null;
  onClose: () => void;
  onEdit: (p: Profile) => void;
  onDelete: (p: Profile) => void;
  vaccinations: Vaccination[];
  documents: Document[];
  onVaccineChanged: () => void;
  userId?: string;
}) {
  const [addVacOpen, setAddVacOpen] = useState(false);

  const openDoc = async (d: Document) => {
    const { data, error } = await supabase.storage.from("family-medical-docs").createSignedUrl(d.storage_path, 300);
    if (error || !data) return toast.error("Impossible d'ouvrir");
    window.open(data.signedUrl, "_blank", "noopener");
  };

  const removeVaccine = async (id: string) => {
    if (!confirm("Supprimer ce vaccin ?")) return;
    await supabase.from("family_vaccinations").delete().eq("id", id);
    onVaccineChanged();
  };

  if (!profile) return null;
  const age = profile.birth_date ? differenceInYears(new Date(), new Date(profile.birth_date)) : null;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
              {profile.first_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p>{profile.first_name}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {profile.relation}{age !== null ? ` · ${age} ans` : ""}{profile.blood_type ? ` · ${profile.blood_type}` : ""}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Médical résumé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SummaryBlock icon={AlertTriangle} tone="rose" title="Allergies" content={profile.allergies || "—"} />
            <SummaryBlock icon={Pill} tone="sky" title="Traitements" content={profile.current_treatments || "—"} />
            <SummaryBlock icon={Stethoscope} tone="sage" title="Diagnostics" content={profile.diagnoses || "—"} />
            <SummaryBlock icon={Heart} tone="sand" title="Antécédents" content={profile.medical_history || "—"} />
          </div>

          {/* Contacts */}
          {(profile.doctor_name || profile.doctor_phone || profile.emergency_contact_name) && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Contacts</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1.5">
                {profile.doctor_name && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.doctor_name}</span>
                    {profile.doctor_phone && (
                      <a href={`tel:${profile.doctor_phone}`} className="ml-auto text-primary hover:underline text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {profile.doctor_phone}
                      </a>
                    )}
                  </div>
                )}
                {profile.emergency_contact_name && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.emergency_contact_name}</span>
                    {profile.emergency_contact_phone && (
                      <a href={`tel:${profile.emergency_contact_phone}`} className="ml-auto text-primary hover:underline text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {profile.emergency_contact_phone}
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vaccins */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Syringe className="h-4 w-4" /> Carnet de vaccination</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setAddVacOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {vaccinations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun vaccin enregistré.</p>
              ) : (
                vaccinations.map((v) => {
                  const daysLeft = v.next_due_date ? differenceInDays(new Date(v.next_due_date), new Date()) : null;
                  const tone = daysLeft == null ? "text-muted-foreground"
                    : daysLeft < 0 ? "text-rose-600"
                    : daysLeft <= 60 ? "text-amber-600"
                    : "text-muted-foreground";
                  return (
                    <div key={v.id} className="flex items-center justify-between py-1.5 border-b last:border-0 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{v.vaccine_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.date_given ? `Fait le ${format(new Date(v.date_given), "d MMM yyyy", { locale: fr })}` : "Date inconnue"}
                          {v.next_due_date && (
                            <> · <span className={tone}>
                              Rappel {format(new Date(v.next_due_date), "d MMM yyyy", { locale: fr })}
                              {daysLeft != null && (daysLeft < 0 ? ` (retard ${Math.abs(daysLeft)}j)` : ` (dans ${daysLeft}j)`)}
                            </span></>
                          )}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeVaccine(v.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/sante/profils-familiaux">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Gérer
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document.</p>
              ) : (
                documents.slice(0, 5).map((d) => (
                  <button key={d.id} onClick={() => openDoc(d)} className="flex items-center gap-2 w-full py-1.5 border-b last:border-0 text-sm text-left hover:text-primary">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{d.file_name}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(d.created_at), "d MMM", { locale: fr })}</span>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {profile.notes && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm">{profile.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="ghost" onClick={() => onDelete(profile)} className="text-rose-600">
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Fermer</Button>
            <Button onClick={() => onEdit(profile)}><Pencil className="h-4 w-4 mr-1" /> Modifier</Button>
          </div>
        </DialogFooter>

        <VaccineDialog
          open={addVacOpen}
          onClose={() => setAddVacOpen(false)}
          userId={userId}
          profileId={profile.id}
          onSaved={onVaccineChanged}
        />
      </DialogContent>
    </Dialog>
  );
}

function SummaryBlock({ icon: Icon, tone, title, content }: { icon: any; tone: "rose" | "sage" | "sky" | "sand"; title: string; content: string }) {
  const cls: Record<string, string> = {
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    sage: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    sand: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium mb-1.5 ${cls[tone]}`}>
        <Icon className="h-3 w-3" /> {title}
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{content}</p>
    </div>
  );
}

function VaccineDialog({
  open, onClose, userId, profileId, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  userId?: string;
  profileId: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(COMMON_VACCINES[0]);
      setCustomName("");
      setDateGiven(format(new Date(), "yyyy-MM-dd"));
      setNextDue("");
      setNotes("");
    }
  }, [open]);

  const save = async () => {
    if (!userId) return;
    const vaccineName = name === "__other__" ? customName.trim() : name;
    if (!vaccineName) return toast.error("Nom du vaccin requis");
    const { error } = await supabase.from("family_vaccinations").insert({
      user_id: userId,
      profile_id: profileId,
      vaccine_name: vaccineName,
      date_given: dateGiven || null,
      next_due_date: nextDue || null,
      notes: notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Vaccin ajouté");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajouter un vaccin</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Vaccin</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMMON_VACCINES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                <SelectItem value="__other__">Autre…</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {name === "__other__" && (
            <div>
              <Label>Nom du vaccin</Label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date d'administration</Label>
              <Input type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
            </div>
            <div>
              <Label>Prochain rappel</Label>
              <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Ex : lot, effet secondaire…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button onClick={save}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
