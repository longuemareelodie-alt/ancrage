import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, GitCompare, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { picto } from "@/data/pictograms";
import { QUESTIONS, SOURCE_LABEL, situationByKey, type Answer } from "@/data/situationTemplates";

type Sit = { id: string; title: string; template_key: string | null; occurred_on: string; place: string | null; status: string; last_observed_at: string };
type Obs = {
  id: string; situation_id: string; created_at: string; answers: Answer[]; emotions: string[];
  child_words: string | null; parent_note: string | null; helped: string | null; not_helped: string | null; felt_unsafe: boolean;
};

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const answerLabel = (a?: Answer) => (a ? (a.text ? `« ${a.text} »` : picto(a.answer_key).label) : "—");

/** Différences seulement : on montre ce qui a changé, sans jugement. */
export function diffObservations(a: Obs, b: Obs) {
  const keys = Array.from(new Set([...a.answers, ...b.answers].map((x) => x.question_key)));
  return keys
    .map((k) => {
      const x = a.answers.find((r) => r.question_key === k);
      const y = b.answers.find((r) => r.question_key === k);
      return { key: k, before: answerLabel(x), after: answerLabel(y) };
    })
    .filter((d) => d.before !== d.after);
}

const ChildSituations = ({ profileId, firstName }: { profileId: string; firstName: string }) => {
  const [sits, setSits] = useState<Sit[]>([]);
  const [obs, setObs] = useState<Obs[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [compare, setCompare] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: o }] = await Promise.all([
        supabase.from("child_situations").select("*").eq("profile_id", profileId).order("last_observed_at", { ascending: false }),
        supabase.from("child_situation_observations").select("*").eq("profile_id", profileId).order("created_at"),
      ]);
      setSits((s ?? []) as Sit[]);
      setObs((o ?? []) as unknown as Obs[]);
    })();
  }, [profileId]);

  return (
    <div className="space-y-2 pt-2">
      <Link
        to={`/autonomie/situation?enfant=${profileId}`}
        className="flex items-center justify-center gap-1.5 rounded-[20px] border border-border/70 bg-card px-5 py-3 text-sm font-semibold text-foreground"
      >
        <Plus className="h-4 w-4" strokeWidth={2} /> Comprendre une situation
      </Link>
      {sits.length === 0 && (
        <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm leading-relaxed text-muted-foreground">
          Aucune situation pour {firstName}. Quand quelque chose se passe, vous pouvez la comprendre ensemble ici.
        </p>
      )}
      {sits.map((s) => {
        const list = obs.filter((o) => o.situation_id === s.id);
        const tpl = situationByKey(s.template_key);
        const isOpen = open === s.id;
        const last2 = list.slice(-2);
        return (
          <div key={s.id} className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
            <button onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center gap-3 text-left">
              <span className="text-2xl" aria-hidden>{tpl?.emoji ?? "🧩"}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{s.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {fmt(s.occurred_on)} · {list.length} observation{list.length > 1 ? "s" : ""}
                </span>
              </span>
            </button>
            {isOpen && (
              <div className="mt-3 space-y-3">
                {list.map((o, i) => (
                  <div key={o.id} className="rounded-2xl bg-secondary/30 px-4 py-3 text-xs leading-relaxed">
                    <p className="font-semibold text-foreground">Observation {i + 1} · {fmt(o.created_at)}</p>
                    {o.answers.map((a, j) => (
                      <p key={j} className="mt-1 text-foreground">
                        <span className="text-muted-foreground">{QUESTIONS[a.question_key]?.text.enfant ?? a.question_key} </span>
                        {answerLabel(a)} <span className="text-[10px] text-muted-foreground">({SOURCE_LABEL[a.source]})</span>
                      </p>
                    ))}
                    {o.child_words && <p className="mt-1"><span className="text-muted-foreground">Parole rapportée de l'enfant : </span>« {o.child_words} »</p>}
                    {o.parent_note && <p className="mt-1"><span className="text-muted-foreground">Observation du parent : </span>{o.parent_note}</p>}
                    {o.helped && <p className="mt-1"><span className="text-muted-foreground">Ce qui a aidé : </span>{o.helped}</p>}
                    {o.not_helped && <p className="mt-1"><span className="text-muted-foreground">Ce qui n'a pas aidé : </span>{o.not_helped}</p>}
                  </div>
                ))}
                {compare === s.id && last2.length === 2 && (
                  <div className="rounded-2xl border border-border/70 px-4 py-3 text-xs">
                    <p className="font-semibold text-foreground">Ce qui a changé entre le {fmt(last2[0].created_at)} et le {fmt(last2[1].created_at)}</p>
                    {diffObservations(last2[0], last2[1]).length === 0 ? (
                      <p className="mt-1 text-muted-foreground">Les réponses sont les mêmes.</p>
                    ) : (
                      diffObservations(last2[0], last2[1]).map((d) => (
                        <p key={d.key} className="mt-1 text-foreground">
                          <span className="text-muted-foreground">{QUESTIONS[d.key as keyof typeof QUESTIONS]?.text.enfant} </span>
                          {d.before} → {d.after}
                        </p>
                      ))
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Link
                    to={`/autonomie/situation?enfant=${profileId}&refaire=${s.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Refaire cette situation
                  </Link>
                  {list.length >= 2 && (
                    <button
                      onClick={() => setCompare(compare === s.id ? null : s.id)}
                      className="flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-xs font-semibold text-foreground"
                    >
                      <GitCompare className="h-3.5 w-3.5" /> Comparer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChildSituations;
