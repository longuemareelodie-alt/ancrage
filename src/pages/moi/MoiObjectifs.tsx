import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Circle, Plus, Trash2 } from "lucide-react";

type Goal = { id: string; title: string; kind: string; done: boolean };

/**
 * `/moi/objectifs` — le manque le plus criant côté parent : voir sa propre
 * progression. Deux listes seulement : ce que je veux, ce que j'ai réussi.
 */
const MoiObjectifs = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [draft, setDraft] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("personal_goals")
      .select("id, title, kind, done")
      .order("created_at", { ascending: false });
    setGoals(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (kind: "objectif" | "reussite") => {
    const title = draft.trim();
    if (!title) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    setDraft("");
    await supabase.from("personal_goals").insert({
      user_id: uid,
      title,
      kind,
      done: kind === "reussite",
      achieved_at: kind === "reussite" ? new Date().toISOString() : null,
    });
    load();
  };

  const toggle = async (g: Goal) => {
    await supabase
      .from("personal_goals")
      .update({ done: !g.done, achieved_at: g.done ? null : new Date().toISOString() })
      .eq("id", g.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("personal_goals").delete().eq("id", id);
    load();
  };

  const open = goals.filter((g) => !g.done);
  const wins = goals.filter((g) => g.done);

  return (
    <HubShell title="Objectifs & réussites" subtitle="Petit compte, grand effet. Une ligne suffit.">
      <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ce que je veux, ou ce que j'ai réussi…"
          className="border-0 px-0 text-sm focus-visible:ring-0"
        />
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => add("objectif")} disabled={!draft.trim()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} /> Objectif
          </Button>
          <Button size="sm" variant="secondary" onClick={() => add("reussite")} disabled={!draft.trim()}>
            <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} /> Réussite
          </Button>
        </div>
      </div>

      <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        En cours
      </p>
      {open.length === 0 && (
        <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm text-muted-foreground">
          Aucun objectif. C'est très bien aussi.
        </p>
      )}
      {open.map((g) => (
        <div
          key={g.id}
          className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3"
        >
          <button onClick={() => toggle(g)} aria-label="Marquer comme réussi">
            <Circle className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          </button>
          <span className="flex-1 text-sm text-foreground">{g.title}</span>
          <button onClick={() => remove(g.id)} aria-label="Supprimer">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          </button>
        </div>
      ))}

      {wins.length > 0 && (
        <>
          <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Réussies ({wins.length})
          </p>
          {wins.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-secondary/20 px-5 py-3"
            >
              <button onClick={() => toggle(g)} aria-label="Remettre en cours">
                <Check className="h-4 w-4 text-primary-dark" strokeWidth={2} />
              </button>
              <span className="flex-1 text-sm text-muted-foreground line-through">{g.title}</span>
              <button onClick={() => remove(g.id)} aria-label="Supprimer">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </>
      )}
    </HubShell>
  );
};

export default MoiObjectifs;
