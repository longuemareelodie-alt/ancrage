import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Check, BookOpen, PlayCircle } from "lucide-react";
import { lsfVideoUrl, elixSearchUrl } from "@/lib/lsfVideoUrl";
import LiesShell from "@/components/lies/LiesShell";
import { getThemeBySlug } from "@/data/lsfCatalog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LsfTheme = () => {
  const { themeSlug } = useParams<{ themeSlug: string }>();
  const { user } = useAuth();
  const theme = themeSlug ? getThemeBySlug(themeSlug) : null;
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !theme) return;
    const keys = theme.signs.map((s) => s.key);
    supabase
      .from("lsf_progress")
      .select("sign_key")
      .eq("user_id", user.id)
      .in("sign_key", keys)
      .then(({ data }) => {
        if (data) setLearned(new Set(data.map((r) => r.sign_key)));
      });
  }, [user, theme]);

  if (!theme) return <Navigate to="/lies-autrement/lsf" replace />;

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

  return (
    <LiesShell
      title={theme.title}
      subtitle={theme.description}
      backTo="/lies-autrement/lsf"
      icon={<BookOpen className="h-6 w-6" />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {theme.signs.map((sign) => {
          const isLearned = learned.has(sign.key);
          return (
            <article
              key={sign.key}
              className={`rounded-2xl border bg-card p-4 transition-all ${
                isLearned ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]" : "border-border"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-background">
                  {sign.image ? (
                    <img src={sign.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl">{sign.emoji}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggle(sign.key)}
                  disabled={!user || busy === sign.key}
                  className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors ${
                    isLearned
                      ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                      : "border border-border text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                  }`}
                  aria-pressed={isLearned}
                >
                  <Check className="h-3.5 w-3.5" />
                  {isLearned ? "Appris" : "À apprendre"}
                </button>
              </div>
              <h3 className="font-serif text-lg text-foreground">{sign.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{sign.gesture}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={lsfVideoUrl(sign.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--lies))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--lies-foreground))] hover:opacity-90"
                  aria-label={`Voir la vidéo du signe ${sign.label} sur Sématos`}
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Voir la vidéo
                </a>
                <a
                  href={elixSearchUrl(sign.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-[hsl(var(--lies))] hover:text-[hsl(var(--lies))]"
                >
                  Elix
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </LiesShell>
  );
};

export default LsfTheme;
