import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bell, Calendar, CheckSquare, ChevronDown, Clock, MapPin, Pin, Plus, ShoppingCart, StickyNote, Trash2,
  type LucideIcon,
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import MascotPicker from "@/components/pulse/MascotPicker";
import VoiceDictationButton from "@/components/VoiceDictationButton";
import { guessDomain, mascotOf, type PulseDomain } from "@/data/pulseMascots";

type AgendaEvent = { id: string; title: string; description: string | null; event_date: string; event_time: string | null; location: string | null; category: string; reminder_offset_hours: number };
type Todo = { id: string; title: string; done: boolean; priority: string; due_date: string | null; category: string; reminder_offset_hours: number; domain: string | null; profile_id: string | null };
type FamilyMember = { id: string; first_name: string };
type ShopItem = { id: string; name: string; quantity: string | null; category: string; checked: boolean; list_name: string };
type Note = { id: string; title: string | null; content: string; color: string; pinned: boolean; updated_at: string };
type TabKey = "agenda" | "todo" | "courses" | "notes";

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

const EVENT_CATS = ["perso", "famille", "santé", "travail", "autre"];
const EVENT_DOT: Record<string, string> = {
  perso: "bg-primary",
  famille: "bg-accent",
  "santé": "bg-sage",
  travail: "bg-night",
  autre: "bg-muted-foreground/50",
};
const SHOP_CATS = ["fruits/légumes", "épicerie", "frais", "hygiène", "maison", "autre"];
const NOTE_COLORS = ["ivoire", "rose", "bleu", "vert", "jaune"];
const COLOR_CLASS: Record<string, string> = {
  ivoire: "bg-note-ivoire",
  rose: "bg-note-rose",
  bleu: "bg-note-bleu",
  vert: "bg-note-vert",
  jaune: "bg-note-jaune",
};

const todayKey = () => format(new Date(), "yyyy-MM-dd");

/* ---------------- Petits éléments de style partagés ---------------- */
const Panel = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-[1.5rem] border border-border/70 bg-card p-4 shadow-[0_10px_30px_-22px_hsl(var(--night)/0.35)] ${className}`}>
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 mt-1 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground first-letter:uppercase">
    {children}
  </p>
);

const Empty = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => (
  <div className="flex flex-col items-center px-6 py-10 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
      <Icon className="h-6 w-6 text-primary-dark" aria-hidden="true" />
    </span>
    <p className="mt-4 text-[15px] font-semibold text-foreground">{title}</p>
    <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{text}</p>
  </div>
);

const MoreToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    aria-expanded={open}
  >
    {open ? "Moins d'options" : "Plus d'options"}
    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
  </button>
);

/* ---------------- PAGE ---------------- */
export default function Organisation() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>("agenda");
  const [stats, setStats] = useState<{ today: number; todo: number; courses: number; next: AgendaEvent | null } | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    const t = todayKey();
    const [today, todo, courses, next] = await Promise.all([
      supabase.from("agenda_events").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("event_date", t),
      supabase.from("todo_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("done", false),
      supabase.from("shopping_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("checked", false),
      supabase.from("agenda_events").select("*").eq("user_id", user.id).gte("event_date", t)
        .order("event_date").order("event_time", { nullsFirst: true }).limit(1),
    ]);
    setStats({
      today: today.count ?? 0,
      todo: todo.count ?? 0,
      courses: courses.count ?? 0,
      next: ((next.data as AgendaEvent[] | null) ?? [])[0] ?? null,
    });
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!user) return null;

  const tiles: { key: TabKey; value: number | string; label: string }[] = [
    { key: "agenda", value: stats?.today ?? "–", label: "rendez-vous aujourd'hui" },
    { key: "todo", value: stats?.todo ?? "–", label: (stats?.todo ?? 0) > 1 ? "choses à faire" : "chose à faire" },
    { key: "courses", value: stats?.courses ?? "–", label: (stats?.courses ?? 0) > 1 ? "articles à acheter" : "article à acheter" },
  ];

  const nextLabel = (e: AgendaEvent) => {
    const d = parseISO(e.event_date);
    const day = isToday(d) ? "aujourd'hui" : isTomorrow(d) ? "demain" : format(d, "EEEE d MMMM", { locale: fr });
    return `${day}${e.event_time ? ` · ${e.event_time.slice(0, 5)}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {/* En-tête */}
        <header className="relative overflow-hidden rounded-[2rem] bg-night px-5 pb-5 pt-6 text-night-foreground">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
          <p className="font-wide text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Organisation</p>
          <h1 className="mt-2 font-wide text-[clamp(1.55rem,6.6vw,2.4rem)] font-bold uppercase leading-[1] tracking-[-0.01em]">
            Ta maison
            <span className="block text-primary">en un coup d'œil.</span>
          </h1>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                  tab === t.key ? "border-primary/60 bg-night-foreground/10" : "border-night-foreground/15 hover:bg-night-foreground/5"
                }`}
              >
                <span className="block font-wide text-[22px] font-bold leading-none">{t.value}</span>
                <span className="mt-1.5 block text-[11.5px] leading-tight text-night-foreground/70">{t.label}</span>
              </button>
            ))}
          </div>

          {stats?.next && (
            <button
              onClick={() => setTab("agenda")}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-night-foreground/10 px-3 py-2.5 text-left"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] uppercase tracking-[0.16em] text-night-foreground/60">Prochain rendez-vous</span>
                <span className="block truncate text-sm font-medium">
                  {stats.next.title} <span className="font-normal text-night-foreground/70">· {nextLabel(stats.next)}</span>
                </span>
              </span>
            </button>
          )}
        </header>

        <RemindersToggle userId={user.id} />

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="w-full">
          <TabsList className="mb-5 grid h-auto w-full grid-cols-4 rounded-full bg-muted p-1">
            {([
              ["agenda", Calendar, "Agenda"],
              ["todo", CheckSquare, "À faire"],
              ["courses", ShoppingCart, "Courses"],
              ["notes", StickyNote, "Notes"],
            ] as const).map(([v, Icon, label]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="flex flex-col gap-0.5 rounded-full px-1 py-1.5 text-[11.5px] data-[state=active]:bg-card data-[state=active]:shadow-sm sm:flex-row sm:gap-1.5 sm:text-sm"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="agenda"><AgendaTab userId={user.id} onChange={refresh} /></TabsContent>
          <TabsContent value="todo"><TodoTab userId={user.id} onChange={refresh} /></TabsContent>
          <TabsContent value="courses"><CoursesTab userId={user.id} onChange={refresh} /></TabsContent>
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

  if (loading) return <div className="h-4" />;
  return (
    <div className="my-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Bell className="h-4 w-4 text-primary-dark" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">Rappels e-mail et notifications</p>
          <p className="text-xs text-muted-foreground">Rendez-vous : la veille · Tâches : le matin</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={toggle} aria-label="Rappels" />
    </div>
  );
}

/* ---------------- AGENDA ---------------- */
function AgendaTab({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("perso");
  const [description, setDescription] = useState("");
  const [reminderOffset, setReminderOffset] = useState<number>(24);
  const [more, setMore] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("agenda_events").select("*").eq("user_id", userId).order("event_date").order("event_time", { nullsFirst: true });
    setEvents((data as any) || []);
    onChange();
  };
  useEffect(() => { load(); }, [userId]);

  const add = async () => {
    if (!title || !date) return toast.error("Ajoute un titre et une date");
    const { error } = await supabase.from("agenda_events").insert({ user_id: userId, title, event_date: date, event_time: time || null, location: location || null, category, description: description || null, reminder_offset_hours: reminderOffset });
    if (error) return toast.error(error.message);
    toast.success("Rendez-vous ajouté");
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
    <div className="space-y-5">
      <Panel className="space-y-3">
        <div className="flex items-center gap-2">
          <Input placeholder="Nouveau rendez-vous…" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-full bg-background" />
          <VoiceDictationButton onText={(t) => setTitle(t)} label="Dicter le titre" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" className="rounded-full bg-background" />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Heure" className="rounded-full bg-background" />
        </div>
        {more && (
          <div className="space-y-2">
            <Input placeholder="Lieu (optionnel)" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-full bg-background" />
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                    category === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${EVENT_DOT[c]}`} aria-hidden="true" />{c}
                </button>
              ))}
            </div>
            <Select value={String(reminderOffset)} onValueChange={(v) => setReminderOffset(Number(v))}>
              <SelectTrigger className="rounded-full bg-background"><Bell className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Rappel" /></SelectTrigger>
              <SelectContent>{AGENDA_OFFSETS.map((o) => <SelectItem key={o.value} value={String(o.value)}>Rappel : {o.label}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex items-start gap-2">
              <Textarea placeholder="Notes (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-2xl bg-background" />
              <VoiceDictationButton onText={(t) => setDescription(description ? `${description} ${t}` : t)} label="Dicter les notes" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <MoreToggle open={more} onClick={() => setMore((m) => !m)} />
          <Button onClick={add} className="rounded-full px-5"><Plus className="mr-1 h-4 w-4" />Ajouter</Button>
        </div>
      </Panel>

      {Object.keys(grouped).length === 0 && (
        <Empty icon={Calendar} title="Ton agenda est tout léger" text="Ajoute un rendez-vous : Éclosia te le rappellera au bon moment." />
      )}
      {Object.entries(grouped).map(([d, evs]) => (
        <section key={d}>
          <SectionLabel>{labelFor(d)}</SectionLabel>
          <div className="space-y-2">
            {evs.map((e) => (
              <Panel key={e.id} className="flex items-start gap-3 p-3">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-secondary px-1 py-2 text-secondary-foreground">
                  <span className="text-[15px] font-bold leading-none">{e.event_time ? e.event_time.slice(0, 5) : "—"}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-wider opacity-70">{e.event_time ? "heure" : "journée"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{e.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <span className={`h-2 w-2 rounded-full ${EVENT_DOT[e.category] ?? EVENT_DOT.autre}`} aria-hidden="true" />{e.category}
                    </span>
                    {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                  </div>
                  {e.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{e.description}</p>}
                  <div className="mt-2">
                    <Select value={String(e.reminder_offset_hours ?? 24)} onValueChange={(v) => updateOffset(e.id, Number(v))}>
                      <SelectTrigger className="h-7 w-auto min-w-[140px] rounded-full px-2.5 text-xs"><Bell className="mr-1.5 h-3 w-3 text-muted-foreground" /><SelectValue /></SelectTrigger>
                      <SelectContent>{AGENDA_OFFSETS.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => remove(e.id)} aria-label="Supprimer"><Trash2 className="h-4 w-4" /></Button>
              </Panel>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------------- TODO ---------------- */
function TodoTab({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [items, setItems] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState("");
  const [reminderOffset, setReminderOffset] = useState<number>(24);
  const [domain, setDomain] = useState<PulseDomain | null>(null);
  const [profileId, setProfileId] = useState<string>("aucun");
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [more, setMore] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("todo_items").select("*").eq("user_id", userId).order("done").order("due_date", { nullsFirst: false }).order("created_at", { ascending: false });
    setItems((data as any) || []);
    onChange();
  };
  useEffect(() => { load(); }, [userId]);
  useEffect(() => {
    supabase.from("family_medical_profiles").select("id, first_name").eq("user_id", userId).then(({ data }) => setMembers((data as any) || []));
  }, [userId]);

  const add = async () => {
    if (!title) return;
    const { error } = await supabase.from("todo_items").insert({ user_id: userId, title, priority, due_date: dueDate || null, reminder_offset_hours: reminderOffset, domain: domain ?? guessDomain(title), profile_id: profileId === "aucun" ? null : profileId });
    if (error) return toast.error(error.message);
    setTitle(""); setDueDate(""); setPriority("normal"); setReminderOffset(24); setDomain(null); setProfileId("aucun");
    load();
  };
  const updateDomain = async (id: string, value: PulseDomain | null) => {
    await supabase.from("todo_items").update({ domain: value }).eq("id", id);
    load();
  };
  const updateMember = async (id: string, value: string) => {
    await supabase.from("todo_items").update({ profile_id: value === "aucun" ? null : value }).eq("id", id);
    load();
  };
  const nameOf = (id: string | null) => members.find((m) => m.id === id)?.first_name || null;
  const toggle = async (t: Todo) => {
    await supabase.from("todo_items").update({ done: !t.done }).eq("id", t.id);
    load();
  };
  const updateOffset = async (id: string, value: number) => {
    await supabase.from("todo_items").update({ reminder_offset_hours: value, reminder_sent_at: null }).eq("id", id);
    toast.success("Rappel mis à jour");
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("todo_items").delete().eq("id", id);
    load();
  };

  const active = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const row = (t: Todo) => {
    const overdue = t.due_date && !t.done && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date));
    return (
      <Panel key={t.id} className={`flex items-center gap-3 p-3 ${t.done ? "opacity-55" : ""}`}>
        <Checkbox checked={t.done} onCheckedChange={() => toggle(t)} className="h-5 w-5 rounded-full" aria-label={t.done ? "Remettre à faire" : "Marquer comme fait"} />
        <MascotPicker value={t.domain} onChange={(d) => updateDomain(t.id, d)} showLabel={false} />
        <div className="min-w-0 flex-1">
          <p className={`text-[15px] leading-snug ${t.done ? "line-through" : "font-medium"}`}>{t.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {mascotOf(t.domain) && <Badge variant="outline" className="rounded-full text-[11px] font-normal">{mascotOf(t.domain)!.name}</Badge>}
            {nameOf(t.profile_id) && <Badge variant="outline" className="rounded-full border-primary/50 text-[11px] font-normal text-primary-dark">pour {nameOf(t.profile_id)}</Badge>}
            {t.priority === "haute" && <Badge variant="destructive" className="rounded-full text-[11px]">Important</Badge>}
            {t.priority === "basse" && <Badge variant="outline" className="rounded-full text-[11px] font-normal">Peut attendre</Badge>}
            {t.due_date && (
              <span className={`inline-flex items-center gap-1 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                <Clock className="h-3 w-3" />{format(parseISO(t.due_date), "d MMM", { locale: fr })}
              </span>
            )}
          </div>
          {!t.done && (members.length > 0 || t.due_date) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {members.length > 0 && (
                <Select value={t.profile_id ?? "aucun"} onValueChange={(v) => updateMember(t.id, v)}>
                  <SelectTrigger className="h-7 w-auto min-w-[110px] rounded-full px-2.5 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">Pour moi</SelectItem>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>Pour {m.first_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {t.due_date && (
                <Select value={String(t.reminder_offset_hours ?? 24)} onValueChange={(v) => updateOffset(t.id, Number(v))}>
                  <SelectTrigger className="h-7 w-auto min-w-[130px] rounded-full px-2.5 text-xs"><Bell className="mr-1.5 h-3 w-3 text-muted-foreground" /><SelectValue /></SelectTrigger>
                  <SelectContent>{TODO_OFFSETS.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => remove(t.id)} aria-label="Supprimer"><Trash2 className="h-4 w-4" /></Button>
      </Panel>
    );
  };

  return (
    <div className="space-y-5">
      <Panel className="space-y-3">
        <div className="flex items-center gap-2">
          <Input placeholder="Une chose à faire…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className="h-11 rounded-full bg-background" />
          <VoiceDictationButton onText={(t) => setTitle(t)} label="Dicter la tâche" />
          <Button onClick={add} size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label="Ajouter"><Plus className="h-5 w-5" /></Button>
        </div>
        {more && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="rounded-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basse">Peut attendre</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="haute">Important</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Pour quand" className="rounded-full bg-background" />
            </div>
            <Select value={String(reminderOffset)} onValueChange={(v) => setReminderOffset(Number(v))}>
              <SelectTrigger className="rounded-full bg-background"><Bell className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Rappel" /></SelectTrigger>
              <SelectContent>{TODO_OFFSETS.map((o) => <SelectItem key={o.value} value={String(o.value)}>Rappel : {o.label}</SelectItem>)}</SelectContent>
            </Select>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Compagnon :</span>
                <MascotPicker value={domain} onChange={setDomain} />
              </div>
              {members.length > 0 && (
                <Select value={profileId} onValueChange={setProfileId}>
                  <SelectTrigger className="h-9 w-auto min-w-[130px] rounded-full bg-background text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">Pour moi</SelectItem>
                    {members.map((m) => <SelectItem key={m.id} value={m.id}>Pour {m.first_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}
        <MoreToggle open={more} onClick={() => setMore((m) => !m)} />
      </Panel>

      {items.length === 0 && (
        <Empty icon={CheckSquare} title="Rien à porter pour l'instant" text="Pose ici ce qui tourne dans ta tête. Une chose à la fois." />
      )}
      {active.length > 0 && (
        <section>
          <SectionLabel>{active.length} en cours</SectionLabel>
          <div className="space-y-2">{active.map(row)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section>
          <SectionLabel>Fait ✓</SectionLabel>
          <div className="space-y-2">{done.map(row)}</div>
        </section>
      )}
    </div>
  );
}

/* ---------------- COURSES ---------------- */
function CoursesTab({ userId, onChange }: { userId: string; onChange: () => void }) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("autre");

  const load = async () => {
    const { data } = await supabase.from("shopping_items").select("*").eq("user_id", userId).order("checked").order("category").order("created_at", { ascending: false });
    setItems((data as any) || []);
    onChange();
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
    toast.success("Articles cochés retirés");
  };

  const grouped = items.reduce<Record<string, ShopItem[]>>((acc, it) => {
    (acc[it.category] ||= []).push(it); return acc;
  }, {});
  const left = items.filter((i) => !i.checked).length;

  return (
    <div className="space-y-5">
      <Panel className="space-y-3">
        <div className="flex items-center gap-2">
          <Input placeholder="Ajouter un article…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className="h-11 flex-1 rounded-full bg-background" />
          <Input placeholder="Qté" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-11 w-16 rounded-full bg-background text-center" aria-label="Quantité" />
          <Button onClick={add} size="icon" className="h-11 w-11 shrink-0 rounded-full" aria-label="Ajouter"><Plus className="h-5 w-5" /></Button>
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
          {SHOP_CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                category === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Panel>

      {items.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">{left === 0 ? "Tout est dans le panier 🎉" : `${left} article${left > 1 ? "s" : ""} à prendre`}</p>
          {items.some((i) => i.checked) && (
            <Button variant="ghost" size="sm" onClick={clearChecked} className="h-8 rounded-full text-xs">Retirer les cochés</Button>
          )}
        </div>
      )}

      {items.length === 0 && (
        <Empty icon={ShoppingCart} title="Ta liste est vide" text="Ajoute au fil de la semaine, coche au magasin. Plus besoin de tout retenir." />
      )}
      {Object.entries(grouped).map(([cat, its]) => (
        <section key={cat}>
          <SectionLabel>{cat}</SectionLabel>
          <Panel className="divide-y divide-border/70 p-0">
            {its.map((it) => (
              <div key={it.id} className={`flex items-center gap-3 px-4 py-2.5 ${it.checked ? "opacity-50" : ""}`}>
                <Checkbox checked={it.checked} onCheckedChange={() => toggle(it)} className="h-5 w-5 rounded-full" aria-label={it.name} />
                <div className="min-w-0 flex-1">
                  <span className={`text-[15px] ${it.checked ? "line-through" : ""}`}>{it.name}</span>
                  {it.quantity && <span className="ml-2 text-xs text-muted-foreground">× {it.quantity}</span>}
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => remove(it.id)} aria-label="Supprimer"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </Panel>
        </section>
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancel = () => { setEditing(null); setTitle(""); setContent(""); setColor("ivoire"); };
  const remove = async (id: string) => { await supabase.from("organisation_notes").delete().eq("id", id); load(); };
  const togglePin = async (n: Note) => {
    await supabase.from("organisation_notes").update({ pinned: !n.pinned }).eq("id", n.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className={`space-y-3 rounded-[1.5rem] border border-border/70 p-4 ${COLOR_CLASS[color]}`}>
        <p className="text-sm font-semibold">{editing ? "Modifier la note" : "Nouvelle note"}</p>
        <Input placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-full border-border/60 bg-card/70" />
        <div className="flex items-start gap-2">
          <Textarea placeholder="Écris ici…" value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="rounded-2xl border-border/60 bg-card/70" />
          <VoiceDictationButton onText={(t) => setContent(content ? `${content} ${t}` : t)} label="Dicter la note" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border border-border ${COLOR_CLASS[c]} ${color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""}`}
                aria-label={`Couleur ${c}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {editing && <Button variant="ghost" onClick={cancel} className="rounded-full">Annuler</Button>}
            <Button onClick={save} className="rounded-full px-5">{editing ? "Enregistrer" : "Ajouter"}</Button>
          </div>
        </div>
      </div>

      {notes.length === 0 && (
        <Empty icon={StickyNote} title="Aucune note pour l'instant" text="Les codes, les tailles, les idées cadeaux… tout ce qu'on cherche au mauvais moment." />
      )}
      <div className="columns-1 gap-3 sm:columns-2 [&>*]:mb-3">
        {notes.map((n) => (
          <div key={n.id} className={`break-inside-avoid rounded-[1.25rem] border border-border/70 p-4 ${COLOR_CLASS[n.color] || COLOR_CLASS.ivoire}`}>
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold leading-snug">{n.title || "Sans titre"}</p>
              <div className="-mr-2 -mt-1 flex">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin(n)} aria-label={n.pinned ? "Détacher" : "Épingler"}>
                  <Pin className={`h-3.5 w-3.5 ${n.pinned ? "fill-current" : ""}`} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(n.id)} aria-label="Supprimer"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <button type="button" className="block w-full text-left" onClick={() => startEdit(n)}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{n.content}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{format(parseISO(n.updated_at), "d MMM yyyy", { locale: fr })}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
