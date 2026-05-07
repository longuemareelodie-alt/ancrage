import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { LSF_THEMES } from "@/data/lsfCatalog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import LsfOnboarding, { isLsfOnboardingDone } from "@/components/lies/LsfOnboarding";
import imgBebe from "@/assets/lsf/theme-bebe.jpg";
import imgEmotions from "@/assets/lsf/theme-emotions.jpg";
import imgRoutine from "@/assets/lsf/theme-routine.jpg";
import imgFamille from "@/assets/lsf/theme-famille.jpg";

const THEME_IMAGES: Record<string, string> = {
  "bebe-besoins": imgBebe,
  emotions: imgEmotions,
  routine: imgRoutine,
  famille: imgFamille,
};

const LsfHome = () => {
  const { user } = useAuth();
  const [learnedKeys, setLearnedKeys] = useState<Set<string>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!isLsfOnboardingDone());
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("lsf_progress")
      .select("sign_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setLearnedKeys(new Set(data.map((r) => r.sign_key)));
      });
  }, [user]);

  return (
    <LiesShell
      title="Apprendre la LSF"
      subtitle="Quelques signes simples pour ouvrir un nouveau canal avec votre enfant."
      icon={<BookOpen className="h-6 w-6" />}
    >
      <div className="space-y-3">
        {LSF_THEMES.map((theme) => {
          const total = theme.signs.length;
          const learned = theme.signs.filter((s) => learnedKeys.has(s.key)).length;
          const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
          return (
            <Link
              key={theme.slug}
              to={`/lies-autrement/lsf/${theme.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-[hsl(var(--lies))] hover:shadow-soft"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--lies-soft))]">
                {THEME_IMAGES[theme.slug] ? (
                  <img
                    src={THEME_IMAGES[theme.slug]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{theme.emoji}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-lg text-foreground">{theme.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{theme.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-[hsl(var(--lies))] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {learned}/{total}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </LiesShell>
  );
};

export default LsfHome;
