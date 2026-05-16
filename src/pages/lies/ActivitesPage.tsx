import { useEffect, useMemo, useState } from "react";
import { Sparkles, Clock, Target, Package, ListChecks, Tag, Heart, HeartOff, Lock } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ACTIVITIES,
  AGE_LABELS,
  TROUBLE_LABELS,
  type Activity,
  type AgeRange,
  type TroubleTag,
} from "@/data/activitiesCatalog";
import {
  getFavorites,
  isFavorite,
  subscribeFavorites,
  toggleFavorite,
} from "@/lib/activitiesFavorites";
import { toast } from "@/hooks/use-toast";
import {
  useAccessTier,
  isFreemiumLimited,
  FREEMIUM_FREE_ACTIVITY_IDS,
} from "@/lib/freemium";
import UnlockDialog from "@/components/UnlockDialog";

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

type View = "all" | "favorites";

const ActivityCard = ({
  a,
  fav,
  onToggle,
  locked,
  onUnlock,
}: {
  a: Activity;
  fav: boolean;
  onToggle: (id: string, title: string) => void;
  locked: boolean;
  onUnlock: () => void;
}) => (
  <article className={`relative rounded-2xl border border-border bg-card p-5 shadow-sm ${locked ? "opacity-60" : ""}`}>
    <header className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg text-foreground">{a.title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={fav}
          onClick={() => onToggle(a.id, a.title)}
          className="shrink-0 text-[hsl(var(--lies))] hover:bg-[hsl(var(--lies-soft))]"
        >
          <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
        </Button>
      </div>
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
          {locked ? (
            <p className="mt-1 text-sm italic text-muted-foreground">
              Étapes complètes réservées à l'accès complet.
            </p>
          ) : (
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-foreground/90">
              {a.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
        </dd>
      </div>
    </dl>
    {locked && (
      <button
        type="button"
        onClick={onUnlock}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--lies))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--lies-foreground))] hover:opacity-90"
      >
        <Lock className="h-3.5 w-3.5" />
        Déverrouiller
      </button>
    )}
  </article>
);

const ActivitesPage = () => {
  const [age, setAge] = useState<AgeRange>("1-3a");
  const [trouble, setTrouble] = useState<TroubleTag>("tous");
  const [view, setView] = useState<View>("all");
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
  const [unlockOpen, setUnlockOpen] = useState(false);
  const tier = useAccessTier();
  const limited = isFreemiumLimited(tier);

  useEffect(() => subscribeFavorites(setFavorites), []);

  const handleToggle = (id: string, title: string) => {
    const wasFav = isFavorite(id);
    toggleFavorite(id);
    toast({
      title: wasFav ? "Retiré des favoris" : "Ajouté aux favoris",
      description: title,
    });
  };

  const filtered = useMemo(() => {
    if (view === "favorites") {
      return ACTIVITIES.filter((a) => favorites.includes(a.id));
    }
    return ACTIVITIES.filter((a) => a.age === age).filter((a) =>
      trouble === "tous" ? true : a.troubles.includes(trouble) || a.troubles.includes("tous"),
    );
  }, [age, trouble, view, favorites]);

  return (
    <LiesShell
      title="Activités & lien"
      subtitle="Des idées concrètes, par âge et selon les besoins de votre enfant."
      icon={<Sparkles className="h-6 w-6" />}
    >
      {/* Onglets : toutes / favoris */}
      <div className="mb-5 flex gap-2">
        <Button
          type="button"
          variant={view === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("all")}
          className={
            view === "all"
              ? "bg-[hsl(var(--lies))] text-white hover:bg-[hsl(var(--lies))]/90"
              : "border-[hsl(var(--lies)/0.4)]"
          }
        >
          Toutes les activités
        </Button>
        <Button
          type="button"
          variant={view === "favorites" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("favorites")}
          className={
            view === "favorites"
              ? "bg-[hsl(var(--lies))] text-white hover:bg-[hsl(var(--lies))]/90"
              : "border-[hsl(var(--lies)/0.4)]"
          }
        >
          <Heart className="mr-1 h-4 w-4" />
          Mes favoris
          {favorites.length > 0 && (
            <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs">
              {favorites.length}
            </span>
          )}
        </Button>
      </div>

      {view === "all" && (
        <>
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
        </>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          {view === "favorites" ? (
            <>
              <HeartOff className="mr-1 inline h-4 w-4 align-text-bottom" />
              Aucun favori pour l'instant. Touchez le ♥ sur une activité pour l'ajouter ici.
            </>
          ) : (
            <>Aucune activité ne correspond à ce filtre. Essayez « Tous troubles » ou changez de tranche d'âge.</>
          )}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <ActivityCard
              key={a.id}
              a={a}
              fav={favorites.includes(a.id)}
              onToggle={handleToggle}
              locked={limited && !FREEMIUM_FREE_ACTIVITY_IDS.has(a.id)}
              onUnlock={() => setUnlockOpen(true)}
            />
          ))}
        </div>
      )}
      <UnlockDialog open={unlockOpen} onOpenChange={setUnlockOpen} />
    </LiesShell>
  );
};

export default ActivitesPage;
