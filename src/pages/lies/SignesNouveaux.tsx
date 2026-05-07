import { useEffect, useMemo, useState } from "react";
import { Sparkles, Search, BookOpen, Check, PlayCircle } from "lucide-react";
import { lsfVideoUrl, sematosSearchUrl } from "@/lib/lsfVideoUrl";
import LiesShell from "@/components/lies/LiesShell";
import {
  LSF_NEW_SIGNS,
  LSF_NEW_THEMES,
  filterNewSigns,
  type LsfNewSign,
} from "@/data/lsfNewSigns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type ThemeFilter = "all" | LsfNewSign["themeSlug"];

const SignesNouveaux = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeFilter>("all");
  const [query, setQuery] = useState("");
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const keys = LSF_NEW_SIGNS.map((s) => s.key);
    supabase
      .from("lsf_progress")
      .select("sign_key")
      .eq("user_id", user.id)
      .in("sign_key", keys)
      .then(({ data }) => {
        if (data) setLearned(new Set(data.map((r) => r.sign_key)));
      });
  }, [user]);

  const visible = useMemo(() => filterNewSigns(theme, query), [theme, query]);

  const toggle = async (key: string) => {
    if (!user || busy) return;
    setBusy(key);
    const isLearned = learned.has(key);
    if (isLearned) {
      const { error } = await supabase
        .from("lsf_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("sign_key", key);
      if (!error) {
        const next = new Set(learned);
        next.delete(key);
        setLearned(next);
      } else {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await supabase
        .from("lsf_progress")
        .insert({ user_id: user.id, sign_key: key });
      if (!error) setLearned(new Set([...learned, key]));
      else toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const tabs: { value: ThemeFilter; label: string; emoji: string }[] = [
    { value: "all", label: "Tous", emoji: "✨" },
    ...LSF_NEW_THEMES.map((t) => ({
      value: t.slug,
      label: t.title,
      emoji: t.emoji,
    })),
  ];

  // Compteur global de progression sur les nouveaux signes
  const learnedCount = LSF_NEW_SIGNS.filter((s) => learned.has(s.key)).length;
  const totalCount = LSF_NEW_SIGNS.length;
  const pct = Math.round((learnedCount / totalCount) * 100);

  return (
    <LiesShell
      title="80 nouveaux signes"
      subtitle="Élargir le vocabulaire LSF du quotidien — descriptions et gestes pas-à-pas."
      backTo="/lies-autrement/lsf"
      icon={<Sparkles className="h-6 w-6" />}
    >
      <div className="space-y-4">
        {/* Progression globale */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Ma progression</span>
            <span className="text-muted-foreground">
              {learnedCount}/{totalCount} ({pct}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-[hsl(var(--lies))] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

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

        <p className="text-xs text-muted-foreground">
          {visible.length} signe{visible.length > 1 ? "s" : ""} affiché
          {visible.length > 1 ? "s" : ""} sur {totalCount}
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
              const isLearned = learned.has(sign.key);
              return (
                <article
                  key={sign.key}
                  className={`rounded-2xl border p-4 transition-all ${
                    isLearned
                      ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]"
                      : "border-border bg-card hover:border-[hsl(var(--lies))] hover:shadow-soft"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--lies-soft))] text-3xl">
                      <span aria-hidden>{sign.emoji}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {themeMeta && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          <span aria-hidden>{themeMeta.emoji}</span>
                          {themeMeta.title}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggle(sign.key)}
                        disabled={!user || busy === sign.key}
                        className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors ${
                          isLearned
                            ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                            : "border border-border text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                        }`}
                        aria-pressed={isLearned}
                      >
                        <Check className="h-3 w-3" />
                        {isLearned ? "Appris" : "À apprendre"}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-foreground">{sign.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {sign.gesture}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={lsfVideoUrl(sign.label)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--lies))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--lies-foreground))] hover:opacity-90"
                      aria-label={`Voir la vidéo du signe ${sign.label} sur Elix`}
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Voir la vidéo
                    </a>
                    <a
                      href={sematosSearchUrl(sign.label)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                    >
                      Sématos
                    </a>
                  </div>
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
