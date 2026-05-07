import { useMemo, useState } from "react";
import { Sparkles, Search, BookOpen } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import {
  LSF_NEW_SIGNS,
  LSF_NEW_THEMES,
  filterNewSigns,
  type LsfNewSign,
} from "@/data/lsfNewSigns";

type ThemeFilter = "all" | LsfNewSign["themeSlug"];

const SignesNouveaux = () => {
  const [theme, setTheme] = useState<ThemeFilter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => filterNewSigns(theme, query), [theme, query]);

  const tabs: { value: ThemeFilter; label: string; emoji: string }[] = [
    { value: "all", label: "Tous", emoji: "✨" },
    ...LSF_NEW_THEMES.map((t) => ({
      value: t.slug,
      label: t.title,
      emoji: t.emoji,
    })),
  ];

  return (
    <LiesShell
      title="80 nouveaux signes"
      subtitle="Élargir le vocabulaire LSF du quotidien — descriptions et gestes pas-à-pas."
      backTo="/lies-autrement/lsf"
      icon={<Sparkles className="h-6 w-6" />}
    >
      <div className="space-y-4">
        {/* Recherche */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un signe (ex. : pipi, vacances, gratitude…)"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-[hsl(var(--lies))] focus:outline-none"
            aria-label="Rechercher un signe"
          />
        </div>

        {/* Filtres thèmes */}
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          {tabs.map((tab) => {
            const active = theme === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTheme(tab.value)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                    : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                }`}
                aria-pressed={active}
              >
                <span aria-hidden>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compteur */}
        <p className="text-xs text-muted-foreground">
          {visible.length} signe{visible.length > 1 ? "s" : ""} affiché
          {visible.length > 1 ? "s" : ""} sur {LSF_NEW_SIGNS.length}
        </p>

        {/* Grille de fiches */}
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucun signe ne correspond à « {query} ». Essaie un autre mot.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((sign) => {
              const themeMeta = LSF_NEW_THEMES.find((t) => t.slug === sign.themeSlug);
              return (
                <article
                  key={sign.key}
                  className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--lies))] hover:shadow-soft"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--lies-soft))] text-3xl">
                      <span aria-hidden>{sign.emoji}</span>
                    </div>
                    {themeMeta && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span aria-hidden>{themeMeta.emoji}</span>
                        {themeMeta.title}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-foreground">{sign.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {sign.gesture}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-[hsl(var(--lies-soft))] p-4 text-sm text-foreground/80">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <BookOpen className="h-4 w-4 text-[hsl(var(--lies))]" />
            Astuce
          </div>
          Choisis 3 à 5 signes par semaine, répète-les dans le contexte réel
          (au repas, au bain, au coucher). C'est la régularité, pas le nombre,
          qui ancre le vocabulaire.
        </div>
      </div>
    </LiesShell>
  );
};

export default SignesNouveaux;
