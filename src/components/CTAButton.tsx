import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { useState } from "react";

interface CTAButtonProps {
  children: React.ReactNode;
  to: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Si true, joue brièvement une confirmation "passage en sécurité" (icône check + halo vert)
   * après le clic, avant d'exécuter l'action.
   */
  confirmSafe?: boolean;
  /** Texte affiché pendant le micro-état de confirmation */
  confirmLabel?: string;
}

const CTAButton = ({
  children,
  to,
  variant = "primary",
  onClick,
  loading,
  disabled,
  confirmSafe = false,
  confirmLabel = "Tu es en sécurité",
}: CTAButtonProps) => {
  const navigate = useNavigate();
  const isExternal = to.startsWith("http");
  const reduce = useReducedMotion();
  const [confirming, setConfirming] = useState(false);

  const runAction = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (isExternal) {
      window.open(to, "_blank", "noopener,noreferrer");
    } else if (to && to !== "#") {
      navigate(to);
    }
  };

  const handleClick = () => {
    if (loading || disabled || confirming) return;

    if (confirmSafe && !reduce) {
      setConfirming(true);
      // Laisse l'animation respirer ~900ms avant de naviguer / exécuter
      window.setTimeout(() => {
        setConfirming(false);
        runAction();
      }, 900);
    } else {
      runAction();
    }
  };

  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-live={confirming ? "polite" : undefined}
      className={`calm-press calm-hover relative w-full overflow-hidden rounded-xl px-8 py-4 text-base font-semibold disabled:opacity-60 ${
        isPrimary
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          : "border border-border bg-card text-foreground"
      } ${confirming ? "safe-confirm" : isPrimary && !disabled && !loading ? "calm-breathe" : ""}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </span>
      ) : confirming ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25"
          >
            <Check className="h-3 w-3" />
          </motion.span>
          {confirmLabel}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default CTAButton;
