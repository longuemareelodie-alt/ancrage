import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CTAButtonProps {
  children: React.ReactNode;
  to: string;
  variant?: "primary" | "secondary";
}

const CTAButton = ({ children, to, variant = "primary" }: CTAButtonProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(to)}
      className={`w-full rounded-xl px-8 py-4 text-base font-semibold transition-colors ${
        variant === "primary"
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          : "border border-border bg-card text-foreground"
      }`}
    >
      {children}
    </motion.button>
  );
};

export default CTAButton;
