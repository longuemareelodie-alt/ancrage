import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Settings, Clock, Pill, CheckCircle2, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTodayFeed } from "@/hooks/useTodayFeed";
import { toast } from "@/hooks/use-toast";

/**
 * « Aujourd'hui » — le cockpit.
 *
 * Cinq blocs maximum, aucun bloc vide, un seul geste demandé (l'humeur).
 * Tout le reste vient du moteur de priorité `useTodayFeed`.
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

const Aujourdhui = () => {
  const feed = useTodayFeed();
  const navigate = useNavigate();
  const [savedMood, setSavedMood] = useState<string | null>(null);

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
    if (mood.type === "negative") navigate("/moi/apaisement");
  };

  const done = feed.checkedInToday || savedMood;

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-lg px-6 pb-10 pt-10"
      >
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground">
              {greeting()}
              {feed.firstName ? ` ${feed.firstName}` : ""}
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{dateLabel}</p>
          </div>
          <Link
            to="/plus/profil"
            aria-label="Réglages"
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </header>

        {/* 1 — Le seul geste demandé */}
        <section className="rounded-[20px] border border-border/70 bg-card px-5 py-5">
          {done ? (
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
        </section>

        {/* 2 — Maintenant : n'apparaît que si quelque chose existe */}
        {feed.now.length > 0 && (
          <section className="mt-8">
            <p className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Maintenant
            </p>
            <ul className="space-y-2">
              {feed.now.map((item) => {
                const Icon = KIND_ICON[item.kind];
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-4 py-3"
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
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 3 — Deux suggestions contextuelles, jamais plus */}
        <section className="mt-8 grid grid-cols-2 gap-3">
          {feed.suggestions.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="rounded-[20px] border border-border/70 bg-card px-4 py-5 transition-all active:scale-[0.99]"
            >
              <span className="block text-sm font-semibold text-foreground">{s.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{s.desc}</span>
            </Link>
          ))}
        </section>

        {/* 4 — Progression douce */}
        <section className="mt-8 rounded-[20px] border border-border/70 bg-card px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cette semaine
            </p>
            <p className="text-xs font-medium text-foreground">{feed.weekDays}/7 jours</p>
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < feed.weekDays ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
          {feed.budgetLeftCents !== null && (
            <Link
              to="/plus/budget"
              className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs"
            >
              <span className="text-muted-foreground">Reste ce mois-ci</span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                {(feed.budgetLeftCents / 100).toFixed(0)} €
                <ChevronRight className="h-3 w-3" strokeWidth={2} />
              </span>
            </Link>
          )}
        </section>

        {/* 5 — Respiration éditoriale */}
        <p className="mt-8 text-center font-serif text-base italic text-muted-foreground">
          « Tu n'as pas à tout tenir. »
        </p>
      </motion.div>
    </div>
  );
};

export default Aujourdhui;
