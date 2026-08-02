import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { GENTLE_BADGES, getUnlockedKeys } from "@/lib/gentleBadges";

/**
 * « Mes petits moments » — les badges émotionnels.
 *
 * Privés, non comparables, jamais perdus. On montre le chemin parcouru,
 * pas ce qui manque.
 */
const MesBadges = () => {
  const unlocked = getUnlockedKeys();
  const done = GENTLE_BADGES.filter((b) => unlocked.includes(b.key));
  const upcoming = GENTLE_BADGES.filter((b) => !unlocked.includes(b.key));

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="mx-auto w-full max-w-lg px-5 pt-6">
        <Link
          to="/moi"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Moi
        </Link>

        <header className="mt-4 space-y-1">
          <h1 className="font-serif text-2xl text-foreground">Mes petits moments</h1>
          <p className="text-sm text-muted-foreground">
            Ils sont à toi seule. Aucun classement, aucune comparaison.
          </p>
        </header>

        <p className="mt-5 rounded-2xl bg-primary/5 px-4 py-3 text-center font-serif text-sm text-primary/90">
          {done.length === 0
            ? "Ton premier moment arrive bientôt, sans rien forcer."
            : `${done.length} moment${done.length > 1 ? "s" : ""} déjà traversé${done.length > 1 ? "s" : ""}.`}
        </p>

        {done.length > 0 && (
          <ul className="mt-5 space-y-2">
            {done.map((badge, i) => (
              <motion.li
                key={badge.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-card p-4"
              >
                <span aria-hidden className="text-2xl">
                  {badge.emoji}
                </span>
                <div>
                  <p className="font-serif text-sm font-semibold text-foreground">{badge.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{badge.word}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              À venir, quand tu voudras
            </h2>
            <ul className="space-y-2">
              {upcoming.map((badge) => (
                <li
                  key={badge.key}
                  className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 p-4"
                >
                  <span aria-hidden className="text-xl opacity-40">
                    {badge.emoji}
                  </span>
                  <p className="text-sm text-muted-foreground">{badge.label}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default MesBadges;
