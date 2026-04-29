import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkCheck, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  readLastVisited,
  clearLastVisited,
  type LastVisited,
} from "@/lib/lastVisited";

/**
 * Suggests resuming the last visited emotion card when the user
 * comes back to the app. Shows up to once per session.
 */
const SESSION_DISMISS_KEY = "calm_resume_dismissed_session";

const ResumeBanner = () => {
  const { t, i18n } = useTranslation();
  const [entry, setEntry] = useState<LastVisited | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY) === "1") return;
    const last = readLastVisited();
    if (last && last.emotion) setEntry(last);
  }, []);

  if (!entry) return null;

  // Resolve a friendly title: prefer cached title, fallback to i18n lookup.
  const i18nKey = `emotion_detail.data.${entry.emotion}.title`;
  const title =
    entry.title ||
    (i18n.exists(i18nKey) ? (t(i18nKey) as string) : entry.emotion);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setEntry(null);
  };

  const forget = () => {
    clearLastVisited();
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    setEntry(null);
  };

  // Append scroll offset as hash so the destination page can restore it.
  const to = `/emotion/${entry.emotion}#resume=${entry.scrollY}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-soft"
        role="region"
        aria-label="Reprendre la dernière carte"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="space-y-0.5">
              <p className="font-serif text-sm font-semibold leading-tight">
                Reprendre où tu t'étais arrêtée
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                Dernière carte : <span className="font-medium text-foreground">{title}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={to}
                onClick={dismiss}
                className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Reprendre ici
              </Link>
              <button
                type="button"
                onClick={forget}
                className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Oublier
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Masquer la suggestion"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeBanner;
