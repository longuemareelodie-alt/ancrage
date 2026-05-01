import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, ArrowRight, Lock, Sparkles, ShieldCheck } from "lucide-react";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  INITIATION_DAYS,
  loadState,
  markDayComplete,
  markLaunched,
  resetState,
  completedCount,
  type InitiationState,
} from "@/lib/initiation7j";
import { cleanCurrentUrl } from "@/lib/cleanUrlParams";


// L'offre "Initiation 7 jours" autonome (4,99 €) a été retirée : le contenu
// est désormais inclus dans l'offre Premium. Les visiteurs sans accès sont
// redirigés vers la page d'accueil qui présente le CTA Premium.
const InitiationPaywall = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background pb-32">
      <SectionBlock variant="blue">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Parcours d'initiation
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight">
            7 jours pour passer du mode survie au calme
          </h1>
          <p className="text-sm text-foreground/80">
            Désormais inclus dans l'offre Premium ANCRAGE.
          </p>
        </header>
      </SectionBlock>

      <SectionBlock>
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-wider">
              Inclus dans Premium
            </p>
          </div>

          <ul className="space-y-2.5 text-sm">
            {[
              "Les 7 jours guidés (un ancrage par jour)",
              "Le programme complet ANCRAGE (accès à vie)",
              "Tes notes, ta progression, tes ancres conservées",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Un seul paiement, accès à vie
              </p>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Pas d'abonnement. Tu paies une fois et tu gardes l'accès à
              l'ensemble du programme — initiation 7 jours comprise.
            </p>
          </div>

          <CTAButton to={user ? "/" : "/auth?redirect=/&action=pay"}>
            <Lock className="mr-1.5 h-4 w-4 inline" />
            {user ? "Découvrir l'offre Premium" : "Créer mon compte Premium"}
          </CTAButton>

          <p className="text-center text-[11px] text-muted-foreground">
            Paiement sécurisé Mollie · CB, Bancontact, etc.
          </p>
        </div>
      </SectionBlock>
    </main>
  );
};

const Initiation7jContent = () => {
  const [state, setState] = useState<InitiationState>({ startedAt: null, completed: {} });
  const [activeDay, setActiveDay] = useState<number>(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    // Detect arrival from the welcome email (CTA `?launch=1`). When present,
    // mark the parcours as launched (sets `startedAt` once) and clean the URL
    // so a refresh doesn't re-trigger any side effects.
    //
    // The cleanup helper:
    //   - removes ONLY `launch` + the standard tracking params (utm_*, gclid,
    //     fbclid, …), preserving any other useful query string;
    //   - preserves `window.location.hash` (e.g. anchors, auth callback hashes).
    let s = loadState();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("launch") === "1") {
        s = markLaunched();
        cleanCurrentUrl({ extraKeys: ["launch"] });
      }
    }
    setState(s);
    // Ouvrir le premier jour non terminé
    const firstUndone = INITIATION_DAYS.find((d) => !s.completed[d.day]);
    if (firstUndone) setActiveDay(firstUndone.day);
  }, []);

  const day = useMemo(
    () => INITIATION_DAYS.find((d) => d.day === activeDay) ?? INITIATION_DAYS[0],
    [activeDay],
  );
  const done = completedCount(state);
  const percent = Math.round((done / INITIATION_DAYS.length) * 100);
  const alreadyDone = Boolean(state.completed[activeDay]);

  useEffect(() => {
    setNote(state.completed[activeDay]?.note ?? "");
  }, [activeDay, state]);

  const handleComplete = () => {
    const next = markDayComplete(activeDay, note);
    setState(next);
    const upcoming = INITIATION_DAYS.find((d) => !next.completed[d.day]);
    if (upcoming) setActiveDay(upcoming.day);
  };

  const handleReset = () => {
    if (!window.confirm("Recommencer le parcours depuis le jour 1 ?")) return;
    const fresh = resetState();
    setState(fresh);
    setActiveDay(1);
    setNote("");
  };

  return (
    <main className="min-h-screen bg-background pb-32">
      <SectionBlock>
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Parcours d'initiation
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight">
            7 jours pour passer du mode survie au calme
          </h1>
          <p className="text-sm text-foreground/80">
            Un ancrage par jour. Quelques minutes. Aucun matériel.
            <br />
            Pas une performance — un retour vers toi.
          </p>
        </header>

        {/* Progression */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Ta progression</span>
            <span className="text-muted-foreground">
              {done}/{INITIATION_DAYS.length} jours
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {done >= INITIATION_DAYS.length && (
            <p className="text-center text-sm font-medium text-primary">
              🌳 Tu as bouclé les 7 jours. Cette régularité est une victoire.
            </p>
          )}
        </div>
      </SectionBlock>

      {/* Sélecteur de jours */}
      <SectionBlock>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Choisis ton jour
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {INITIATION_DAYS.map((d) => {
            const isDone = Boolean(state.completed[d.day]);
            const isActive = d.day === activeDay;
            return (
              <button
                key={d.day}
                onClick={() => setActiveDay(d.day)}
                className={`relative aspect-square rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isDone
                    ? "bg-primary/15 text-primary"
                    : "bg-card text-foreground border border-border"
                }`}
                aria-label={`Jour ${d.day}${isDone ? " (terminé)" : ""}`}
              >
                {isDone && !isActive ? (
                  <Check className="mx-auto h-4 w-4" />
                ) : (
                  <span>J{d.day}</span>
                )}
              </button>
            );
          })}
        </div>
      </SectionBlock>

      {/* Carte du jour actif */}
      <SectionBlock>
        <AnimatePresence mode="wait">
          <motion.article
            key={day.day}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden="true">
                {day.emoji}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Jour {day.day} · {day.duration}
                </p>
                <h3 className="font-serif text-2xl font-semibold leading-tight">{day.title}</h3>
              </div>
            </div>

            <p className="font-serif text-lg italic text-primary">{day.intention}</p>

            <div className="rounded-xl bg-primary/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Ton action aujourd'hui
              </p>
              <p className="mt-2 text-base font-medium text-foreground">{day.action}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pourquoi
              </p>
              <p className="mt-1 text-sm text-foreground/85">{day.why}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="note" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ta réponse — {day.prompt}
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Quelques mots suffisent…"
                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <CTAButton
              to="#"
              onClick={handleComplete}
              confirmSafe={!alreadyDone}
              confirmLabel="Tu es en sécurité"
            >
              {alreadyDone ? "Mettre à jour ma réponse" : `Ancrer le jour ${day.day}`}
            </CTAButton>
          </motion.article>
        </AnimatePresence>
      </SectionBlock>

      {/* Résumé des progrès */}
      {done > 0 && (
        <SectionBlock variant="blue">
          <h2 className="font-serif text-xl font-semibold">Tes traces de la semaine</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Une preuve concrète que tu es déjà en route.
          </p>

          <ul className="mt-5 space-y-3">
            {INITIATION_DAYS.filter((d) => state.completed[d.day]).map((d) => {
              const entry = state.completed[d.day];
              return (
                <li
                  key={d.day}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {d.emoji} Jour {d.day} — {d.title}
                    </p>
                    <button
                      onClick={() => setActiveDay(d.day)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Revoir <ArrowRight className="inline h-3 w-3" />
                    </button>
                  </div>
                  {entry.note ? (
                    <p className="mt-2 text-sm italic text-foreground/80">« {entry.note} »</p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Action validée — sans note écrite.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Recommencer le parcours
          </button>
        </SectionBlock>
      )}
    </main>
  );
};

const Initiation7j = () => {
  const { user, hasInitiation, loading } = useAuth();

  // Public landing : not logged-in or eligibility unknown but not loading anymore
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Logged in AND has access (premium, grandfathered, or paid 4,99€)
  if (user && hasInitiation === true) {
    return <Initiation7jContent />;
  }

  // Otherwise → paywall (visible to anonymous visitors AND to logged-in users without access)
  return <InitiationPaywall />;
};

export default Initiation7j;
