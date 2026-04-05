import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface CTAButtonProps {
  children: React.ReactNode;
  to: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const CTAButton = ({ children, to, variant = "primary", onClick, loading, disabled }: CTAButtonProps) => {
  const navigate = useNavigate();
  const isExternal = to.startsWith("http");

  const handleClick = () => {
    if (loading || disabled) return;
    if (onClick) {
      onClick();
      return;
    }
    if (isExternal) {
      window.open(to, "_blank", "noopener,noreferrer");
    } else {
      navigate(to);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={loading || disabled}
      className={`w-full rounded-xl px-8 py-4 text-base font-semibold transition-colors disabled:opacity-60 ${
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          : "border border-border bg-card text-foreground"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default CTAButton;
