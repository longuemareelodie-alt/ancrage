import { useMemo, useState } from "react";
import { Sparkles, Clock, Target, Package, ListChecks, Tag } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITIES,
  AGE_LABELS,
  TROUBLE_LABELS,
  type AgeRange,
  type TroubleTag,
} from "@/data/activitiesCatalog";

const AGES: AgeRange[] = ["0-12m", "1-3a", "3-6a", "6-9a", "9-12a", "12a+"];
const TROUBLES: TroubleTag[] = [
  "tous",
  "tsa",
  "tdah",
  "dys",
  "surdite",
  "moteur",
  "hypersensibilite",
];

const DIFFICULTY_LABEL: Record<string, string> = {
  facile: "Facile",
  moyen: "Moyen",
  evolutif: "Évolutif",
};

const ActivitesPage = () => {
  const [age, setAge] = useState<AgeRange>("1-3a");
  const [trouble, setTrouble] = useState<TroubleTag>("tous");

  const filtered = useMemo(() => {
    return ACTIVITIES.filter((a) => a.age === age).filter((a) =>
      trouble === "tous" ? true : a.troubles.includes(trouble) || a.troubles.includes("tous"),
    );
  }, [age, trouble]);

  return (
    <LiesShell
      title="Activités & lien"
      subtitle="Des idées concrètes, par âge et selon les besoins de votre enfant."
      icon={<Sparkles className="h-6 w-6" />}
    >
      {/* Filtres tranche d'âge */}
      <section className="mb-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tranche d'âge
        </h2>
        <div className="flex flex-wrap gap-2">
          {AGES.map((a) => (
            <Button
              key={a}
              type="button"
              variant={a === age ? "default" : "outline"}
              size="sm"
              onClick={() => setAge(a)}
              className={
                a === age
                  ? "bg-[hsl(var(--lies))] text-white hover:bg-[hsl(var(--lies))]/90"
                  : "border-[hsl(var(--lies)/0.4)]"
              }
            >
              {AGE_LABELS[a]}
            </Button>
          ))}
        </div>
      </section>

      {/* Filtres trouble */}
      <section className="mb-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trouble / handicap
        </h2>
        <div className="flex flex-wrap gap-2">
          {TROUBLES.map((t) => (
            <Button
              key={t}
              type="button"
              variant={t === trouble ? "default" : "outline"}
              size="sm"
              onClick={() => setTrouble(t)}
              className={
                t === trouble
                  ? "bg-[hsl(var(--lies))] text-white hover:bg-[hsl(var(--lies))]/90"
                  : "border-[hsl(var(--lies)/0.4)]"
              }
            >
              {TROUBLE_LABELS[t]}
            </Button>
          ))}
        </div>
      </section>

      {/* Liste des activités */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Aucune activité ne correspond à ce filtre pour l'instant. Essayez « Tous troubles » ou
          changez de tranche d'âge.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <header className="mb-3">
                <h3 className="font-serif text-lg text-foreground">{a.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="bg-[hsl(var(--lies-soft))] text-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {a.duration}
                  </Badge>
                  <Badge variant="outline">{DIFFICULTY_LABEL[a.difficulty]}</Badge>
                  {a.troubles.map((t) => (
                    <Badge key={t} variant="outline" className="border-[hsl(var(--lies)/0.4)]">
                      <Tag className="mr-1 h-3 w-3" />
                      {TROUBLE_LABELS[t]}
                    </Badge>
                  ))}
                </div>
              </header>

              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="mt-0.5 shrink-0 text-[hsl(var(--lies))]">
                    <Target className="h-4 w-4" />
                  </dt>
                  <dd>
                    <span className="font-medium">Objectif :</span> {a.goal}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="mt-0.5 shrink-0 text-[hsl(var(--lies))]">
                    <Package className="h-4 w-4" />
                  </dt>
                  <dd>
                    <span className="font-medium">Matériel :</span> {a.material}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="mt-0.5 shrink-0 text-[hsl(var(--lies))]">
                    <ListChecks className="h-4 w-4" />
                  </dt>
                  <dd className="flex-1">
                    <span className="font-medium">Étapes :</span>
                    <ol className="mt-1 list-decimal space-y-1 pl-5 text-foreground/90">
                      {a.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </LiesShell>
  );
};

export default ActivitesPage;
