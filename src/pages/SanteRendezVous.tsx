import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import { ArrowLeft, Plus, Trash2, Calendar, MapPin, Bell, Save, CalendarPlus, Download } from "lucide-react";
import { toast } from "sonner";
import { buildGoogleCalendarUrl, downloadICS } from "@/lib/calendarExport";

interface Appointment {
  id: string;
  title: string;
  appointment_at: string;
  location: string;
  notes: string;
}

const empty = { title: "", date: "", time: "", location: "", notes: "" };

const SanteRendezVous = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Appointment[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("id, title, appointment_at, location, notes")
      .eq("user_id", user.id)
      .order("appointment_at", { ascending: true });
    if (data) setItems(data as any);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user || !editing || !editing.title || !editing.date || !editing.time) return;
    setSaving(true);
    const iso = new Date(`${editing.date}T${editing.time}`).toISOString();
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      title: editing.title,
      appointment_at: iso,
      location: editing.location,
      notes: editing.notes,
    });
    if (error) toast.error("Erreur lors de l'enregistrement");
    else {
      toast.success("Rendez-vous enregistré ✨");
      setEditing(null);
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">📅 Mes Rendez-vous</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu recevras un rappel par email <strong>24h</strong> et <strong>1h</strong> avant chaque RDV.
        </p>
      </SectionBlock>

      <SectionBlock>
        {!editing && (
          <button
            onClick={() => setEditing(empty)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Nouveau rendez-vous
          </button>
        )}

        {editing && (
          <div className="mb-4 space-y-3 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="Ex : Médecin généraliste"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={editing.date}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="time"
                value={editing.time}
                onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <input
              type="text"
              value={editing.location}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              placeholder="Lieu (optionnel)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              placeholder="Notes (optionnel)"
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving || !editing.title || !editing.date || !editing.time}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" /> {saving ? "..." : "Enregistrer"}
              </button>
              <button onClick={() => setEditing(null)} className="rounded-lg bg-secondary px-4 py-2 text-xs font-medium">
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {items.length === 0 && !editing && (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun rendez-vous prévu.</p>
          )}
          {items.map((a) => {
            const d = new Date(a.appointment_at);
            const past = d.getTime() < Date.now();
            return (
              <div key={a.id} className={`rounded-2xl bg-card p-4 shadow-sm ${past ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à{" "}
                      {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {a.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {a.location}
                      </div>
                    )}
                    {a.notes && <p className="mt-2 text-xs text-muted-foreground">{a.notes}</p>}
                    {!past && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        <Bell className="h-3 w-3" /> Rappels actifs
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionBlock>
    </div>
  );
};

export default SanteRendezVous;
