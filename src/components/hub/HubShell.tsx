import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Réserve la place de la barre du bas (60px + safe-area iOS + marge). */
  clearBottomNav?: boolean;
};

/**
 * Shared shell for every hub screen (Moi, Famille, Autonomie, Ressources…).
 * Guarantees identical rhythm, spacing and typography across the app.
 */
const HubShell = ({ title, subtitle, children, clearBottomNav }: Props) => (
  <div className="min-h-screen bg-background">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full max-w-lg px-6 pt-10 ${
        clearBottomNav
          ? "pb-[calc(60px+0.625rem+env(safe-area-inset-bottom)+3rem)]"
          : "pb-10"
      }`}
    >
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </header>
      <div className="space-y-3">{children}</div>
    </motion.div>
  </div>
);

export default HubShell;
