import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * État vide « à âme ».
 *
 * Règle Éclosia : on n'écrit jamais « Aucune donnée ». On accueille, on
 * rassure, et on propose un seul geste très simple.
 */
interface SoftEmptyStateProps {
  /** Emoji illustration — 💛 🌸 ✨ … */
  emoji: string;
  /** Une phrase écrite comme par une personne. */
  title: string;
  /** Optionnel : une précision très courte. */
  hint?: string;
  /** Un seul geste possible. */
  actionLabel?: string;
  /** Route interne… */
  to?: string;
  /** …ou action directe. */
  onAction?: () => void;
  children?: ReactNode;
}

const SoftEmptyState = ({
  emoji,
  title,
  hint,
  actionLabel,
  to,
  onAction,
  children,
}: SoftEmptyStateProps) => {
  const action = actionLabel ? (
    to ? (
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {actionLabel}
      </Link>
    ) : (
      <button
        onClick={onAction}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {actionLabel}
      </button>
    )
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-6 py-10 text-center"
    >
      <motion.span
        aria-hidden
        className="text-4xl"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {emoji}
      </motion.span>
      <p className="max-w-[24rem] font-serif text-lg leading-snug text-foreground">{title}</p>
      {hint && <p className="max-w-[24rem] text-xs text-muted-foreground">{hint}</p>}
      {action}
      {children}
    </motion.div>
  );
};

export default SoftEmptyState;
