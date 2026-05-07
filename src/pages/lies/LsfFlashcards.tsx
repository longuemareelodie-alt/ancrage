import { useEffect, useMemo, useState } from "react";
import { Brain, Check, RotateCcw, Shuffle, ChevronLeft, ChevronRight, PlayCircle, Eye, EyeOff } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { LSF_THEMES } from "@/data/lsfCatalog";
import { LSF_NEW_SIGNS, LSF_NEW_THEMES } from "@/data/lsfNewSigns";
import { lsfVideoUrl, sematosSearchUrl } from "@/lib/lsfVideoUrl";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type Card = {
  key: string;
  label: string;
  gesture: string;
  emoji: string;
  themeSlug: string;
  themeTitle: string;
  themeEmoji: string;
};

type Scope = "all" | "todo" | "learned";
type ThemeFilter = "all" | string;

const ALL_CARDS: Card[] = (() => {
  const out: Card[] = [];
  for (const t of LSF_THEMES) {
    for (const s of t.signs) {
      out.push({
        key: s.key,
        label: s.label,
        gesture: s.gesture,
        emoji: s.emoji,
        themeSlug: t.slug,
        themeTitle: t.title,
        themeEmoji: t.emoji,
      });
    }
  }
  for (const s of LSF_NEW_SIGNS) {
    const meta = LSF_NEW_THEMES.find((m) => m.slug === s.themeSlug)!;
    out.push({
      key: s.key,
      label: s.label,
      gesture: s.gesture,
      emoji: s.emoji,
      themeSlug: s.themeSlug,
      themeTitle: meta.title,
      themeEmoji: meta.emoji,
    });
  }
  return out;
})();

const THEME_OPTIONS: { value: ThemeFilter; label: string; emoji: string }[] = [
  { value: "all", label: "Tous", emoji: "✨" },
  ...LSF_NEW_THEMES.map((t) => ({ value: t.slug, label: t.title, emoji: t.emoji })),
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LsfFlashcards = () => {
  const { user } = useAuth();
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [scope, setScope] = useState<Scope>("todo");
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>("all");
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Charger la progression
  useEffect(() => {
    if (!user) return;
    supabase
      .from("lsf_progress")
      .select("sign_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setLearned(new Set(data.map((r) => r.sign_key)));
      });
  }, [user]);

  // Pool filtré
  const pool = useMemo(() => {
    return ALL_CARDS.filter((c) => {
      if (themeFilter !== "all" && c.themeSlug !== themeFilter) return false;
      if (scope === "todo" && learned.has(c.key)) return false;
      if (scope === "learned" && !learned.has(c.key)) return false;
      return true;
    });
  }, [themeFilter, scope, learned]);

  // Recalculer l'ordre quand le pool change de composition (taille ou clés)
  const poolSignature = useMemo(() => pool.map((c) => c.key).join("|"), [pool]);
  useEffect(() => {
    setOrder(shuffle(pool.map((c) => c.key)));
    setIndex(0);
    setRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolSignature]);

  const cardsByKey = useMemo(() => {
    const m = new Map<string, Card>();
    for (const c of ALL_CARDS) m.set(c.key, c);
    return m;
  }, []);

  const current = order.length > 0 ? cardsByKey.get(order[index]) : undefined;
  const total = order.length;

  const next = () => {
    if (total === 0) return;
    setRevealed(false);
    setIndex((i) => (i + 1) % total);
  };
  const prev = () => {
    if (total === 0) return;
    setRevealed(false);
    setIndex((i) => (i - 1 + total) % total);
  };
  const reshuffle = () => {
    setOrder(shuffle(pool.map((c) => c.key)));
    setIndex(0);
    setRevealed(false);
  };

  const markLearned = async () => {
    if (!user || !current || busy) return;
    setBusy(true);
    const isLearned = learned.has(current.key);
    if (isLearned) {
      const { error } = await supabase
        .from("lsf_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("sign_key", current.key);
      if (!error) {
        const nextSet = new Set(learned);
        nextSet.delete(current.key);
        setLearned(nextSet);
      } else {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      }
    } else {
      const { error } = await supabase
        .from("lsf_progress")
        .insert({ user_id: user.id, sign_key: current.key });
      if (!error) {
        setLearned(new Set([...learned, current.key]));
        toast({ title: "Bravo ! ✨", description: `« ${current.label} » ajouté à tes signes appris.` });
        // En mode "à apprendre", on enchaîne automatiquement
        if (scope === "todo") {
          // Le pool va se réduire via l'effet, pas besoin d'avancer manuellement
        } else {
          setTimeout(() => next(), 150);
        }
      } else {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      }
    }
    setBusy(false);
  };

  const totalAll = ALL_CARDS.length;
  const learnedAll = ALL_CARDS.filter((c) => learned.has(c.key)).length;
  const pctAll = Math.round((learnedAll / totalAll) * 100);

  return (
    <LiesShell
      title="Flashcards LSF"
      subtitle="Entraîne-toi : un signe à la fois, devine le geste, valide quand c'est acquis."
      backTo="/lies-autrement/lsf"
      icon={<Brain className="h-6 w-6" />}
    >
      <div className="space-y-4">
        {/* Progression globale */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Progression globale</span>
            <span className="text-muted-foreground">
              {learnedAll}/{totalAll} ({pctAll}%)
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-[hsl(var(--lies))] transition-all"
              style={{ width: `${pctAll}%` }}
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { value: "todo", label: "À apprendre" },
                { value: "all", label: "Tous" },
                { value: "learned", label: "Appris" },
              ] as { value: Scope; label: string }[]
            ).map((s) => {
              const active = scope === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setScope(s.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                      : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--lies))]"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {THEME_OPTIONS.map((t) => {
              const active = themeFilter === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setThemeFilter(t.value)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] text-[hsl(var(--lies))]"
                      : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--lies))]"
                  }`}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carte */}
        {!current ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {scope === "todo"
                ? "🎉 Tous les signes de ce filtre sont déjà appris ! Change de filtre pour continuer."
                : "Aucun signe ne correspond à ce filtre."}
            </p>
          </div>
        ) : (
          <article className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium uppercase tracking-wider">
                <span aria-hidden>{current.themeEmoji}</span>
                {current.themeTitle}
              </span>
              <span>
                {index + 1} / {total}
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[hsl(var(--lies-soft))] text-6xl">
                <span aria-hidden>{current.emoji}</span>
              </div>
              <h2 className="font-serif text-3xl text-foreground">{current.label}</h2>

              {revealed ? (
                <p className="max-w-md text-base leading-relaxed text-foreground/80">
                  {current.gesture}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--lies))] hover:opacity-90"
                >
                  <Eye className="h-4 w-4" />
                  Révéler le geste
                </button>
              )}

              {revealed && (
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href={lsfVideoUrl(current.label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--lies))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--lies-foreground))] hover:opacity-90"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Voir la vidéo
                  </a>
                  <a
                    href={sematosSearchUrl(current.label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                  >
                    Sématos
                  </a>
                  <button
                    type="button"
                    onClick={() => setRevealed(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--lies))]"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Cacher
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={total <= 1}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[hsl(var(--lies))] disabled:opacity-40"
                aria-label="Carte précédente"
              >
                <ChevronLeft className="h-4 w-4" />
                Préc.
              </button>
              <button
                type="button"
                onClick={markLearned}
                disabled={!user || busy}
                className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  learned.has(current.key)
                    ? "border border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))] text-[hsl(var(--lies))]"
                    : "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))] hover:opacity-90"
                }`}
              >
                <Check className="h-4 w-4" />
                {learned.has(current.key) ? "Appris ✓" : "Je le sais"}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={total <= 1}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[hsl(var(--lies))] disabled:opacity-40"
                aria-label="Carte suivante"
              >
                Suiv.
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={reshuffle}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[hsl(var(--lies))]"
              >
                <Shuffle className="h-3 w-3" />
                Mélanger à nouveau
              </button>
            </div>
          </article>
        )}

        {!user && (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Connecte-toi pour sauvegarder ta progression.
          </div>
        )}

        <div className="rounded-2xl border border-border bg-[hsl(var(--lies-soft))] p-4 text-sm text-foreground/80">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <RotateCcw className="h-4 w-4 text-[hsl(var(--lies))]" />
            Conseil
          </div>
          5 cartes par jour suffisent. Mieux vaut revoir souvent les mêmes
          signes que tout vouloir apprendre d'un coup.
        </div>
      </div>
    </LiesShell>
  );
};

export default LsfFlashcards;
