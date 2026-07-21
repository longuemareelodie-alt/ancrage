import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar, CheckSquare, ShoppingCart, StickyNote, Plus, Trash2, Pin, MapPin, Clock, Bell } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { fr } from "date-fns/locale";

type AgendaEvent = { id: string; title: string; description: string | null; event_date: string; event_time: string | null; location: string | null; category: string; reminder_offset_hours: number };
type Todo = { id: string; title: string; done: boolean; priority: string; due_date: string | null; category: string; reminder_offset_hours: number };

const AGENDA_OFFSETS: { value: number; label: string }[] = [
  { value: 1, label: "1h avant" },
  { value: 3, label: "3h avant" },
  { value: 12, label: "12h avant" },
  { value: 24, label: "24h avant" },
  { value: 48, label: "2 jours avant" },
  { value: 72, label: "3 jours avant" },
];
const TODO_OFFSETS: { value: number; label: string }[] = [
  { value: 0, label: "Le jour même" },
  { value: 24, label: "1 jour avant" },
  { value: 48, label: "2 jours avant" },
  { value: 72, label: "3 jours avant" },
];
type ShopItem = { id: string; name: string; quantity: string | null; category: string; checked: boolean; list_name: string };
type Note = { id: string; title: string | null; content: string; color: string; pinned: boolean; updated_at: string };

const EVENT_CATS = ["perso", "famille", "santé", "travail", "autre"];
const SHOP_CATS = ["fruits/légumes", "épicerie", "frais", "hygiène", "maison", "autre"];
const NOTE_COLORS = ["ivoire", "rose", "bleu", "vert", "jaune"];
const COLOR_CLASS: Record<string, string> = {
  ivoire: "bg-[#faf7f2] border-[#e8dfd0]",
  rose: "bg-[#fce7ec] border-[#f5c6d2]",
  bleu: "bg-[#e0e9f5] border-[#c1d3ea]",
  vert: "bg-[#e5efe0] border-[#c5dcb8]",
  jaune: "bg-[#fdf5d4] border-[#f0e39a]",
};

export default function Organisation() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#f5ede1] pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <header className="mb-6 text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-[#2d3748]">📅 Organisation</h1>
          <p className="text-sm text-[#6b7280] mt-2">Ton quotidien, allégé et centralisé.</p>
        </header>

        <RemindersToggle userId={user.id} />

        <Tabs defaultValue="agenda" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6 bg-white/60">
            <TabsTrigger value="agenda"><Calendar className="w-4 h-4 mr-1" />Agenda</TabsTrigger>
            <TabsTrigger value="todo"><CheckSquare className="w-4 h-4 mr-1" />À faire</TabsTrigger>
            <TabsTrigger value="courses"><ShoppingCart className="w-4 h-4 mr-1" />Courses</TabsTrigger>
            <TabsTrigger value="notes"><StickyNote className="w-4 h-4 mr-1" />Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda"><AgendaTab userId={user.id} /></TabsContent>
          <TabsContent value="todo"><TodoTab userId={user.id} /></TabsContent>
          <TabsContent value="courses"><CoursesTab userId={user.id} /></TabsContent>
          <TabsContent value="notes"><NotesTab userId={user.id} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- REMINDERS TOGGLE ---------------- */
function RemindersToggle({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("reminders_enabled").eq("user_id", userId).single().then(({ data }) => {
      setEnabled(data?.reminders_enabled !== false);
      setLoading(false);
    });
  }, [userId]);

  const toggle = async (v: boolean) => {
    setEnabled(v);
    const { error } = await supabase.from("profiles").update({ reminders_enabled: v }).eq("user_id", userId);
    if (error) { toast.error("Impossible de mettre à jour"); setEnabled(!v); return; }
    toast.success(v ? "Rappels activés 🔔" : "Rappels désactivés");
  };

  if (loading) return null;
  return (
    <Card className="p-4 mb-4 bg-white/80 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-[#5b8def]" />
        <div>
          <p className="text-sm font-medium">Rappels par e-mail & notifications</p>
          <p className="text-xs text-[#6b7280]">Événements : la veille · Tâches : le matin de l'échéance</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={toggle} />
    </Card>
  );
}

/* ---------------- AGENDA ---------------- */
function AgendaTab({ userId }: { userId: string }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("perso");
  const [description, setDescription] = useState("");
  const [reminderOffset, setReminderOffset] = useState<number>(24);

  const load = async () => {
    const { data } = await supabase.from("agenda_events").select("*").eq("user_id", userId).order("event_date").order("event_time", { nullsFirst: true });
    setEvents((data as any) || []);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!title || !date) return toast.error("Titre et date requis");
    const { error } = await supabase.from("agenda_events").insert({ user_id: userId, title, event_date: date, event_time: time || null, location: location || null, category, description: description || null, reminder_offset_hours: reminderOffset });
    if (error) return toast.error(error.message);
    toast.success("Événement ajouté");
    setTitle(""); setDate(""); setTime(""); setLocation(""); setDescription(""); setReminderOffset(24);
    load();
  };
  const updateOffset = async (id: string, value: number) => {
    await supabase.from("agenda_events").update({ reminder_offset_hours: value, reminder_sent_at: null }).eq("id", id);
    toast.success("Rappel mis à jour");
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("agenda_events").delete().eq("id", id);
    load();
  };

  const labelFor = (d: string) => {
    const dt = parseISO(d);
    if (isToday(dt)) return "Aujourd'hui";
    if (isTomorrow(dt)) return "Demain";
    return format(dt, "EEEE d MMMM", { locale: fr });
  };
  const grouped = events.reduce<Record<string, AgendaEvent[]>>((acc, e) => {
    (acc[e.event_date] ||= []).push(e); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3 bg-white/80">
        <h3 className="font-serif text-lg">Nouvel événement</h3>
        <Input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <Input placeholder="Lieu (optionnel)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{EVENT_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#6b7280]" />
          <Select value={String(reminderOffset)} onValueChange={(v) => setReminderOffset(Number(v))}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Rappel" /></SelectTrigger>
            <SelectContent>{AGENDA_OFFSETS.map((o) => <SelectItem key={o.value} value={String(o.value)}>Rappel : {o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea placeholder="Notes (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <Button onClick={add} className="w-full"><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
      </Card>

      {Object.keys(grouped).length === 0 && <p className="text-center text-sm text-[#6b7280] py-8">Aucun événement pour l'instant.</p>}
      {Object.entries(grouped).map(([d, evs]) => (
        <div key={d}>
          <h4 className="font-serif text-sm text-[#6b7280] mb-2 capitalize">{labelFor(d)}</h4>
          <div className="space-y-2">
            {evs.map((e) => (
              <Card key={e.id} className="p-3 flex items-start justify-between bg-white/80">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{e.title}</span>
                    <Badge variant="secondary" className="text-xs">{e.category}</Badge>
                  </div>
                  <div className="text-xs text-[#6b7280] mt-1 flex flex-wrap gap-3">
                    {e.event_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.event_time.slice(0, 5)}</span>}
                    {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                  </div>
                  {e.description && <p className="text-xs text-[#4b5563] mt-1">{e.description}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- TODO ---------------- */
function TodoTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");

  const load = async () => {
    const { data } = await supabase.from("todo_items").select("*").eq("user_id", userId).order("done").order("due_date", { nullsFirst: false }).order("created_at", { ascending: false });
    setItems((data as any) || []);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!title) return;
    const { error } = await supabase.from("todo_items").insert({ user_id: userId, title, priority, due_date: dueDate || null });
    if (error) return toast.error(error.message);
    setTitle(""); setDueDate(""); setPriority("normal");
    load();
  };
  const toggle = async (t: Todo) => {
    await supabase.from("todo_items").update({ done: !t.done }).eq("id", t.id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("todo_items").delete().eq("id", id);
    load();
  };

  const activeCount = items.filter((i) => !i.done).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-white/80">
        <div className="flex gap-2">
          <Input placeholder="Nouvelle tâche..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="basse">Priorité basse</SelectItem>
              <SelectItem value="normal">Normale</SelectItem>
              <SelectItem value="haute">Priorité haute</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </Card>

      <p className="text-xs text-[#6b7280]">{activeCount} tâche{activeCount > 1 ? "s" : ""} en cours</p>

      <div className="space-y-2">
        {items.map((t) => {
          const overdue = t.due_date && !t.done && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date));
          return (
            <Card key={t.id} className={`p-3 flex items-center gap-3 bg-white/80 ${t.done ? "opacity-50" : ""}`}>
              <Checkbox checked={t.done} onCheckedChange={() => toggle(t)} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${t.done ? "line-through" : ""}`}>{t.title}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {t.priority === "haute" && <Badge variant="destructive" className="text-xs">Haute</Badge>}
                  {t.priority === "basse" && <Badge variant="outline" className="text-xs">Basse</Badge>}
                  {t.due_date && <span className={`text-xs ${overdue ? "text-red-600" : "text-[#6b7280]"}`}>{format(parseISO(t.due_date), "d MMM", { locale: fr })}</span>}
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4" /></Button>
            </Card>
          );
        })}
        {items.length === 0 && <p className="text-center text-sm text-[#6b7280] py-8">Aucune tâche.</p>}
      </div>
    </div>
  );
}

/* ---------------- COURSES ---------------- */
function CoursesTab({ userId }: { userId: string }) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("autre");

  const load = async () => {
    const { data } = await supabase.from("shopping_items").select("*").eq("user_id", userId).order("checked").order("category").order("created_at", { ascending: false });
    setItems((data as any) || []);
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!name) return;
    const { error } = await supabase.from("shopping_items").insert({ user_id: userId, name, quantity: quantity || null, category });
    if (error) return toast.error(error.message);
    setName(""); setQuantity("");
    load();
  };
  const toggle = async (it: ShopItem) => {
    await supabase.from("shopping_items").update({ checked: !it.checked }).eq("id", it.id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("shopping_items").delete().eq("id", id);
    load();
  };
  const clearChecked = async () => {
    await supabase.from("shopping_items").delete().eq("user_id", userId).eq("checked", true);
    load();
    toast.success("Articles cochés supprimés");
  };

  const grouped = items.reduce<Record<string, ShopItem[]>>((acc, it) => {
    (acc[it.category] ||= []).push(it); return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-white/80">
        <div className="flex gap-2">
          <Input placeholder="Article" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className="flex-1" />
          <Input placeholder="Qté" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20" />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>{SHOP_CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={add}><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
        </div>
      </Card>

      {items.some((i) => i.checked) && (
        <Button variant="outline" size="sm" onClick={clearChecked} className="w-full">Vider les articles cochés</Button>
      )}

      {Object.keys(grouped).length === 0 && <p className="text-center text-sm text-[#6b7280] py-8">Ta liste est vide.</p>}
      {Object.entries(grouped).map(([cat, its]) => (
        <div key={cat}>
          <h4 className="font-serif text-sm text-[#6b7280] mb-2 capitalize">{cat}</h4>
          <div className="space-y-1">
            {its.map((it) => (
              <Card key={it.id} className={`p-2 flex items-center gap-3 bg-white/80 ${it.checked ? "opacity-50" : ""}`}>
                <Checkbox checked={it.checked} onCheckedChange={() => toggle(it)} />
                <div className="flex-1">
                  <span className={`text-sm ${it.checked ? "line-through" : ""}`}>{it.name}</span>
                  {it.quantity && <span className="text-xs text-[#6b7280] ml-2">× {it.quantity}</span>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4" /></Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- NOTES ---------------- */
function NotesTab({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("ivoire");

  const load = async () => {
    const { data } = await supabase.from("organisation_notes").select("*").eq("user_id", userId).order("pinned", { ascending: false }).order("updated_at", { ascending: false });
    setNotes((data as any) || []);
  };
  useEffect(() => { load(); }, [userId]);

  const save = async () => {
    if (!content.trim() && !title.trim()) return;
    if (editing) {
      await supabase.from("organisation_notes").update({ title: title || null, content, color }).eq("id", editing.id);
    } else {
      await supabase.from("organisation_notes").insert({ user_id: userId, title: title || null, content, color });
    }
    setEditing(null); setTitle(""); setContent(""); setColor("ivoire");
    load();
  };
  const startEdit = (n: Note) => {
    setEditing(n); setTitle(n.title || ""); setContent(n.content); setColor(n.color);
  };
  const cancel = () => { setEditing(null); setTitle(""); setContent(""); setColor("ivoire"); };
  const remove = async (id: string) => { await supabase.from("organisation_notes").delete().eq("id", id); load(); };
  const togglePin = async (n: Note) => {
    await supabase.from("organisation_notes").update({ pinned: !n.pinned }).eq("id", n.id);
    load();
  };

  return (
    <div className="space-y-4">
      <Card className={`p-4 space-y-3 border ${COLOR_CLASS[color]}`}>
        <h3 className="font-serif text-lg">{editing ? "Modifier la note" : "Nouvelle note"}</h3>
        <Input placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white/60" />
        <Textarea placeholder="Écris ici..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="bg-white/60" />
        <div className="flex gap-2 items-center">
          <span className="text-xs text-[#6b7280]">Couleur :</span>
          {NOTE_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${COLOR_CLASS[c]} ${color === c ? "ring-2 ring-[#2d3748]" : ""}`} aria-label={c} />
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={save} className="flex-1">{editing ? "Enregistrer" : "Ajouter"}</Button>
          {editing && <Button variant="outline" onClick={cancel}>Annuler</Button>}
        </div>
      </Card>

      {notes.length === 0 && <p className="text-center text-sm text-[#6b7280] py-8">Aucune note.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notes.map((n) => (
          <Card key={n.id} className={`p-3 border ${COLOR_CLASS[n.color] || COLOR_CLASS.ivoire}`}>
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium text-sm">{n.title || "Sans titre"}</h4>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin(n)}>
                  <Pin className={`w-3 h-3 ${n.pinned ? "fill-current" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(n.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap text-[#4b5563] cursor-pointer" onClick={() => startEdit(n)}>{n.content}</p>
            <p className="text-[10px] text-[#9ca3af] mt-2">{format(parseISO(n.updated_at), "d MMM yyyy", { locale: fr })}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
