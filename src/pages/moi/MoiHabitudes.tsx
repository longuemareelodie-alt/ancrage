import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Plus, Trash2 } from "lucide-react";
import { emitPulseChange } from "@/lib/pulseBus";

type Habit = { id: string; name: string; icon: string };

const SUGGESTIONS: [string, string][] = [
  ["💧", "Boire de l'eau"],
  ["💊", "Traitement"],
  ["🧘", "Temps pour moi"],
  ["📓", "Journal"],
  ["🌙", "Routine du soir"],
];

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const isoOf = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

/** Grille de la semaine. Un jour vide reste neutre : jamais d'échec, jamais de série. */
const MoiHabitudes = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");

  const week = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return isoOf(d);
    });
  }, []);
  const today = isoOf(new Date());

  const load = async () => {
    const [h, c] = await Promise.all([
      supabase.from("habits").select("id, name, icon").eq("archived", false).order("created_at"),
      supabase.from("habit_checks").select("habit_id, day").gte("day", week[0]).lte("day", week[6]),
    ]);
    setHabits((h.data ?? []) as Habit[]);
    setChecks(new Set((c.data ?? []).map((x) => `${x.habit_id}|${x.day}`)));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (name: string, icon = "🌿") => {
    const title = name.trim();
    if (!title) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setDraft("");
    await supabase.from("habits").insert({ user_id: auth.user.id, name: title, icon });
    load();
    emitPulseChange();
  };

  const toggle = async (habitId: string, day: string) => {
    const key = `${habitId}|${day}`;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const next = new Set(checks);
    if (checks.has(key)) {
      next.delete(key);
      setChecks(next);
      await supabase.from("habit_checks").delete().eq("habit_id", habitId).eq("day", day);
    } else {
      next.add(key);
      setChecks(next);
      navigator.vibrate?.(8);
      await supabase.from("habit_checks").insert({ user_id: auth.user.id, habit_id: habitId, day });
    }
    emitPulseChange();
  };

  const remove = async (id: string) => {
    await supabase.from("habits").update({ archived: true }).eq("id", id);
    load();
    emitPulseChange();
  };

  const unused = SUGGESTIONS.filter(([, n]) => !habits.some((h) => h.name === n));

  return (
    <HubShell title="Mes habitudes" subtitle="Tu coches quand c'est fait. Le reste ne compte pas contre toi.">
      <div className="rounded-[20px] border border-border/70 bg-card px-4 py-4">
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Choisis une ou deux habitudes, pas plus. C'est déjà beaucoup.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_repeat(7,1.75rem)] items-center gap-1 text-center text-[10px] font-semibold text-muted-foreground">
              <span />
              {DAYS.map((d, i) => (
                <span key={i} className={week[i] === today ? "text-primary" : ""}>{d}</span>
              ))}
            </div>
            {habits.map((h) => (
              <div key={h.id} className="grid grid-cols-[minmax(0,1fr)_repeat(7,1.75rem)] items-center gap-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-sm">{h.icon}</span>
                  <span className="truncate text-sm text-foreground">{h.name}</span>
                  <button onClick={() => remove(h.id)} aria-label={`Retirer ${h.name}`} className="ml-auto shrink-0 p-1">
                    <Trash2 className="h-3 w-3 text-muted-foreground" strokeWidth={1.75} />
                  </button>
                </div>
                {week.map((day) => {
                  const on = checks.has(`${h.id}|${day}`);
                  const future = day > today;
                  return (
                    <button
                      key={day}
                      disabled={future}
                      onClick={() => toggle(h.id, day)}
                      aria-pressed={on}
                      aria-label={`${h.name} le ${day}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border/60 bg-background"
                      } disabled:opacity-30`}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
        <div className="flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Une nouvelle habitude…" className="h-10" />
          <Button size="sm" className="h-10" onClick={() => add(draft)} disabled={!draft.trim()} aria-label="Ajouter">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {unused.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {unused.map(([icon, name]) => (
              <button key={name} onClick={() => add(name, icon)} className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-foreground">
                {icon} {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </HubShell>
  );
};

export default MoiHabitudes;
