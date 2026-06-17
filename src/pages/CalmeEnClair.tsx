import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Flame, Sparkles, TrendingUp, Smile, Wind, AlertCircle, Sun, Moon, ArrowRight, Check, X, Hand } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getActionStyle, setActionStyle, type ActionStyle } from "@/lib/actionStyle";

type MoodKey = "calm" | "ok" | "tense" | "overflow";

const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string; adjust: number }[] = [
  { key: "calm",     emoji: "🌿", label: "Sereine",     adjust: +10 },
  { key: "ok",       emoji: "🙂", label: "Ça va",       adjust: +3  },
  { key: "tense",    emoji: "😣", label: "Tendue",      adjust: -8  },
  { key: "overflow", emoji: "🌊", label: "Débordée",    adjust: -15 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

type MicroAction = {
  emoji: string;
  title: string;
  duration: string;
  steps: string[];
  why: string;
};

type ActionVariants = { breathing: MicroAction; sensory: MicroAction };

const MICRO_ACTIONS: Record<MoodKey, ActionVariants> = {
  calm: {
    breathing: {
      emoji: "🌿",
      title: "Ancrer ce calme — souffle long",
      duration: "2 min",
      steps: [
        "Pose une main sur ton cœur, une sur ton ventre.",
        "Inspire 4 sec, expire 6 sec — 8 fois.",
        "Note mentalement : « Ce calme m'appartient. »",
      ],
      why: "Le souffle long imprime la sensation de calme.",
    },
    sensory: {
      emoji: "🌿",
      title: "Ancrer ce calme — par les sens",
      duration: "2 min",
      steps: [
        "Pose tes mains sur une surface : note la texture, la température.",
        "Repère 3 sons agréables autour de toi.",
        "Choisis 1 image mentale à garder de ce moment.",
      ],
      why: "Tes sens gravent la mémoire du calme.",
    },
  },
  ok: {
    breathing: {
      emoji: "🙂",
      title: "Renforcer ton équilibre — respiration douce",
      duration: "2 min",
      steps: [
        "Inspire 4 sec, expire 4 sec — 6 fois, calmement.",
        "À chaque expiration, relâche les épaules.",
        "Cite 1 chose qui va, là, maintenant.",
      ],
      why: "Petit souffle pour consolider ton « ça va ».",
    },
    sensory: {
      emoji: "🙂",
      title: "Renforcer ton équilibre — par les sens",
      duration: "2 min",
      steps: [
        "Étire doucement ta nuque (3 cercles de chaque côté).",
        "Bois un grand verre d'eau lentement, sens-la descendre.",
        "Cite 1 chose qui va, là, maintenant.",
      ],
      why: "Le corps confirme : « ça va, vraiment ».",
    },
  },
  tense: {
    breathing: {
      emoji: "😣",
      title: "Relâcher la tension — respiration carrée",
      duration: "2 min",
      steps: [
        "Décroche les épaules — laisse-les tomber 3 fois.",
        "Respire en carré : 4 sec inspire, 4 sec pause, 4 sec expire, 4 sec pause (×6).",
        "Sens ta mâchoire se desserrer.",
      ],
      why: "La respiration carrée sort du mode « alerte ».",
    },
    sensory: {
      emoji: "😣",
      title: "Relâcher la tension — ancrage par les sens",
      duration: "2 min",
      steps: [
        "Pose les pieds au sol : sens leur poids.",
        "Regarde autour : nomme 3 objets que tu vois, 2 sons que tu entends.",
        "Passe une main fraîche sur ton visage ou ta nuque.",
      ],
      why: "Tes sens te ramènent ici, hors de la vigilance.",
    },
  },
  overflow: {
    breathing: {
      emoji: "🌊",
      title: "Calmer la vague — souffle d'urgence",
      duration: "2 min",
      steps: [
        "Inspire 4 sec par le nez, expire 8 sec par la bouche (×6).",
        "À chaque expiration, dis tout bas : « ça passe ».",
        "Pose une main sur ton ventre, sens-le bouger.",
      ],
      why: "L'expiration longue freine la panique en 1 minute.",
    },
    sensory: {
      emoji: "🌊",
      title: "Revenir dans ton corps — 5-4-3-2-1",
      duration: "2 min",
      steps: [
        "Pose les pieds bien à plat. Sens le sol.",
        "5-4-3-2-1 : 5 choses vues, 4 entendues, 3 touchées, 2 senties, 1 goûtée.",
        "Dis-toi : « La vague passe. Je suis là. »",
      ],
      why: "Eclosia sensoriel pour sortir du débordement.",
    },
  },
};

const CalmeEnClair = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [checkins14d, setCheckins14d] = useState(0);
  const [baseScore, setBaseScore] = useState(50);
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [last7, setLast7] = useState<{ date: Date; count: number }[]>([]);
  const [last14Scores, setLast14Scores] = useState<{ date: Date; score: number; count: number }[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [actionStyle, setActionStyleState] = useState<ActionStyle>(() => getActionStyle());

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActionStyle>).detail;
      if (detail) setActionStyleState(detail);
    };
    window.addEventListener("calm-action-style-change", handler);
    return () => window.removeEventListener("calm-action-style-change", handler);
  }, []);

  const updateStyle = (s: ActionStyle) => {
    setActionStyleState(s);
    setActionStyle(s);
  };

  // Load today's saved mood (Supabase first with local cache fallback)
  useEffect(() => {
    if (!user) return;
    // Optimistic from local cache
    const cached = localStorage.getItem(`calm_mood_${user.id}_${todayKey()}`);
    if (cached && MOOD_OPTIONS.some((m) => m.key === cached)) {
      setMood(cached as MoodKey);
    }
    // Authoritative from DB
    (async () => {
      const { data, error } = await supabase
        .from("mood_responses")
        .select("mood")
        .eq("user_id", user.id)
        .eq("response_date", todayKey())
        .maybeSingle();
      if (!error && data?.mood && MOOD_OPTIONS.some((m) => m.key === data.mood)) {
        setMood(data.mood as MoodKey);
        localStorage.setItem(`calm_mood_${user.id}_${todayKey()}`, data.mood);
      } else if (!error && !data) {
        // No remote answer for today — clear stale local cache
        if (cached) {
          localStorage.removeItem(`calm_mood_${user.id}_${todayKey()}`);
          setMood(null);
        }
      }
    })();
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

      // 28-day window: needed to compute 14-day rolling count for each of last 14 days
      const startWindow = new Date();
      startWindow.setHours(0, 0, 0, 0);
      startWindow.setDate(startWindow.getDate() - 27);
      const { data: rows } = await supabase
        .from("emotion_checkins")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", startWindow.toISOString());

      // Daily counts over 28 days
      const dayCounts = Array.from({ length: 28 }).map(() => 0);
      (rows ?? []).forEach((r: { created_at: string }) => {
        const d = new Date(r.created_at);
        const idx = Math.floor((d.getTime() - startWindow.getTime()) / 86400000);
        if (idx >= 0 && idx < 28) dayCounts[idx] += 1;
      });

      // 7-day mini chart (last 7 days)
      const last7Buckets = Array.from({ length: 7 }).map((_, i) => {
        const dayIdx = 21 + i; // last 7 of 28
        const d = new Date(startWindow);
        d.setDate(startWindow.getDate() + dayIdx);
        return { date: d, count: dayCounts[dayIdx] };
      });
      setLast7(last7Buckets);

      // 14-day score evolution: for each of the last 14 days, compute score using
      // streak (approximated by consecutive non-zero days ending that day, capped 20)
      // and 14-day rolling check-in count up to that day.
      const series = Array.from({ length: 14 }).map((_, i) => {
        const dayIdx = 14 + i; // last 14 of 28
        const d = new Date(startWindow);
        d.setDate(startWindow.getDate() + dayIdx);

        // rolling 14-day count ending this day
        let rolling = 0;
        for (let k = dayIdx - 13; k <= dayIdx; k++) {
          if (k >= 0) rolling += dayCounts[k];
        }
        // approximate streak ending this day
        let approxStreak = 0;
        for (let k = dayIdx; k >= 0; k--) {
          if (dayCounts[k] > 0) approxStreak += 1;
          else break;
        }
        const score = Math.max(
          20,
          Math.min(98, 40 + Math.min(approxStreak, 20) * 2 + Math.min(rolling, 14) * 1.5),
        );
        return { date: d, score: Math.round(score), count: dayCounts[dayIdx] };
      });
      setLast14Scores(series);

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

  const [skipped, setSkipped] = useState(false);

  const selectMood = async (key: MoodKey) => {
    setMood(key);
    setSkipped(false);
    if (!user) return;
    localStorage.setItem(`calm_mood_${user.id}_${todayKey()}`, key);
    const adjust = MOOD_OPTIONS.find((m) => m.key === key)?.adjust ?? 0;
    const { error } = await supabase.from("mood_responses").upsert(
      {
        user_id: user.id,
        response_date: todayKey(),
        mood: key,
        adjust,
      },
      { onConflict: "user_id,response_date" },
    );
    if (error) console.error("mood upsert failed", error);
  };

  const skipMood = async () => {
    setMood(null);
    setSkipped(true);
    if (!user) return;
    localStorage.removeItem(`calm_mood_${user.id}_${todayKey()}`);
    const { error } = await supabase
      .from("mood_responses")
      .delete()
      .eq("user_id", user.id)
      .eq("response_date", todayKey());
    if (error) console.error("mood delete failed", error);
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
            <button
              onClick={skipMood}
              className={`block w-full rounded-xl border border-dashed px-4 py-3 text-sm transition-colors ${
                skipped
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              Je ne sais pas / Pas maintenant
            </button>
            {mood && (
              <p className="text-center text-xs text-muted-foreground">
                Merci. Ton ressenti ajuste le score de {moodAdjust >= 0 ? "+" : ""}
                {moodAdjust} point{Math.abs(moodAdjust) > 1 ? "s" : ""}.
              </p>
            )}
            {skipped && !mood && (
              <p className="text-center text-xs text-muted-foreground">
                Pas de souci 💛 Ton score reste basé sur ton activité — tu peux revenir plus tard.
              </p>
            )}
          </section>

          {/* Micro-action 2 min adaptée au mood */}
          <AnimatePresence mode="wait">
            {mood && (() => {
              const variants = MICRO_ACTIONS[mood];
              // If user has no preference, default to sensory for overflow (panic),
              // breathing for tense, and breathing for calm/ok.
              const fallback: "breathing" | "sensory" =
                mood === "overflow" ? "sensory" : "breathing";
              const variantKey: "breathing" | "sensory" =
                actionStyle === "any" ? fallback : actionStyle;
              const action = variants[variantKey];
              return (
                <motion.section
                  key={`${mood}-${variantKey}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/20 p-6 shadow-soft space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none">{action.emoji}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                          <Sparkles className="h-3 w-3" />
                          Micro-action · {action.duration}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold leading-tight">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{action.why}</p>
                    </div>
                  </div>

                  <ol className="space-y-2 pl-1">
                    {action.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground/90">
                        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Style preference selector */}
                  <div className="rounded-xl border border-primary/15 bg-background/60 p-3 space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Mon style préféré pour ces exercices
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { key: "breathing", label: "Respiration", icon: Wind },
                        { key: "sensory", label: "Sensoriel", icon: Hand },
                        { key: "any", label: "Au choix", icon: Sparkles },
                      ] as const).map((opt) => {
                        const Icon = opt.icon;
                        const active = actionStyle === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => updateStyle(opt.key)}
                            className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            <Icon className="h-3 w-3" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Tes prochaines micro-actions s'adapteront à ce style.
                    </p>
                  </div>

                  <p className="text-center text-[11px] text-muted-foreground italic">
                    Suggérée parce que tu te sens « {MOOD_OPTIONS.find((m) => m.key === mood)?.label.toLowerCase()} » aujourd'hui.
                  </p>
                </motion.section>
              );
            })()}
          </AnimatePresence>


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

          {/* 7-day mini chart */}
          <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-serif text-xl font-semibold">Tes 7 derniers jours</h2>
              <span className="text-xs text-muted-foreground">
                {last7.reduce((a, b) => a + b.count, 0)} check-in
                {last7.reduce((a, b) => a + b.count, 0) > 1 ? "s" : ""}
              </span>
            </div>
            {(() => {
              const max = Math.max(1, ...last7.map((d) => d.count));
              const dayLabels = ["D", "L", "M", "M", "J", "V", "S"];
              return (
                <div className="flex items-end justify-between gap-2 h-28">
                  {last7.map((d, i) => {
                    const heightPct = (d.count / max) * 100;
                    const isToday = i === last7.length - 1;
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="relative flex w-full flex-1 items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className={`w-full rounded-t-md ${
                              d.count === 0
                                ? "bg-muted"
                                : isToday
                                ? "bg-primary"
                                : "bg-primary/50"
                            }`}
                            style={{ minHeight: d.count > 0 ? "6px" : "2px" }}
                          />
                          {d.count > 0 && (
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary">
                              {d.count}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] ${
                            isToday ? "font-bold text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {dayLabels[d.date.getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <p className="text-center text-xs text-muted-foreground">
              Chaque jour où tu reviens nourrit ton calme.
            </p>
          </section>

          {/* 14-day calm score evolution */}
          <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-serif text-xl font-semibold">Évolution sur 14 jours</h2>
              <span className="text-xs text-muted-foreground">Touche un point</span>
            </div>
            {(() => {
              const W = 320;
              const H = 120;
              const padX = 14;
              const padY = 18;
              const n = last14Scores.length;
              if (n === 0) {
                return (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    Pas encore assez d'historique pour afficher la courbe.
                  </p>
                );
              }
              const minS = 20;
              const maxS = 100;
              const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, n - 1);
              const y = (s: number) =>
                padY + (1 - (s - minS) / (maxS - minS)) * (H - padY * 2);

              const linePath = last14Scores
                .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.score).toFixed(1)}`)
                .join(" ");
              const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${H - padY} L${x(0).toFixed(1)},${H - padY} Z`;

              const selected =
                selectedDayIdx !== null ? last14Scores[selectedDayIdx] : null;

              return (
                <>
                  <div className="relative">
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      className="w-full h-32"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="calmGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0, 0.5, 1].map((t) => (
                        <line
                          key={t}
                          x1={padX}
                          x2={W - padX}
                          y1={padY + t * (H - padY * 2)}
                          y2={padY + t * (H - padY * 2)}
                          stroke="hsl(var(--border))"
                          strokeDasharray="2 3"
                        />
                      ))}
                      <path d={areaPath} fill="url(#calmGrad)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {last14Scores.map((d, i) => {
                        const isSel = selectedDayIdx === i;
                        const isToday = i === n - 1;
                        return (
                          <g key={i}>
                            <circle
                              cx={x(i)}
                              cy={y(d.score)}
                              r={12}
                              fill="transparent"
                              onClick={() => setSelectedDayIdx(i)}
                              style={{ cursor: "pointer" }}
                            />
                            <circle
                              cx={x(i)}
                              cy={y(d.score)}
                              r={isSel ? 5 : isToday ? 4 : 3}
                              fill={isSel || isToday ? "hsl(var(--primary))" : "hsl(var(--card))"}
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              style={{ pointerEvents: "none" }}
                            />
                          </g>
                        );
                      })}
                    </svg>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1 -mt-1">
                      <span>
                        {last14Scores[0].date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                      <span>
                        {last14Scores[Math.floor(n / 2)].date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                      <span className="font-semibold text-primary">Aujourd'hui</span>
                    </div>
                  </div>

                  <motion.div
                    key={selectedDayIdx ?? "default"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl bg-primary/5 border border-primary/15 p-4"
                  >
                    {selected ? (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {selected.date.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                          <p className="font-serif text-2xl font-semibold text-primary">
                            {selected.score}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl font-semibold">
                            {selected.count}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            check-in{selected.count > 1 ? "s" : ""} ce jour-là
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">
                        Touche un point pour voir le détail d'un jour.
                      </p>
                    )}
                  </motion.div>
                </>
              );
            })()}
          </section>

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

          {/* What counts / What doesn't */}
          <section className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Ce qui compte, ce qui ne compte pas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ton score n'est pas une note. C'est juste un repère vivant.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Counts */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-serif text-lg font-semibold text-primary">
                    Ce qui compte
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    <span>Tes <strong>check-ins émotionnels</strong>, positifs comme négatifs.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    <span>Le <strong>fait de revenir</strong>, même 30 secondes.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    <span>Tes <strong>jours de suite</strong> (jusqu'à 20).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    <span>Ton <strong>ressenti du jour</strong> via la question rapide.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-0.5">·</span>
                    <span>L'utilisation du mode <strong>« Sors du mode survie »</strong>.</span>
                  </li>
                </ul>
              </div>

              {/* Doesn't count */}
              <div className="rounded-2xl border border-border bg-muted/40 p-5 shadow-soft space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="font-serif text-lg font-semibold text-muted-foreground">
                    Ce qui ne compte pas
                  </p>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-0.5">·</span>
                    <span><strong>La nature</strong> de ton émotion. Triste ou joyeuse, c'est pareil.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">·</span>
                    <span><strong>Le temps passé</strong> dans l'app. Pas besoin de "performer".</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">·</span>
                    <span><strong>Les jours manqués</strong> ne te font pas reculer.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">·</span>
                    <span><strong>Comparer</strong> ton score à celui d'hier — ou de quelqu'un d'autre.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5">·</span>
                    <span>L'objectif <strong>n'est pas 100 %</strong>. Il n'existe pas.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-secondary/40 to-primary/10 p-5 text-center shadow-soft">
              <p className="text-sm font-medium">
                💛 Le score est un <span className="text-primary font-semibold">miroir</span>, pas un juge.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Si tu ne sais pas quoi cocher, tape même "je ne sais pas". Ça compte aussi.
              </p>
            </div>
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

          {/* Personalized actions */}
          <section className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Pour toi, maintenant</h2>
              <p className="text-sm text-muted-foreground mt-1">
                4 micro-actions choisies selon ton score et tes habitudes.
              </p>
            </div>
            {(() => {
              const isLow = calmScore < 50;
              const isMid = calmScore >= 50 && calmScore < 75;
              const fewCheckins = checkins14d < 3;
              const noStreak = streak === 0;
              const isOverflow = mood === "overflow" || mood === "tense";
              const hour = new Date().getHours();
              const isMorning = hour < 14;

              type Action = {
                icon: typeof Heart;
                title: string;
                desc: string;
                to: string;
                cta: string;
                tone: "primary" | "destructive" | "soft";
              };

              const all: Action[] = [];

              if (isOverflow || isLow) {
                all.push({
                  icon: AlertCircle,
                  title: "Sors du mode survie",
                  desc: "60 secondes guidées pour calmer ton système nerveux.",
                  to: "/urgence",
                  cta: "Faire maintenant",
                  tone: "destructive",
                });
              }

              all.push({
                icon: Wind,
                title: isLow ? "Régule en 30 secondes" : "Ancre ce moment",
                desc: isLow
                  ? "Une respiration courte pour redescendre tout de suite."
                  : "Un check-in rapide pour entretenir ton calme.",
                to: "/checkin",
                cta: "Faire maintenant",
                tone: "primary",
              });

              if (fewCheckins) {
                all.push({
                  icon: Sparkles,
                  title: "Reprends le rythme",
                  desc: `Tu n'as fait que ${checkins14d} check-in${checkins14d > 1 ? "s" : ""} en 14 jours. Un par jour suffit.`,
                  to: "/checkin",
                  cta: "Faire maintenant",
                  tone: "soft",
                });
              } else if (noStreak) {
                all.push({
                  icon: Flame,
                  title: "Démarre une nouvelle série",
                  desc: "Reviens aujourd'hui pour relancer ton compteur.",
                  to: "/checkin",
                  cta: "Faire maintenant",
                  tone: "soft",
                });
              } else {
                all.push({
                  icon: Flame,
                  title: `Protège ta série de ${streak} jour${streak > 1 ? "s" : ""}`,
                  desc: "Un mini check-in aujourd'hui pour ne rien perdre.",
                  to: "/checkin",
                  cta: "Faire maintenant",
                  tone: "soft",
                });
              }

              if (isMid) {
                all.push({
                  icon: TrendingUp,
                  title: "Regarde tes 7 derniers jours",
                  desc: "Visualise ce qui te fait du bien — et ce qui pèse.",
                  to: "/historique",
                  cta: "Voir mes données",
                  tone: "soft",
                });
              } else if (calmScore >= 75) {
                all.push({
                  icon: Heart,
                  title: "Capitalise sur ton élan",
                  desc: "Profite de cet état pour explorer un nouveau ressource.",
                  to: "/aller-plus-loin",
                  cta: "Explorer",
                  tone: "soft",
                });
              } else {
                all.push({
                  icon: Heart,
                  title: "Note ce que tu ressens",
                  desc: "Mettre des mots libère 30 % de la charge émotionnelle.",
                  to: "/checkin",
                  cta: "Faire maintenant",
                  tone: "soft",
                });
              }

              all.push({
                icon: isMorning ? Sun : Moon,
                title: isMorning ? "Pose ton intention du jour" : "Dépose ta journée",
                desc: isMorning
                  ? "Une phrase douce pour orienter ta journée."
                  : "Relâche ce que tu as porté avant la nuit.",
                to: "/checkin",
                cta: "Faire maintenant",
                tone: "soft",
              });

              const actions = all.slice(0, 4);

              return (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {actions.map((a, i) => {
                    const Icon = a.icon;
                    const toneCard =
                      a.tone === "destructive"
                        ? "bg-destructive/10 border-destructive/20"
                        : a.tone === "primary"
                        ? "bg-gradient-to-br from-primary/15 to-secondary/30 border-primary/20"
                        : "bg-card border-border";
                    const toneIcon =
                      a.tone === "destructive"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-primary/10 text-primary";
                    const toneBtn =
                      a.tone === "destructive"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`flex flex-col rounded-2xl border p-5 shadow-soft ${toneCard}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneIcon}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-serif text-lg font-semibold leading-tight">
                              {a.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground flex-1 mb-4">
                          {a.desc}
                        </p>
                        <Link
                          to={a.to}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${toneBtn}`}
                        >
                          {a.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        {a.tone === "destructive" && (
                          <Link
                            to="/danger"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <AlertCircle className="h-3.5 w-3.5" />
                            Je suis en danger
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
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
