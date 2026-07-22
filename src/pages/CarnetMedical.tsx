import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookHeart, Plus, Pencil, Trash2, Stethoscope, Hospital,
  FlaskConical, Pill, Activity, MoreHorizontal, Calendar, MapPin, User2,
  AlertTriangle, Heart, Syringe, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format, differenceInYears, parseISO } from "date-fns";
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
}

interface MedicalEvent {
  id: string;
  profile_id: string;
  event_date: string;
  event_type: string;
  title: string;
  practitioner: string | null;
  location: string | null;
  description: string | null;
  document_id: string | null;
}

const EVENT_TYPES: { value: string; label: string; icon: any; tone: string }[] = [
  { value: "consultation", label: "Consultation", icon: Stethoscope, tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  { value: "hospitalisation", label: "Hospitalisation", icon: Hospital, tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  { value: "examen", label: "Examen", icon: FlaskConical, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  { value: "traitement", label: "Traitement", icon: Pill, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { value: "symptome", label: "Symptôme", icon: Activity, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "vaccin", label: "Vaccin", icon: Syringe, tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
  { value: "autre", label: "Autre", icon: MoreHorizontal, tone: "bg-muted text-foreground/70" },
];

const typeMeta = (v: string) => EVENT_TYPES.find((t) => t.value === v) || EVENT_TYPES[EVENT_TYPES.length - 1];

export default function CarnetMedical() {
  const { user } = useAuth();
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MedicalEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const load = async () => {
    if (!user || !profileId) return;
    setLoading(true);
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from("family_medical_profiles").select("*").eq("id", profileId).eq("user_id", user.id).maybeSingle(),
      supabase.from("family_medical_events").select("*").eq("profile_id", profileId).eq("user_id", user.id).order("event_date", { ascending: false }),
    ]);
    setProfile((p as Profile) || null);
    setEvents((e as MedicalEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id, profileId]);

  const filtered = useMemo(() => {
    if (filterType === "all") return events;
    return events.filter((e) => e.event_type === filterType);
  }, [events, filterType]);

  const grouped = useMemo(() => {
    const map = new Map<string, MedicalEvent[]>();
    for (const ev of filtered) {
      const key = format(parseISO(ev.event_date), "yyyy-MM");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    const { error } = await supabase.from("family_medical_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setEvents((es) => es.filter((e) => e.id !== id));
    toast.success("Entrée supprimée");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-muted-foreground">Profil introuvable.</p>
      <Button variant="outline" onClick={() => navigate("/famille")}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
    </div>
  );

  const age = profile.birth_date ? differenceInYears(new Date(), new Date(profile.birth_date)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-4 py-6 pb-24">
        <button onClick={() => navigate("/famille")} className="mb-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à Famille
        </button>

        <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary shrink-0">
              {profile.first_name.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <h1 className="font-playfair text-2xl md:text-3xl text-foreground flex items-center gap-2">
                <BookHeart className="h-6 w-6 text-primary" />
                Carnet de {profile.first_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile.relation || "Membre"}{age !== null ? ` · ${age} an${age > 1 ? "s" : ""}` : ""}
                {profile.blood_type ? ` · Groupe ${profile.blood_type}` : ""}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Résumé médical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <SummaryCard icon={AlertTriangle} tone="rose" title="Allergies" content={profile.allergies} empty="Aucune allergie renseignée" />
          <SummaryCard icon={Heart} tone="violet" title="Diagnostics" content={profile.diagnoses} empty="Aucun diagnostic" />
          <SummaryCard icon={Pill} tone="emerald" title="Traitements en cours" content={profile.current_treatments} empty="Aucun traitement" />
          <SummaryCard icon={FileText} tone="sky" title="Antécédents" content={profile.medical_history} empty="Aucun antécédent" />
        </div>

        {profile.doctor_name && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-medium">Médecin traitant : {profile.doctor_name}</p>
                {profile.doctor_phone && (
                  <a href={`tel:${profile.doctor_phone}`} className="text-xs text-muted-foreground hover:text-primary">{profile.doctor_phone}</a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historique */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-playfair text-xl">Historique</h2>
          <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>

        {/* Filtres */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <FilterChip label="Tout" active={filterType === "all"} onClick={() => setFilterType("all")} count={events.length} />
          {EVENT_TYPES.map((t) => {
            const count = events.filter((e) => e.event_type === t.value).length;
            if (count === 0) return null;
            return <FilterChip key={t.value} label={t.label} active={filterType === t.value} onClick={() => setFilterType(t.value)} count={count} />;
          })}
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookHeart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune entrée dans le carnet.</p>
              <p className="text-xs mt-1">Ajoute une consultation, un examen ou un traitement pour démarrer l'historique.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(([month, evs]) => (
              <div key={month}>
                <p className="mb-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground px-1">
                  {format(parseISO(month + "-01"), "MMMM yyyy", { locale: fr })}
                </p>
                <div className="relative pl-5 border-l border-border/70 space-y-3">
                  {evs.map((ev) => {
                    const meta = typeMeta(ev.event_type);
                    const Icon = meta.icon;
                    return (
                      <motion.div key={ev.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
                        <span className={`absolute -left-2.5 mt-2 flex h-5 w-5 items-center justify-center rounded-full ${meta.tone}`}>
                          <Icon className="h-3 w-3" />
                        </span>
                        <Card>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.tone}`}>
                                    {meta.label}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(parseISO(ev.event_date), "dd MMM yyyy", { locale: fr })}
                                  </span>
                                </div>
                                <p className="mt-1 font-medium text-sm">{ev.title}</p>
                                {(ev.practitioner || ev.location) && (
                                  <p className="mt-0.5 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                                    {ev.practitioner && <span className="inline-flex items-center gap-1"><User2 className="h-3 w-3" />{ev.practitioner}</span>}
                                    {ev.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                                  </p>
                                )}
                                {ev.description && (
                                  <p className="mt-1.5 text-xs text-foreground/80 whitespace-pre-wrap">{ev.description}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 shrink-0">
                                <button onClick={() => { setEditing(ev); setDialogOpen(true); }} className="text-muted-foreground hover:text-primary p-1" aria-label="Modifier">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => remove(ev.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Supprimer">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EventDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        event={editing}
        profileId={profileId!}
        userId={user!.id}
        onSaved={load}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, tone, title, content, empty }: { icon: any; tone: string; title: string; content: string; empty: string }) {
  const toneMap: Record<string, string> = {
    rose: "text-rose-600 dark:text-rose-400",
    violet: "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    sky: "text-sky-600 dark:text-sky-400",
  };
  const has = content && content.trim().length > 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon className={`h-4 w-4 ${toneMap[tone]}`} />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        </div>
        <p className={`text-sm whitespace-pre-wrap ${has ? "text-foreground" : "text-muted-foreground italic"}`}>
          {has ? content : empty}
        </p>
      </CardContent>
    </Card>
  );
}

function FilterChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-muted/70"
      }`}
    >
      {label} <span className="opacity-70">· {count}</span>
    </button>
  );
}

function EventDialog({
  open, onClose, event, profileId, userId, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  event: MedicalEvent | null;
  profileId: string;
  userId: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<MedicalEvent>>({});

  useEffect(() => {
    if (!open) return;
    setForm(event || {
      event_type: "consultation",
      event_date: new Date().toISOString().slice(0, 10),
      title: "",
      practitioner: "",
      location: "",
      description: "",
    });
  }, [open, event]);

  const set = (k: keyof MedicalEvent, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title?.trim()) return toast.error("Titre requis");
    if (!form.event_date) return toast.error("Date requise");
    const payload = {
      event_type: form.event_type || "consultation",
      event_date: form.event_date,
      title: form.title,
      practitioner: form.practitioner || null,
      location: form.location || null,
      description: form.description || null,
    };
    if (event) {
      const { error } = await supabase.from("family_medical_events").update(payload).eq("id", event.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("family_medical_events").insert({ user_id: userId, profile_id: profileId, ...payload });
      if (error) return toast.error(error.message);
    }
    toast.success("Enregistré");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Modifier l'entrée" : "Nouvelle entrée du carnet"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.event_type || "consultation"} onValueChange={(v) => set("event_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.event_date || ""} onChange={(e) => set("event_date", e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Titre *</Label>
            <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Ex : Contrôle pédiatre, IRM du genou…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Praticien</Label>
              <Input value={form.practitioner || ""} onChange={(e) => set("practitioner", e.target.value)} placeholder="Dr…" />
            </div>
            <div>
              <Label>Lieu</Label>
              <Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="Cabinet, hôpital…" />
            </div>
          </div>
          <div>
            <Label>Notes / observations</Label>
            <Textarea rows={4} value={form.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Résultats, prescriptions, ressenti…" />
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
