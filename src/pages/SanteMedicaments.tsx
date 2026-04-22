import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import { ArrowLeft, Plus, Trash2, Save, Pill, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule_times: string[];
  active: boolean;
  notes: string;
}

const empty = { name: "", dosage: "", frequency: "", schedule_times: [] as string[], notes: "" };

const SanteMedicaments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Medication[]>([]);
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [newTime, setNewTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("medications")
      .select("id, name, dosage, frequency, schedule_times, active, notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setItems(data as any);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user || !editing || !editing.name) return;
    setSaving(true);
    const { error } = await supabase.from("medications").insert({
      user_id: user.id,
      name: editing.name,
      dosage: editing.dosage,
      frequency: editing.frequency,
      schedule_times: editing.schedule_times,
      notes: editing.notes,
    });
    if (error) toast.error("Erreur lors de l'enregistrement");
    else {
      toast.success("Médicament ajouté ✨");
      setEditing(null);
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await supabase.from("medications").delete().eq("id", id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const addTime = () => {
    if (!editing || !newTime) return;
    if (editing.schedule_times.includes(newTime)) return;
    setEditing({ ...editing, schedule_times: [...editing.schedule_times, newTime].sort() });
  };

  const removeTime = (t: string) => {
    if (!editing) return;
    setEditing({ ...editing, schedule_times: editing.schedule_times.filter((x) => x !== t) });
  };

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">💊 Mes Médicaments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu recevras un rappel chaque jour aux horaires définis (email + notification).
        </p>
      </SectionBlock>

      <SectionBlock>
        {!editing && (
          <button
            onClick={() => setEditing(empty)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Ajouter un médicament
          </button>
        )}

        {editing && (
          <div className="mb-4 space-y-3 rounded-2xl bg-card p-4 shadow-sm">
            <input
              type="text"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Nom du médicament"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={editing.dosage}
              onChange={(e) => setEditing({ ...editing, dosage: e.target.value })}
              placeholder="Dosage (ex : 500mg)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={editing.frequency}
              onChange={(e) => setEditing({ ...editing, frequency: e.target.value })}
              placeholder="Fréquence (ex : 2 fois par jour)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Horaires de prise</p>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                />
                <button onClick={addTime} className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium">
                  + Ajouter
                </button>
              </div>
              {editing.schedule_times.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {editing.schedule_times.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                      <Clock className="h-3 w-3" /> {t}
                      <button onClick={() => removeTime(t)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <textarea
              value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              placeholder="Notes (avant/après repas...)"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving || !editing.name}
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
            <p className="py-8 text-center text-sm text-muted-foreground">Aucun médicament enregistré.</p>
          )}
          {items.map((m) => (
            <div key={m.id} className="rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">{m.name}</p>
                  </div>
                  {m.dosage && <p className="mt-1 text-xs text-muted-foreground">{m.dosage} — {m.frequency}</p>}
                  {m.schedule_times.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.schedule_times.map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          <Clock className="h-3 w-3" /> {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.notes && <p className="mt-2 text-xs italic text-muted-foreground">{m.notes}</p>}
                </div>
                <button onClick={() => remove(m.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
};

export default SanteMedicaments;
