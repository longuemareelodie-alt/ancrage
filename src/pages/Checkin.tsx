import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Heart, Lock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { emotions, type EmotionData } from "@/data/emotions";
import { Progress } from "@/components/ui/progress";

type Step = "select" | "response" | "action" | "validation" | "summary";

const Checkin = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<EmotionData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{ emotion: string; type: string; date: string }[]>([]);
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("user_id", user.id)
        .single();
      setIsPremium(data?.is_premium ?? false);
    };
    fetchProfile();
  }, [user]);

  const negativeEmotions = emotions.filter((e) => e.type === "negative");
  const positiveEmotions = emotions.filter((e) => e.type === "positive");

  const handleSelect = async (emotion: EmotionData) => {
    setSelected(emotion);
    setStep("response");

    if (!user) return;
    // Save check-in
    await supabase.from("emotion_checkins").insert({
      user_id: user.id,
      emotion: emotion.id,
      emotion_type: emotion.type,
    });
    // Update profile
    await supabase
      .from("profiles")
      .update({
        last_emotion: emotion.id,
        last_checkin_date: new Date().toISOString().split("T")[0],
      })
      .eq("user_id", user.id);
  };

  const handleActionComplete = () => {
    setActionDone(true);
    setTimeout(() => {
      if (isPremium) {
        loadWeeklySummary();
        setStep("summary");
      } else {
        setStep("validation");
      }
    }, 2000);
  };

  const loadWeeklySummary = async () => {
    if (!user) return;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data } = await supabase
      .from("emotion_checkins")
      .select("emotion, emotion_type, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString())
      .order("created_at", { ascending: false });

    setWeeklyData(
      (data ?? []).map((d) => ({
        emotion: d.emotion,
        type: d.emotion_type,
        date: d.created_at,
      }))
    );
  };

  const stepProgress = { select: 0, response: 25, action: 50, validation: 75, summary: 100 };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 mx-4">
          <Progress value={stepProgress[step]} className="h-1.5" />
        </div>
        <span className="text-xs text-muted-foreground">{stepProgress[step]}%</span>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: SELECT */}
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold">Comment tu te sens aujourd'hui ?</h1>
              <p className="text-sm text-muted-foreground">Choisis sans réfléchir</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce que je ressens</p>
              <div className="grid grid-cols-2 gap-2">
                {negativeEmotions.map((e, i) => (
                  <motion.button
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelect(e)}
                    className="flex items-center gap-2 rounded-xl bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md text-sm"
                  >
                    <span className="text-lg">{e.emoji}</span>
                    <span className="font-medium">{e.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Du positif aussi</p>
              <div className="grid grid-cols-2 gap-2">
                {positiveEmotions.map((e, i) => (
                  <motion.button
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelect(e)}
                    className="flex items-center gap-2 rounded-xl bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md text-sm border border-primary/10"
                  >
                    <span className="text-lg">{e.emoji}</span>
                    <span className="font-medium">{e.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: RESPONSE */}
        {step === "response" && selected && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center space-y-8"
          >
            <span className="text-5xl">{selected.emoji}</span>
            <div className="space-y-4 max-w-sm">
              <h2 className="text-lg font-bold">{selected.label}</h2>
              <p className="text-sm leading-relaxed">{selected.response}</p>
              <p className="text-sm text-primary font-medium italic">"{selected.reassurance}"</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setStep("action")}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
            >
              Aide-moi à redescendre
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: ACTION */}
        {step === "action" && selected && (
          <motion.div
            key="action"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center space-y-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
              <Heart className="h-10 w-10 text-primary" />
            </motion.div>

            <div className="space-y-3 max-w-sm">
              <h2 className="text-lg font-bold">{selected.action.instruction}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.action.details}</p>
              <p className="text-xs text-muted-foreground">⏱ {selected.action.duration}</p>
            </div>

            {!actionDone ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleActionComplete}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
              >
                C'est fait ✓
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <p className="text-primary font-bold">Bien joué 💛</p>
                <p className="text-xs text-muted-foreground">Redirection…</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: VALIDATION (non-premium ending) */}
        {step === "validation" && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-5xl"
            >
              🌿
            </motion.div>

            <div className="space-y-3 max-w-sm">
              <h2 className="text-lg font-bold">Tu viens de faire redescendre ton système nerveux</h2>
              <p className="text-sm text-muted-foreground">
                Ce que tu viens de faire compte. Chaque micro-action régule ton corps.
              </p>
            </div>

            {!isPremium && (
              <div className="rounded-2xl bg-card p-6 shadow-sm space-y-3 w-full max-w-sm">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <p className="font-bold text-sm">Tu peux aller plus loin</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Suis ta progression, accède à ton historique émotionnel et vraiment sortir de cet état.
                </p>
                <Link
                  to="/aller-plus-loin"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
                >
                  Débloquer le suivi complet
                </Link>
              </div>
            )}

            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Retour
            </Link>
          </motion.div>
        )}

        {/* STEP 5: SUMMARY (premium) */}
        {step === "summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 flex flex-1 flex-col space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <span className="text-4xl">🌿</span>
              <h2 className="mt-3 text-lg font-bold">Tu viens de faire redescendre ton système nerveux</h2>
            </motion.div>

            {/* Weekly summary */}
            <div className="rounded-2xl bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Ta semaine</h3>
              </div>

              {weeklyData.length === 0 ? (
                <p className="text-xs text-muted-foreground">C'est ton premier check-in ! Reviens demain pour voir ta progression.</p>
              ) : (
                <>
                  <WeeklySummaryContent data={weeklyData} />
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const day = new Date();
                      day.setDate(day.getDate() - (6 - i));
                      const dayStr = day.toISOString().split("T")[0];
                      const entry = weeklyData.find((d) => d.date.startsWith(dayStr));
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs ${
                            entry
                              ? entry.type === "positive"
                                ? "bg-primary/20 text-primary"
                                : "bg-destructive/15 text-destructive"
                              : "bg-secondary"
                          }`}
                        >
                          {["D", "L", "M", "M", "J", "V", "S"][day.getDay()]}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <Link
              to="/dashboard"
              className="mx-auto rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
            >
              Retour au tableau de bord
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WeeklySummaryContent = ({ data }: { data: { emotion: string; type: string; date: string }[] }) => {
  const positiveCount = data.filter((d) => d.type === "positive").length;
  const negativeCount = data.filter((d) => d.type === "negative").length;
  const total = data.length;

  const topEmotion = data.reduce<Record<string, number>>((acc, d) => {
    acc[d.emotion] = (acc[d.emotion] || 0) + 1;
    return acc;
  }, {});
  const mostFrequent = Object.entries(topEmotion).sort((a, b) => b[1] - a[1])[0];
  const emotionData = emotions.find((e) => e.id === mostFrequent?.[0]);

  return (
    <div className="space-y-2 text-sm">
      {positiveCount > 0 && (
        <p>
          Tu t'es sentie <span className="font-bold text-primary">positive {positiveCount} fois</span> cette semaine
        </p>
      )}
      {negativeCount > 0 && positiveCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {positiveCount > negativeCount
            ? "Tu progresses. Continue comme ça. 💛"
            : "Des jours difficiles, mais tu es là. C'est ce qui compte."}
        </p>
      )}
      {emotionData && mostFrequent[1] > 1 && (
        <p className="text-xs text-muted-foreground">
          Émotion la plus fréquente : {emotionData.emoji} {emotionData.label} ({mostFrequent[1]}x)
        </p>
      )}
      <p className="text-xs text-muted-foreground">{total} check-in{total > 1 ? "s" : ""} cette semaine</p>
    </div>
  );
};

export default Checkin;
