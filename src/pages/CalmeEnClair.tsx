import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Flame, Sparkles, TrendingUp, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type MoodKey = "calm" | "ok" | "tense" | "overflow";

const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string; adjust: number }[] = [
  { key: "calm",     emoji: "🌿", label: "Sereine",     adjust: +10 },
  { key: "ok",       emoji: "🙂", label: "Ça va",       adjust: +3  },
  { key: "tense",    emoji: "😣", label: "Tendue",      adjust: -8  },
  { key: "overflow", emoji: "🌊", label: "Débordée",    adjust: -15 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const CalmeEnClair = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [checkins14d, setCheckins14d] = useState(0);
  const [baseScore, setBaseScore] = useState(50);
  const [mood, setMood] = useState<MoodKey | null>(null);

  // Load today's saved mood
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`calm_mood_${user.id}_${todayKey()}`);
    if (saved && MOOD_OPTIONS.some((m) => m.key === saved)) {
      setMood(saved as MoodKey);
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();
      const s = data?.current_streak ?? 0;
      setStreak(s);

      const since = new Date();
      since.setDate(since.getDate() - 14);
      const { count } = await supabase
        .from("emotion_checkins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString());
      const c = count ?? 0;
      setCheckins14d(c);

      const score = 40 + Math.min(s, 20) * 2 + Math.min(c, 14) * 1.5;
      setBaseScore(Math.round(score));
    };
    load();
  }, [user]);

  const moodAdjust = useMemo(
    () => MOOD_OPTIONS.find((m) => m.key === mood)?.adjust ?? 0,
    [mood],
  );
  const calmScore = Math.max(20, Math.min(98, baseScore + moodAdjust));

  const selectMood = (key: MoodKey) => {
    setMood(key);
    if (user) localStorage.setItem(`calm_mood_${user.id}_${todayKey()}`, key);
  };

  const streakBonus = Math.min(streak, 20) * 2;
  const checkinBonus = Math.round(Math.min(checkins14d, 14) * 1.5);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-3">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              Ton calme en clair
            </h1>
            <p className="text-sm text-muted-foreground">
              D'où vient ton score, et comment le faire grandir.
            </p>
          </div>

          {/* Quick mood check-in */}
          <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
            <div className="text-center space-y-1">
              <p className="font-serif text-xl font-semibold">Je suis plutôt…</p>
              <p className="text-xs text-muted-foreground">
                Une réponse rapide pour ajuster ton score du moment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MOOD_OPTIONS.map((m) => {
                const active = mood === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => selectMood(m.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-sm transition-all ${
                      active
                        ? "border-primary bg-primary/10 shadow-soft scale-[1.02]"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className={`font-medium ${active ? "text-primary" : ""}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {mood && (
              <p className="text-center text-xs text-muted-foreground">
                Merci. Ton ressenti ajuste le score de {moodAdjust >= 0 ? "+" : ""}
                {moodAdjust} point{Math.abs(moodAdjust) > 1 ? "s" : ""}.
              </p>
            )}
          </section>

          {/* Current score card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/30 p-7 text-center shadow-soft-lg">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Aujourd'hui
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={calmScore}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="font-serif text-5xl font-semibold text-primary mt-2"
              >
                {calmScore}%
              </motion.p>
            </AnimatePresence>
            <p className="text-sm text-muted-foreground mt-3">
              {mood
                ? "Ce score tient compte de ton ressenti d'aujourd'hui."
                : "Réponds à la question au-dessus pour affiner ton score du jour."}
            </p>
          </div>

          {/* Composition */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold">D'où vient ton score</h2>

            <div className="rounded-2xl bg-card p-5 shadow-soft flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">Base de présence</p>
                  <span className="text-sm font-medium text-primary">+40</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Le simple fait d'être là compte. Tu démarres avec 40 %.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-card p-5 shadow-soft flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">Tes jours de suite</p>
                  <span className="text-sm font-medium text-primary">+{streakBonus}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Chaque jour consécutif (jusqu'à 20) t'apporte 2 points. Tu es à {streak} jour{streak > 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-card p-5 shadow-soft flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold">Tes check-ins récents</p>
                  <span className="text-sm font-medium text-primary">+{checkinBonus}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Sur les 14 derniers jours : {checkins14d} check-in{checkins14d > 1 ? "s" : ""}. Chacun ajoute 1,5 point (max 14).
                </p>
              </div>
            </div>

            {mood && (
              <div className="rounded-2xl bg-card p-5 shadow-soft flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Smile className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold">Ton ressenti d'aujourd'hui</p>
                    <span className="text-sm font-medium text-primary">
                      {moodAdjust >= 0 ? "+" : ""}{moodAdjust}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu te sens {MOOD_OPTIONS.find((m) => m.key === mood)?.label.toLowerCase()}. Ton score reflète ce moment précis.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* How to improve */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold">Comment l'améliorer</h2>
            <div className="rounded-2xl bg-secondary/30 p-6 shadow-soft space-y-4">
              <div className="flex gap-3">
                <span className="font-serif text-xl text-primary">1.</span>
                <p className="text-sm">
                  <span className="font-semibold">Reviens chaque jour.</span> Même 30 secondes suffisent. La régularité pèse plus que la durée.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-serif text-xl text-primary">2.</span>
                <p className="text-sm">
                  <span className="font-semibold">Fais ton check-in émotionnel.</span> Nommer ce que tu ressens calme déjà ton système nerveux.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-serif text-xl text-primary">3.</span>
                <p className="text-sm">
                  <span className="font-semibold">Utilise "Mode survie → OFF"</span> quand ça déborde. Tu apprends à ton corps qu'il peut redescendre.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-serif text-xl text-primary">4.</span>
                <p className="text-sm">
                  <span className="font-semibold">Sois douce avec les jours bas.</span> Le score remonte vite dès que tu reviens.
                </p>
              </div>
            </div>
          </section>

          {/* Important note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 text-primary mr-1" />
              Ce score n'est pas un jugement. C'est un miroir bienveillant de ton chemin.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/checkin"
              className="block w-full rounded-xl bg-primary px-6 py-4 text-center font-semibold text-primary-foreground shadow-soft-lg transition-transform hover:scale-[1.02]"
            >
              Faire un check-in maintenant
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalmeEnClair;
