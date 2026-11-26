import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, format, isToday, isTomorrow, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

type Prio = { text: string; done: boolean };
type Planner = { priorities: Prio[]; mood: string | null; intensity: number | null; meal_lunch: string; meal_dinner: string; note: string; light_day: boolean };
type Todo = { id: string; title: string; done: boolean };
type Ev = { id: string; title: string; event_time: string | null };

const EMPTY: Planner = { priorities: [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }], mood: null, intensity: null, meal_lunch: "", meal_dinner: "", note: "", light_day: false };
const MOODS = ["Épuisée", "Fatiguée", "Ça va", "Bien", "En forme"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);

const Card = ({ title, tone = "card", children }: { title: string; tone?: "card" | "soft"; children: React.ReactNode }) => (
  <section className={`rounded-3xl border p-4 ${tone === "soft" ? "border-primary/20 bg-secondary" : "border-border/70 bg-card"}`}>
    <div className="mb-3 h-[3px] w-full rounded-full bg-primary/40" aria-hidden="true" />
    <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
    {children}
  </section>
);
const Pill = ({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} aria-pressed={active}
    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-secondary"}`}>
    {children}
  </button>
);

export default function DayPlanner({ userId, onChange }: { userId: string; onChange?: () => void }) {
  const [day, setDay] = useState(new Date());
  const key = format(day, "yyyy-MM-dd");
  const [p, setP] = useState<Planner>(EMPTY);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [addingHour, setAddingHour] = useState<number | null>(null);
  const [evTitle, setEvTitle] = useState("");
  const [timer, setTimer] = useState<number | null>(null);
  const saveRef = useRef<number>();

  const load = useCallback(async () => {
    const [pl, td, ev] = await Promise.all([
      supabase.from("daily_planner").select("*").eq("user_id", userId).eq("day", key).maybeSingle(),
      supabase.from("todo_items").select("id,title,done").eq("user_id", userId).or(`due_date.eq.${key},and(due_date.is.null,done.eq.false)`).order("done").order("created_at", { ascending: false }).limit(20),
      supabase.from("agenda_events").select("id,title,event_time").eq("user_id", userId).eq("event_date", key).order("event_time", { nullsFirst: true }),
    ]);
    const d = pl.data as any;
    setP(d ? {
      priorities: [0, 1, 2].map((i) => (d.priorities?.[i] as Prio) ?? { text: "", done: false }),
      mood: d.mood, intensity: d.intensity, meal_lunch: d.meal_lunch ?? "", meal_dinner: d.meal_dinner ?? "", note: d.note ?? "", light_day: d.light_day,
    } : EMPTY);
    setTodos((td.data as Todo[]) ?? []);
    setEvents((ev.data as Ev[]) ?? []);
  }, [userId, key]);
  useEffect(() => { load(); }, [load]);

  const persist = (next: Planner, delay = 600) => {
    setP(next);
    window.clearTimeout(saveRef.current);
    saveRef.current = window.setTimeout(async () => {
      const { error } = await supabase.from("daily_planner").upsert(
        { user_id: userId, day: key, ...next, priorities: next.priorities as any, updated_at: new Date().toISOString() },
        { onConflict: "user_id,day" },
      );
      if (error) toast.error("Je n'ai pas pu enregistrer. Réessaie dans un instant.");
    }, delay);
  };

  useEffect(() => {
    if (timer === null) return;
    if (timer <= 0) { toast.success("Bravo, tu l'as fait. Tu peux t'arrêter là. ❤️"); setTimer(null); return; }
    const t = window.setTimeout(() => setTimer(timer - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timer]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const { error } = await supabase.from("todo_items").insert({ user_id: userId, title: newTodo.trim(), due_date: key });
    if (error) return toast.error("Je n'ai pas pu ajouter la tâche.");
    setNewTodo(""); load(); onChange?.();
  };
  const toggleTodo = async (t: Todo) => { await supabase.from("todo_items").update({ done: !t.done }).eq("id", t.id); load(); onChange?.(); };
  const addEvent = async () => {
    if (!evTitle.trim() || addingHour === null) return;
    const { error } = await supabase.from("agenda_events").insert({ user_id: userId, title: evTitle.trim(), event_date: key, event_time: `${String(addingHour).padStart(2, "0")}:00`, category: "perso" });
    if (error) return toast.error("Je n'ai pas pu ajouter ce moment.");
    setEvTitle(""); setAddingHour(null); load(); onChange?.();
  };
  const removeEvent = async (id: string) => { await supabase.from("agenda_events").delete().eq("id", id); load(); onChange?.(); };

  const dayLabel = isToday(day) ? "Aujourd'hui" : isTomorrow(day) ? "Demain" : isYesterday(day) ? "Hier" : format(day, "EEEE", { locale: fr });
  const prios = p.light_day ? p.priorities.slice(0, 1) : p.priorities;
  const noTime = events.filter((e) => !e.event_time);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold first-letter:uppercase text-foreground">{format(day, "EEEE d MMMM yyyy", { locale: fr })}</h2>
          <p className="text-sm text-muted-foreground">{dayLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill onClick={() => setDay(addDays(day, -1))}><ChevronLeft className="-ml-1 inline h-4 w-4" />Veille</Pill>
          <Pill onClick={() => setDay(addDays(day, 1))}>Lendemain<ChevronRight className="-mr-1 inline h-4 w-4" /></Pill>
          <Pill active={p.light_day} onClick={() => persist({ ...p, light_day: !p.light_day }, 0)}>Journée légère</Pill>
        </div>
      </div>
      {!isToday(day) && <button className="text-sm font-medium text-primary underline" onClick={() => setDay(new Date())}>Revenir à aujourd'hui</button>}
      {p.light_day && <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">Journée légère : une seule priorité. Le reste peut attendre. ❤️</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card title={p.light_day ? "Ma priorité" : "Mes trois priorités"}>
            <div className="divide-y divide-border">
              {prios.map((pr, i) => (
                <label key={i} className="flex items-center gap-3 py-2">
                  <Checkbox checked={pr.done} onCheckedChange={() => { const a = [...p.priorities]; a[i] = { ...pr, done: !pr.done }; persist({ ...p, priorities: a }, 0); }} aria-label={`Priorité ${i + 1} faite`} />
                  <input value={pr.text} placeholder={`Priorité ${i + 1}`}
                    onChange={(e) => { const a = [...p.priorities]; a[i] = { ...pr, text: e.target.value }; persist({ ...p, priorities: a }); }}
                    className={`w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground ${pr.done ? "text-muted-foreground line-through" : "text-foreground"}`} />
                </label>
              ))}
            </div>
          </Card>

          <Card title="À faire">
            {todos.length > 0 && (
              <ul className="mb-3 space-y-2">
                {todos.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <Checkbox checked={t.done} onCheckedChange={() => toggleTodo(t)} aria-label={t.title} />
                    <span className={`text-[15px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 rounded-xl border border-dashed border-primary/40 p-1.5">
              <input value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder="Ajouter une tâche" className="min-w-0 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-muted-foreground" />
              <button onClick={addTodo} aria-label="Ajouter la tâche" className="rounded-lg bg-primary p-2 text-primary-foreground"><Plus className="h-4 w-4" /></button>
            </div>
          </Card>

          {!p.light_day && (
            <Card title="Me lancer">
              <p className="mb-3 text-sm text-muted-foreground">Choisis une petite durée et commence. Tu as le droit de t'arrêter après.</p>
              {timer !== null ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tabular-nums text-foreground">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}</span>
                  <Pill onClick={() => setTimer(null)}>J'arrête</Pill>
                </div>
              ) : (
                <div className="flex gap-2">{[5, 10, 15].map((m) => <Pill key={m} onClick={() => setTimer(m * 60)}>{m} min</Pill>)}</div>
              )}
            </Card>
          )}

          <Card title="Mes routines">
            <p className="mb-3 text-sm text-muted-foreground">Tes petites habitudes du jour se cochent ici.</p>
            <Link to="/moi/habitudes" className="inline-block rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground">Ouvrir mes routines</Link>
          </Card>

          <Card title="Repas">
            {([["meal_lunch", "Midi", "Ce qu'on mange à midi"], ["meal_dinner", "Soir", "Ce qu'on mange ce soir"]] as const).map(([k, l, ph]) => (
              <div key={k} className="mb-2">
                <p className="text-xs font-semibold text-foreground">{l}</p>
                <input value={p[k]} placeholder={ph} onChange={(e) => persist({ ...p, [k]: e.target.value })}
                  className="w-full border-b border-border bg-transparent py-2 text-[15px] outline-none placeholder:text-muted-foreground" />
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Mon humeur">
            <div className="flex flex-wrap gap-2">{MOODS.map((m) => <Pill key={m} active={p.mood === m} onClick={() => persist({ ...p, mood: p.mood === m ? null : m }, 0)}>{m}</Pill>)}</div>
            <p className="mb-2 mt-4 text-xs font-semibold text-foreground">Intensité de ce que je ressens</p>
            <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => persist({ ...p, intensity: p.intensity === n ? null : n }, 0)} aria-pressed={p.intensity === n}
                className={`h-11 w-11 rounded-full border text-sm font-semibold ${p.intensity === n ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>{n}</button>
            ))}</div>
            <p className="mt-2 text-xs text-muted-foreground">1 : à peine. 5 : ça prend toute la place.</p>
          </Card>

          <Card title="Une note pour moi" tone="soft">
            <textarea value={p.note} onChange={(e) => persist({ ...p, note: e.target.value })} rows={4} placeholder="Ce que je veux garder de cette journée"
              className="w-full rounded-xl border border-border bg-background p-3 text-[15px] outline-none placeholder:text-muted-foreground" />
          </Card>

          <Card title="Ma journée">
            {noTime.map((e) => <p key={e.id} className="mb-2 rounded-lg bg-secondary px-3 py-2 text-sm">{e.title} <span className="text-muted-foreground">· toute la journée</span></p>)}
            <div>
              {HOURS.map((h) => {
                const here = events.filter((e) => e.event_time && Number(e.event_time.slice(0, 2)) === h);
                return (
                  <div key={h} className="flex min-h-[44px] items-start gap-3 border-b border-border/70 py-1.5">
                    <span className="w-9 pt-1.5 text-sm font-semibold text-foreground">{h}h</span>
                    <div className="flex-1 space-y-1">
                      {here.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-1.5 text-sm text-foreground">
                          <span>{e.event_time!.slice(0, 5)} · {e.title}</span>
                          <button onClick={() => removeEvent(e.id)} aria-label={`Supprimer ${e.title}`}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                        </div>
                      ))}
                      {addingHour === h ? (
                        <div className="flex gap-2">
                          <input autoFocus value={evTitle} onChange={(e) => setEvTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEvent()}
                            placeholder="Qu'est-ce qui se passe ?" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none" />
                          <button onClick={addEvent} className="rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">OK</button>
                        </div>
                      ) : here.length === 0 && (
                        <button onClick={() => { setAddingHour(h); setEvTitle(""); }} className="h-8 w-full text-left text-sm text-muted-foreground/40 hover:text-muted-foreground" aria-label={`Ajouter quelque chose à ${h}h`}>+ Ajouter</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
