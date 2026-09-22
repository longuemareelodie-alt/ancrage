import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Pin, Plus, Trash2 } from "lucide-react";
import VoiceDictationButton from "@/components/VoiceDictationButton";
import { BRAIN_STATES, type BrainState } from "@/hooks/usePulseState";
import { useChildPulse } from "@/hooks/useChildPulse";
import { STATE_COLOR } from "@/hooks/usePulseHistory";
import { toast } from "@/hooks/use-toast";
import SpeakButton from "@/components/pulse/SpeakButton";
import { STYLE_FOR_STATE, voiceForChild } from "@/data/softVoices";

type Todo = { id: string; title: string; done: boolean; due_date: string | null };
type Note = { id: string; title: string | null; content: string; pinned: boolean; updated_at: string };

const CHILD_HINT: Record<BrainState, string> = {
  go: "Belle journée pour avancer avec lui.",
  moyen: "On avance doucement, à son rythme.",
  sature: "Une seule chose à la fois. Le reste attendra.",
  ko: "Aujourd'hui, on protège. Tenir suffit.",
};

/**
 * Le jour d'un enfant : son état, ses tâches, ses notes.
 * Rien de culpabilisant, rien de comptabilisé : juste ce qui allège.
 */
const EnfantJour = ({ profileId, firstName }: { profileId: string; firstName: string }) => {
  const { state, note, setNote, history, save } = useChildPulse(profileId);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newNote, setNewNote] = useState("");

  const load = useCallback(async () => {
    const [{ data: t }, { data: n }] = await Promise.all([
      supabase
        .from("todo_items")
        .select("id, title, done, due_date")
        .eq("profile_id", profileId)
        .order("done")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("child_notes")
        .select("id, title, content, pinned, updated_at")
        .eq("profile_id", profileId)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(50),
    ]);
    setTodos((t ?? []) as Todo[]);
    setNotes((n ?? []) as Note[]);
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const addTodo = async () => {
    const title = newTodo.trim();
    if (!title) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { error } = await supabase
      .from("todo_items")
      .insert({ user_id: uid, title, profile_id: profileId, domain: "famille" });
    if (error) {
      toast({ description: "Enregistrement impossible.", variant: "destructive" });
      return;
    }
    setNewTodo("");
    toast({ description: "C'est noté. Tu n'as plus à y penser." });
    load();
  };

  const toggleTodo = async (t: Todo) => {
    await supabase.from("todo_items").update({ done: !t.done }).eq("id", t.id);
    load();
  };

  const addNote = async () => {
    const content = newNote.trim();
    if (!content) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase.from("child_notes").insert({ user_id: uid, profile_id: profileId, content });
    setNewNote("");
    load();
  };

  return (
    <div className="space-y-4 pt-2">
      {/* --- Son état du jour --- */}
      <section className="rounded-[20px] border border-border/70 bg-card px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Comment va {firstName} aujourd'hui ?
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {BRAIN_STATES.map((s) => (
            <button
              key={s.id}
              onClick={() => save(s.id)}
              className={`rounded-[16px] border px-3 py-3 text-left transition-colors ${
                state === s.id
                  ? "border-primary/60 bg-secondary/60"
                  : "border-border/70 bg-background hover:bg-secondary/30"
              }`}
            >
              <span className="text-sm font-semibold text-foreground">
                {s.dot} {s.label}
              </span>
            </button>
          ))}
        </div>
        {state && (
          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{CHILD_HINT[state]}</p>
            <SpeakButton
              text={`${firstName}, ${CHILD_HINT[state].toLowerCase()}`}
              voice={voiceForChild(profileId)}
              style={STYLE_FOR_STATE[state]}
              label="Écouter"
            />
          </div>
        )}
        {state && (
          <div className="mt-3">
            <div className="flex items-start gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={`Ce qui s'est passé pour ${firstName} aujourd'hui…`}
                className="min-h-20 text-sm"
              />
              <VoiceDictationButton onText={(t) => setNote((v) => (v ? v + " " + t : t))} />
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => save(state, note)}
              className="mt-2 w-full"
            >
              Enregistrer cette journée
            </Button>
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ses derniers jours
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {history
                .slice()
                .reverse()
                .map((h) => (
                  <span
                    key={h.day}
                    title={`${h.day} · ${h.state}`}
                    className="h-5 w-5 rounded-[7px]"
                    style={{ background: STATE_COLOR[h.state] }}
                  />
                ))}
            </div>
          </div>
        )}
      </section>

      {/* --- Ses tâches --- */}
      <section className="rounded-[20px] border border-border/70 bg-card px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ses tâches
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder={`Une chose à faire pour ${firstName}…`}
            className="text-sm"
          />
          <VoiceDictationButton onText={(t) => setNewTodo((v) => (v ? v + " " + t : t))} />
          <Button size="icon" onClick={addTodo} disabled={!newTodo.trim()} aria-label="Ajouter">
            <Plus className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
        <div className="mt-3 space-y-1.5">
          {todos.length === 0 && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rien à faire pour {firstName} en ce moment. C'est une bonne nouvelle.
            </p>
          )}
          {todos.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-[14px] bg-background px-3 py-2.5">
              <button
                onClick={() => toggleTodo(t)}
                aria-label={t.done ? "Rouvrir" : "C'est fait"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  t.done ? "border-primary bg-primary/15" : "border-border"
                }`}
              >
                {t.done && <Check className="h-3 w-3 text-primary-dark" strokeWidth={2.5} />}
              </button>
              <span
                className={`min-w-0 flex-1 text-sm ${
                  t.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {t.title}
              </span>
              <button
                onClick={async () => {
                  await supabase.from("todo_items").delete().eq("id", t.id);
                  load();
                }}
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Ses notes --- */}
      <section className="rounded-[20px] border border-border/70 bg-card px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ses notes
        </p>
        <div className="mt-3 flex items-start gap-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Une observation, une phrase du médecin, une idée qui marche…"
            className="min-h-20 text-sm"
          />
          <VoiceDictationButton onText={(t) => setNewNote((v) => (v ? v + " " + t : t))} />
        </div>
        <Button size="sm" onClick={addNote} disabled={!newNote.trim()} className="mt-2 w-full">
          Ajouter cette note
        </Button>
        <div className="mt-3 space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-[14px] bg-background px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{n.content}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={async () => {
                    await supabase.from("child_notes").update({ pinned: !n.pinned }).eq("id", n.id);
                    load();
                  }}
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    n.pinned ? "text-primary-dark" : "text-muted-foreground"
                  }`}
                >
                  <Pin className="h-3 w-3" strokeWidth={2} /> {n.pinned ? "Épinglée" : "Épingler"}
                </button>
                <button
                  onClick={async () => {
                    await supabase.from("child_notes").delete().eq("id", n.id);
                    load();
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={2} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EnfantJour;
