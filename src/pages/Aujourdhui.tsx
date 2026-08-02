import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Settings,
  Clock,
  Pill,
  CheckCircle2,
  Receipt,
  Moon,
  Sprout,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTodayFeed } from "@/hooks/useTodayFeed";
import { toast } from "@/hooks/use-toast";
import { getCachedAddressLabel, hasCompletedOnboarding } from "@/lib/onboarding";

/**
 * « Aujourd'hui » — le tableau de bord.
 *
 * En moins de cinq secondes : comment je vais, ce qui compte aujourd'hui,
 * deux gestes possibles. Aucun bloc vide n'est affiché.
 */

const MOODS = [
  { id: "submergee", type: "negative" as const, label: "Submergée" },
  { id: "epuisee", type: "negative" as const, label: "Épuisée" },
  { id: "stable", type: "positive" as const, label: "Ça va" },
  { id: "apaisee", type: "positive" as const, label: "Apaisée" },
  { id: "fiere", type: "positive" as const, label: "Fière" },
];

const KIND_ICON = {
  rdv: Clock,
  medicament: Pill,
  tache: CheckCircle2,
  facture: Receipt,
  routine: Clock,
  document: Receipt,
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "Cette nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bel après-midi";
  return "Bonsoir";
};

/** Phrase bienveillante — jamais culpabilisante, adaptée au moment. */
const kindPhrase = (calm: number | null) => {
  const h = new Date().getHours();
  if (calm !== null && calm < 40) return "Un pas à la fois. Ça suffit largement.";
  if (calm !== null && calm >= 75) return "Quelque chose s'apaise. Garde ce rythme.";
  if (h < 12) return "Aujourd'hui aussi, tu fais déjà de ton mieux.";
  if (h < 18) return "Tu peux poser ce que tu portes, un instant.";
  return "La journée se referme. Tu as tenu.";
};

const calmLabel = (calm: number) => {
  if (calm < 35) return "Tempête";
  if (calm < 55) return "Fatiguée";
  if (calm < 75) return "Stable";
  return "Calme";
};

const Aujourdhui = () => {
  const feed = useTodayFeed();
  const navigate = useNavigate();
  const [savedMood, setSavedMood] = useState<string | null>(null);

  // Premier passage : on propose l'accueil personnalisé, jamais imposé deux fois.
  useEffect(() => {
    if (!hasCompletedOnboarding()) navigate("/bienvenue", { replace: true });
  }, [navigate]);

  /** Formule d'appel choisie pendant l'accueil, sinon le prénom. */
  const addressLabel = getCachedAddressLabel() || feed.firstName;

  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const saveMood = async (mood: (typeof MOODS)[number]) => {
    setSavedMood(mood.id);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    await supabase.from("emotion_checkins").insert({
      user_id: uid,
      emotion: mood.id,
      emotion_type: mood.type,
    });
    await supabase
      .from("profiles")
      .update({ last_emotion: mood.id, last_checkin_date: new Date().toISOString().slice(0, 10) })
      .eq("user_id", uid);
    toast({ description: "C'est noté. Merci de t'être écoutée." });
    feed.reload();
    if (mood.type === "negative") navigate("/moi/apaisement");
  };

  const done = feed.checkedInToday || savedMood;
  const calm = feed.calmScore;

  const fade = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-6 pb-10 pt-10">
        {/* 1 — Bonjour + phrase bienveillante */}
        <motion.header {...fade(0)} className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-3xl text-foreground">
              {greeting()}
              {addressLabel ? ` ${addressLabel}` : ""} 👋
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {kindPhrase(calm)}
            </p>
            <p className="mt-1 text-xs capitalize text-muted-foreground/70">{dateLabel}</p>
          </div>
          <Link
            to="/plus/profil"
            aria-label="Réglages"
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </motion.header>

        {/* 2 — Score émotionnel, ou le seul geste demandé */}
        <motion.section
          {...fade(1)}
          className="rounded-[24px] border border-border/70 bg-card px-6 py-6"
        >
          {done && calm !== null ? (
            <Link to="/moi/emotions" className="block">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {calmLabel(calm)}
                  </p>
                  <p className="mt-1 font-serif text-5xl leading-none text-foreground tabular-nums">
                    {calm}
                    <span className="ml-1 align-top text-lg text-muted-foreground">%</span>
                  </p>
                </div>
                {feed.calmDelta !== null && feed.calmDelta !== 0 && (
                  <span
                    className={`flex items-center gap-1 rounded-full bg-secondary/50 px-2.5 py-1 text-xs font-medium ${
                      feed.calmDelta > 0 ? "text-primary-dark" : "text-muted-foreground"
                    }`}
                  >
                    {feed.calmDelta > 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    {Math.abs(feed.calmDelta)} pts depuis hier
                  </span>
                )}
              </div>
              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.span
                  className="block h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${calm}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </Link>
          ) : done ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Tu t'es écoutée aujourd'hui. C'est déjà beaucoup.
              </p>
              <Link to="/moi/emotions" className="text-xs font-medium text-primary-dark">
                Voir
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Comment tu te sens ?</p>
              <div className="mt-4 flex items-stretch justify-between gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => saveMood(m)}
                    className="flex-1 rounded-2xl border border-border/60 bg-secondary/30 px-1 py-3 text-[11px] font-medium text-foreground transition-all hover:border-primary/40 active:scale-95"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.section>

        {/* 3 — Priorités du jour : trois cartes maximum */}
        <motion.section {...fade(2)} className="mt-8">
          <p className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Priorités du jour
          </p>
          {feed.now.length > 0 ? (
            <ul className="space-y-2">
              {feed.now.map((item, i) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <motion.li key={item.id} {...fade(2 + i * 0.4)}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-4 py-4 transition-all active:scale-[0.99]"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${item.urgent ? "text-destructive" : "text-muted-foreground"}`}
                        strokeWidth={1.75}
                      />
                      {item.time && (
                        <span className="w-11 shrink-0 text-xs font-semibold tabular-nums text-foreground">
                          {item.time}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.label}</span>
                      {item.detail && (
                        <span className="shrink-0 text-xs text-muted-foreground">{item.detail}</span>
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-6 text-center text-sm text-muted-foreground">
              Aujourd'hui est léger 🌸
            </p>
          )}
        </motion.section>

        {/* 4 — Agir maintenant : toujours visible */}
        <motion.section {...fade(3)} className="mt-8 grid grid-cols-2 gap-3">
          <Link
            to="/moi/apaisement"
            className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-card px-5 py-6 transition-all active:scale-[0.98]"
          >
            <Moon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            <span>
              <span className="block text-sm font-semibold text-foreground">M'apaiser</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">3 minutes, maintenant</span>
            </span>
          </Link>
          <Link
            to="/moi/chemin"
            className="flex flex-col gap-3 rounded-[24px] border border-border/70 bg-card px-5 py-6 transition-all active:scale-[0.98]"
          >
            <Sprout className="h-5 w-5 text-foreground" strokeWidth={1.75} />
            <span>
              <span className="block text-sm font-semibold text-foreground">Mon chemin</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Voir où j'en suis</span>
            </span>
          </Link>
        </motion.section>

        {/* 5 — Enfants concernés aujourd'hui uniquement */}
        {feed.kids.length > 0 && (
          <motion.section {...fade(4)} className="mt-8">
            <p className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Aujourd'hui pour eux
            </p>
            <ul className="space-y-2">
              {feed.kids.map((k) => (
                <li key={k.id}>
                  <Link
                    to={k.to}
                    className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary/60 text-sm font-semibold text-foreground">
                      {k.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{k.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{k.action}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* 6 — Respiration éditoriale */}
        <motion.p
          {...fade(5)}
          className="mt-10 text-center font-serif text-base italic text-muted-foreground"
        >
          « Tu n'as pas à tout tenir. »
        </motion.p>
      </div>
    </div>
  );
};

export default Aujourdhui;
