import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { useDiscovery } from "@/contexts/DiscoveryContext";

type Props = {
  /** Stable id used to remember dismissal across sessions */
  id: string;
  title: string;
  children: React.ReactNode;
  /** Optional tone — defaults to primary */
  tone?: "primary" | "lies";
};

/**
 * Contextual hint card. Renders only when discovery mode is active
 * AND the hint hasn't been dismissed by the user.
 */
export default function DiscoveryHint({ id, title, children, tone = "primary" }: Props) {
  const { active, isHintDismissed, dismissHint } = useDiscovery();

  if (!active) return null;
  if (isHintDismissed(id)) return null;

  const accent =
    tone === "lies"
      ? "border-[hsl(var(--lies))] bg-[hsl(var(--lies-soft))]"
      : "border-primary/30 bg-primary/5";
  const iconColor = tone === "lies" ? "text-[hsl(var(--lies))]" : "text-primary";

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        role="note"
        aria-label={`Indication : ${title}`}
        className={`relative mb-3 rounded-2xl border ${accent} p-3.5 pr-9 shadow-sm`}
      >
        <button
          type="button"
          onClick={() => dismissHint(id)}
          aria-label="Masquer cette indication"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background ${iconColor}`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Je découvre
            </p>
            <h3 className="mt-0.5 text-sm font-bold text-foreground">{title}</h3>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
