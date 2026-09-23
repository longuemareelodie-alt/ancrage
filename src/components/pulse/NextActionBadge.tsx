import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Clock, Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePulseState } from "@/hooks/usePulseState";
import { useNextAction } from "@/hooks/useNextAction";
import { mascotOf } from "@/data/pulseMascots";
import MascotAvatar from "@/components/pulse/MascotAvatar";

/**
 * ⚡ Prochaine action, partout dans l'app.
 * Petit badge discret au-dessus de la navigation : on l'ouvre pour voir
 * l'unique prochaine action et la cocher, sans quitter la page où l'on est.
 * Aucune donnée nouvelle : tout vient des tâches et rendez-vous existants.
 */
const HIDDEN = [
  "/", "/auth", "/reset-password", "/set-password",
  "/cgv", "/confidentialite", "/mentions-legales",
  "/unsubscribe", "/paywall", "/comparaison", "/aller-plus-loin",
  "/payment-success", "/payment-pending", "/payment-canceled",
  "/post-flow", "/devenir-ambassadrice", "/onboarding",
  // Sur « Aujourd'hui », le bloc PULSE dit déjà la même chose.
  "/aujourdhui",
];

const NextActionBadge = () => {
  const { user, loading, isPaid } = useAuth();
  const location = useLocation();
  const { state } = usePulseState();
  const { next, remaining, complete } = useNextAction(state);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (loading || !user || !isPaid) return null;
  if (HIDDEN.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;
  if (!next) return null;

  const mascot = mascotOf(next.domain);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-3">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border/60 bg-card/95 p-3 shadow-soft-lg backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <MascotAvatar mascot={mascot} size={38} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Ta prochaine action
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-snug">{next.label}</p>
                {next.who && (
                  <p className="mt-0.5 text-[11px] font-medium text-primary">pour {next.who}</p>
                )}
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> environ {next.minutes} min
                  {next.learned ? " · d'après tes habitudes" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {next.completable && (
                <button
                  type="button"
                  onClick={async () => {
                    setDone(true);
                    await complete(next);
                    setTimeout(() => setDone(false), 900);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  {done ? <Sparkles className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  {done ? "Bravo" : "C'est fait"}
                </button>
              )}
              <Link
                to="/aujourdhui"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground"
              >
                Voir mon jour <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            aria-label="Voir ma prochaine action"
            className="pointer-events-auto flex max-w-[92vw] items-center gap-2 rounded-full border border-border/60 bg-card/95 py-1.5 pl-1.5 pr-3 shadow-soft backdrop-blur"
          >
            <MascotAvatar mascot={mascot} size={28} />
            <span className="max-w-[46vw] truncate text-xs font-medium">{next.label}</span>
            {remaining > 1 && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {remaining}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NextActionBadge;
