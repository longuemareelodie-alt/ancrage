import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { picto } from "@/data/pictograms";
import { QUESTIONS, situationByKey, type Answer } from "@/data/situationTemplates";
import { diffObservations } from "@/components/child/ChildSituations";

type Sit = { id: string; title: string; template_key: string | null; occurred_on: string };
type Obs = {
  id: string; situation_id: string; created_at: string; answers: Answer[]; emotions: string[];
  child_words: string | null; parent_note: string | null; helped: string | null; not_helped: string | null; felt_unsafe: boolean;
};

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Évolution : chronologie et changements de réponses. Aucun score, aucun diagnostic, aucune interprétation. */
const ChildEvolution = ({ profileId, firstName }: { profileId: string; firstName: string }) => {
  const [sits, setSits] = useState<Sit[]>([]);
  const [obs, setObs] = useState<Obs[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("child_situations").select("id, title, template_key, occurred_on").eq("profile_id", profileId),
      supabase.from("child_situation_observations").select("*").eq("profile_id", profileId).order("created_at", { ascending: false }),
    ]).then(([{ data: s }, { data: o }]) => {
      setSits((s ?? []) as Sit[]);
      setObs((o ?? []) as unknown as Obs[]);
      setLoaded(true);
    });
  }, [profileId]);

  if (!loaded) return null;
  if (!obs.length)
    return (
      <p className="mt-2 rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-sm leading-relaxed text-muted-foreground">
        Rien encore pour {firstName}. L'évolution apparaîtra ici au fil des situations comprises ensemble.
      </p>
    );

  const sitOf = (id: string) => sits.find((s) => s.id === id);
  const byTemplate = new Map<string, Sit[]>();
  sits.forEach((s) => s.template_key && byTemplate.set(s.template_key, [...(byTemplate.get(s.template_key) ?? []), s]));
  const similar = [...byTemplate.entries()].filter(([, l]) => l.length > 1);
  const changes = sits
    .map((s) => {
      const l = obs.filter((o) => o.situation_id === s.id).slice().reverse();
      return l.length >= 2 ? { s, a: l[l.length - 2], b: l[l.length - 1] } : null;
    })
    .filter(Boolean) as { s: Sit; a: Obs; b: Obs }[];
  const helped = obs.filter((o) => o.helped).slice(0, 5);
  const notHelped = obs.filter((o) => o.not_helped).slice(0, 5);
  const few = obs.length < 3;

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );

  return (
    <div className="space-y-2 pt-2">
      {!few && (
        <Card title="En bref">
          <p className="text-sm text-foreground">
            {sits.length} situation{sits.length > 1 ? "s" : ""} · {obs.length} observation{obs.length > 1 ? "s" : ""}
          </p>
        </Card>
      )}

      <Card title="Chronologie">
        <ol className="space-y-2 border-l border-border pl-4">
          {obs.slice(0, 12).map((o) => {
            const s = sitOf(o.situation_id);
            return (
              <li key={o.id} className="text-sm text-foreground">
                <span className="text-xs text-muted-foreground">{fmt(o.created_at)}</span>{" "}
                {situationByKey(s?.template_key)?.emoji ?? "🧩"} {s?.title ?? "Situation"}
                {o.emotions?.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">· {o.emotions.map((e) => picto(e).label).join(", ")}</span>
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      {!few && similar.length > 0 && (
        <Card title="Situations semblables">
          {similar.map(([k, l]) => (
            <p key={k} className="text-sm text-foreground">
              {situationByKey(k)?.title ?? k} : {l.length} fois ({l.map((x) => fmt(x.occurred_on)).join(", ")})
            </p>
          ))}
        </Card>
      )}

      {!few && changes.length > 0 && (
        <Card title="Changements de réponses">
          {changes.map(({ s, a, b }) => {
            const d = diffObservations(a, b);
            return (
              <div key={s.id} className="mb-2 text-sm">
                <p className="font-semibold text-foreground">{s.title} · {fmt(a.created_at)} → {fmt(b.created_at)}</p>
                {d.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Les réponses sont les mêmes.</p>
                ) : (
                  d.map((x) => (
                    <p key={x.key} className="text-xs text-foreground">
                      <span className="text-muted-foreground">{QUESTIONS[x.key as keyof typeof QUESTIONS]?.text.enfant} </span>
                      {x.before} → {x.after}
                    </p>
                  ))
                )}
              </div>
            );
          })}
        </Card>
      )}

      {(helped.length > 0 || notHelped.length > 0) && (
        <Card title="Ce qui a aidé · ce qui n'a pas aidé">
          {helped.map((o) => <p key={o.id} className="text-sm text-foreground">✓ {o.helped}</p>)}
          {notHelped.map((o) => <p key={o.id + "n"} className="text-sm text-muted-foreground">✗ {o.not_helped}</p>)}
        </Card>
      )}

      <Link to={`/famille/${profileId}?onglet=situations`} className="block text-center text-xs font-medium text-primary-dark">
        Voir toutes les situations
      </Link>
    </div>
  );
};

export default ChildEvolution;
