import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Heart, Lock, Sparkles, Check, AlertTriangle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { updateStreakAndBadges, type BadgeDef } from "@/lib/streaks";
import { emotions, type EmotionData } from "@/data/emotions";
import { getStreakLabel } from "@/data/streakLabels";
import { parentize } from "@/lib/parentize";
import { useParentType } from "@/hooks/useParentType";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import BadgeCelebration from "@/components/BadgeCelebration";
import MicroRewardPopup from "@/components/MicroRewardPopup";
import QuickBackLinks from "@/components/QuickBackLinks";
import { PREMIUM_CTA } from "@/lib/premiumOffer";

type Step = "select" | "response" | "teaser" | "action" | "after" | "evolution" | "validation" | "summary";

const PENDING_KEY = "ancrage:pendingCheckin";

type PendingCheckin = { emotionId: string; savedAt: number };

const readPendingCheckin = (): PendingCheckin | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckin;
    // Expire après 2h pour éviter les reprises fantômes
    if (!parsed?.emotionId || Date.now() - parsed.savedAt > 2 * 60 * 60 * 1000) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writePendingCheckin = (emotionId: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ emotionId, savedAt: Date.now() }),
    );
  } catch {
    // ignore
  }
};

const clearPendingCheckin = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
};

const progressLabels: Record<Step, string> = {
  select: "Écoute-toi",
  response: "On t'entend",
  teaser: "Va plus loin",
  action: "Redescends",
  after: "Et maintenant ?",
  evolution: "Ce qui a changé",
  validation: "Tu as avancé",
  summary: "Ta semaine",
};

const Checkin = () => {
  const { user, isPaid, eligibilityPhase, refreshEligibility } = useAuth();
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<EmotionData | null>(null);
  const [afterEmotion, setAfterEmotion] = useState<EmotionData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{ emotion: string; type: string; date: string }[]>([]);
  const [actionDone, setActionDone] = useState(false);
  const [newBadges, setNewBadges] = useState<BadgeDef[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState<{ reason: string; ticket?: string } | null>(null);

  const dismissBadges = useCallback(() => setNewBadges([]), []);

  const hasPaidAccess = isPaid === true || isPremium;
  const paymentStatusPending =
    !!user && !isPremium && (isPaid === null || eligibilityPhase === "checking");

  const refreshLocalProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("is_premium, current_streak")
      .eq("user_id", user.id)
      .single();
    setIsPremium(data?.is_premium ?? false);
    setStreakCount(data?.current_streak ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refreshEligibility();
  }, [user, refreshEligibility]);

  useEffect(() => {
    void refreshLocalProfile();
  }, [refreshLocalProfile]);

  // Reprise après paiement : si une émotion a été choisie en mode essai
  // puis que la personne est revenue payante, on enregistre le check-in
  // et on saute directement à l'étape exercice.
  useEffect(() => {
    if (!user || !hasPaidAccess) return;
    const pending = readPendingCheckin();
    if (!pending) return;
    const emotion = emotions.find((e) => e.id === pending.emotionId);
    if (!emotion) {
      clearPendingCheckin();
      return;
    }
    let cancelled = false;
    (async () => {
      await supabase.from("emotion_checkins").insert({
        user_id: user.id,
        emotion: emotion.id,
        emotion_type: emotion.type,
      });
      await supabase
        .from("profiles")
        .update({ last_emotion: emotion.id })
        .eq("user_id", user.id);
      const result = await updateStreakAndBadges(user.id);
      if (cancelled) return;
      if (result?.newBadges?.length) setNewBadges(result.newBadges);
      if (result?.streak) setStreakCount(result.streak);
      setSelected(emotion);
      setPaymentFailure(null);
      setStep("action");
      setShowReward(true);
      clearPendingCheckin();
    })();
    return () => {
      cancelled = true;
    };
  }, [user, hasPaidAccess]);

  useEffect(() => {
    if (step !== "teaser" || !selected || !hasPaidAccess) return;
    setPaymentFailure(null);
    setStep("action");
  }, [step, selected, hasPaidAccess]);

  // Polling discret sur l'écran teaser : tant que la personne attend la
  // confirmation du paiement Mollie, on re-vérifie son éligibilité toutes
  // les 4 secondes. Dès que isPaid bascule à true, l'effet de reprise
  // ci-dessus enregistre le check-in et passe à l'exercice automatiquement.
  useEffect(() => {
    if (step !== "teaser") return;
    if (!user) return;
    if (hasPaidAccess) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const interval = window.setInterval(() => {
      void refreshEligibility();
      void refreshLocalProfile();
    }, 4000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshEligibility();
        void refreshLocalProfile();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [step, user, isPaid, refreshEligibility, refreshLocalProfile]);

  // Détection d'un échec de paiement Mollie : on arrive ici via
  // /checkin?payment=failed&reason=...&ticket=... depuis PaymentPending.
  // On restaure l'émotion sélectionnée avant le paiement et on remet la
  // personne sur le teaser avec un bandeau d'échec + bouton "Réessayer".
  useEffect(() => {
    if (searchParams.get("payment") !== "failed") return;
    const reason = searchParams.get("reason") ?? "unknown";
    const ticket = searchParams.get("ticket") ?? undefined;
    setPaymentFailure({ reason, ticket });

    const pending = readPendingCheckin();
    if (pending) {
      const emotion = emotions.find((e) => e.id === pending.emotionId);
      if (emotion) {
        setSelected(emotion);
        setStep("teaser");
      }
    }

    // Nettoie l'URL pour éviter de rejouer le bandeau au refresh.
    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    next.delete("reason");
    next.delete("ticket");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const negativeEmotions = emotions.filter((e) => e.type === "negative");
  const positiveEmotions = emotions.filter((e) => e.type === "positive");

  const handleSelect = async (emotion: EmotionData) => {
    setSelected(emotion);
    setStep("response");

    // Aperçu non payant : pas de sauvegarde, pas de streak/badges.
    if (!user || !hasPaidAccess) {
      return;
    }

    setShowReward(true);
    await supabase.from("emotion_checkins").insert({
      user_id: user.id,
      emotion: emotion.id,
      emotion_type: emotion.type,
    });
    await supabase
      .from("profiles")
      .update({ last_emotion: emotion.id })
      .eq("user_id", user.id);
    const result = await updateStreakAndBadges(user.id);
    if (result?.newBadges?.length) {
      setNewBadges(result.newBadges);
    }
    if (result?.streak) {
      setStreakCount(result.streak);
    }
  };

  const handleContinueAfterResponse = () => {
    if (paymentStatusPending) {
      void refreshEligibility();
      return;
    }

    if (!hasPaidAccess) {
      setStep("teaser");
    } else {
      setStep("action");
    }
  };

  const handleUnlock = () => {
    if (selected) {
      writePendingCheckin(selected.id);
    }
    if (!user) {
      navigate("/auth?redirect=/checkin&action=pay");
      return;
    }
    startPayment();
  };

  const handleActionComplete = () => {
    setActionDone(true);
    setTimeout(() => setStep("after"), 1500);
  };

  const handleAfterSelect = (emotion: EmotionData) => {
    setAfterEmotion(emotion);
    setStep("evolution");
  };

  const handleEvolutionContinue = () => {
    if (hasPaidAccess) {
      loadWeeklySummary();
      setStep("summary");
    } else {
      setStep("validation");
    }
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

  const [parentType] = useParentType();

  const getStreakMessage = () => {
    const info = getStreakLabel(streakCount);
    if (streakCount <= 0) return "Tu viens de poser un premier geste pour toi.";
    return `${info.emoji} ${parentize(info.label, parentType)} — ${streakCount} jour${streakCount > 1 ? "s" : ""}`;
  };

  const getEvolutionMessage = () => {
    if (!selected || !afterEmotion) return "";
    const before = selected.type;
    const after = afterEmotion.type;

    if (before === "negative" && after === "positive") {
      return "Ton corps a redescendu. Ce que tu ressens maintenant, c'est toi qui l'as créé.";
    }
    if (before === "negative" && after === "negative") {
      return "C'est encore là. Et c'est normal. Tu as quand même fait quelque chose pour toi — et ça compte.";
    }
    if (before === "positive" && after === "positive") {
      return "Tu étais déjà dans un espace doux, et tu l'as renforcé. C'est précieux.";
    }
    return "Quelque chose a bougé en toi. Même un micro-changement, c'est déjà de la régulation.";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 py-6">
      <BadgeCelebration badges={newBadges} onDone={dismissBadges} />
      <MicroRewardPopup show={showReward} onDone={() => setShowReward(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="rounded-full p-2 hover:bg-secondary" aria-label="Retour au tableau de bord">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="text-xs text-muted-foreground font-medium">{progressLabels[step]}</p>
        <QuickBackLinks variant="inline" />
      </div>

      <div className="mx-auto mt-3 w-full max-w-md">
        <DiscoveryHint id="checkin-intro" title="Le rituel en 90 secondes">
          Pose-toi : choisis ton émotion, son intensité, puis laisse-toi guider.
          Tu peux quitter à tout moment, rien n'est perdu.
        </DiscoveryHint>
      </div>


      {/* Soft progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {(["select", "response", "action", "after", "evolution"] as Step[]).map((s, i) => {
          const steps: Step[] = ["select", "response", "action", "after", "evolution"];
          const currentIdx = steps.indexOf(step);
          return (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= currentIdx
                  ? "bg-primary w-6"
                  : "bg-secondary w-1.5"
              }`}
            />
          );
        })}
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
              <h1 className="text-xl font-bold">Comment tu te sens là, maintenant ?</h1>
              <p className="text-sm text-muted-foreground">Pas de bonne ou mauvaise réponse</p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce qui monte en toi</p>
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ce qui va mieux</p>
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

        {/* STEP 2: RESPONSE — emotional validation */}
        {step === "response" && selected && (
          <motion.div
            key="response"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center space-y-8"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-5xl"
            >
              {selected.emoji}
            </motion.span>
            <div className="space-y-4 max-w-sm">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                Tu ressens :
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold"
              >
                {selected.label}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm leading-relaxed"
              >
                {selected.response}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="rounded-xl bg-primary/10 p-4"
              >
                <p className="text-sm text-primary font-semibold">"{selected.reassurance}"</p>
              </motion.div>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleContinueAfterResponse}
              disabled={paymentStatusPending}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
            >
              {paymentStatusPending
                ? "Vérification…"
                : hasPaidAccess
                  ? "Aide-moi à redescendre"
                  : "Continuer"}
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2.5: TEASER (paywall après aperçu pour non payants) */}
        {step === "teaser" && selected && (
          <motion.div
            key="teaser"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-10 flex flex-1 flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                paymentFailure ? "bg-destructive/10" : "bg-primary/10"
              }`}
            >
              {paymentFailure ? (
                <AlertTriangle className="h-7 w-7 text-destructive" />
              ) : (
                <Lock className="h-7 w-7 text-primary" />
              )}
            </motion.div>

            {paymentFailure ? (
              <div className="space-y-2 max-w-sm">
                <h2 className="text-xl font-bold">Le paiement n'a pas été confirmé</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {paymentFailure.reason === "profile_not_found"
                    ? "On n'a pas pu retrouver ton profil après le paiement. Si tu as bien été débitée, réessaie ci-dessous ou contacte le support."
                    : "Ton paiement a peut-être été annulé, refusé par ta banque, ou la confirmation Mollie n'est pas arrivée. Aucune somme n'a été retenue tant que le paiement n'est pas confirmé."}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ton émotion est gardée — tu peux réessayer maintenant et reprendre exactement là où tu en étais.
                </p>
                {paymentFailure.ticket && (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Ticket : {paymentFailure.ticket}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-w-sm">
                <h2 className="text-xl font-bold">Tu as commencé. Continue jusqu'au bout.</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tu viens d'identifier ce que tu ressens. La suite — l'exercice qui apaise ton corps, le suivi de ton évolution et ton résumé hebdo — t'attend.
                </p>
              </div>
            )}

            <ul className="w-full max-w-sm space-y-2 rounded-2xl bg-card p-5 shadow-sm text-left">
              {[
                "L'exercice ciblé pour faire redescendre ton corps",
                "Le bilan « avant / après » pour mesurer ce qui change",
                "Ton résumé hebdo et tes badges de progression",
                "Accès à toute l'app à vie, sans abonnement",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleUnlock}
              disabled={paymentLoading}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {paymentLoading
                ? "Chargement…"
                : paymentFailure
                  ? "Réessayer le paiement"
                  : "Débloquer la suite"}
            </motion.button>

            {user && !hasPaidAccess && (
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Dès que ton paiement est confirmé, la suite se débloque ici automatiquement.
              </p>
            )}

            <button
              onClick={() => setStep("select")}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              Choisir une autre émotion
            </button>
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
                <p className="text-xs text-muted-foreground">Ton corps te remercie…</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: AFTER — how do you feel now? */}
        {step === "after" && (
          <motion.div
            key="after"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                Tu as fait redescendre ton corps
              </motion.p>
              <h1 className="text-xl font-bold">Et maintenant, comment tu te sens ?</h1>
              <p className="text-sm text-muted-foreground">Même un micro-changement compte</p>
            </div>

            <div className="space-y-3">
              {/* Show a curated subset — mix of positive shifts and still-struggling */}
              {[
                ...positiveEmotions.slice(0, 6),
                ...negativeEmotions.slice(0, 4),
              ].map((e, i) => (
                <motion.button
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAfterSelect(e)}
                  className="flex w-full items-center gap-3 rounded-xl bg-card p-3.5 text-left shadow-sm text-sm"
                >
                  <span className="text-lg">{e.emoji}</span>
                  <span className="font-medium">{e.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 5: EVOLUTION — before vs after */}
        {step === "evolution" && selected && afterEmotion && (
          <motion.div
            key="evolution"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 flex flex-1 flex-col items-center justify-center text-center space-y-8"
          >
            {/* Before → After visual */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.5, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-1 rounded-xl bg-card p-4 opacity-50"
              >
                <span className="text-3xl">{selected.emoji}</span>
                <span className="text-xs text-muted-foreground">Avant</span>
                <span className="text-xs font-medium">{selected.label}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-xl text-primary"
              >
                →
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-1 rounded-xl bg-primary/10 p-4 ring-2 ring-primary/20"
              >
                <span className="text-3xl">{afterEmotion.emoji}</span>
                <span className="text-xs text-primary font-medium">Après</span>
                <span className="text-xs font-medium">{afterEmotion.label}</span>
              </motion.div>
            </div>

            {/* Emotional message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3 max-w-sm"
            >
              <p className="text-sm leading-relaxed font-medium">{getEvolutionMessage()}</p>
              <p className="text-xs text-muted-foreground italic">{getStreakMessage()}</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleEvolutionContinue}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Sparkles className="h-4 w-4" />
              Continuer
            </motion.button>
          </motion.div>
        )}

        {/* STEP 6: VALIDATION (non-premium ending) */}
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
              <h2 className="text-lg font-bold">Tu viens de prendre soin de toi</h2>
              <p className="text-sm text-muted-foreground">
                Ce que tu viens de faire, la plupart des gens ne le font jamais. Tu as écouté ton corps, tu l'as aidé à redescendre.
              </p>
              <p className="text-sm text-primary font-medium">C'est ça, avancer. Pas à pas. 💛</p>
            </div>

            {!isPremium && (
              <div className="rounded-2xl bg-card p-6 shadow-sm space-y-3 w-full max-w-sm">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <p className="font-bold text-sm">Tu peux aller plus loin</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Comprends tes schémas, suis ton évolution et apprends à sortir durablement de cet état.
                </p>
                <button
                  onClick={handleUnlock}
                  disabled={paymentLoading}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-60"
                >
                  {paymentLoading ? "Chargement…" : PREMIUM_CTA.unlock_full_program}
                </button>
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

        {/* STEP 7: SUMMARY (premium) */}
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
              className="text-center space-y-2"
            >
              <span className="text-4xl">🌿</span>
              <h2 className="mt-3 text-lg font-bold">Tu prends soin de toi, et ça se voit</h2>
              <p className="text-sm text-muted-foreground">{getStreakMessage()}</p>
            </motion.div>

            {/* Weekly summary */}
            <div className="rounded-2xl bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Comment tu as évolué cette semaine</h3>
              </div>

              {weeklyData.length === 0 ? (
                <p className="text-xs text-muted-foreground">C'est ton premier check-in ! Reviens demain pour voir comment tu évolues.</p>
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
              Retour à mon espace
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

  const getMessage = () => {
    if (total === 1) return "Tu commences à t'écouter. C'est le geste le plus important.";
    if (positiveCount > negativeCount) return "Tu vas de mieux en mieux. Ton corps apprend à se réguler. 💛";
    if (positiveCount === negativeCount) return "Des hauts et des bas — c'est le chemin. Tu es présente, c'est ce qui compte.";
    return "Des jours difficiles, mais tu es revenue à chaque fois. C'est ta force.";
  };

  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">{getMessage()}</p>
      {emotionData && mostFrequent[1] > 1 && (
        <p className="text-xs text-muted-foreground">
          Tu as souvent ressenti : {emotionData.emoji} {emotionData.label}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {total} moment{total > 1 ? "s" : ""} pour toi cette semaine
      </p>
    </div>
  );
};

export default Checkin;
