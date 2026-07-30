import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Shared shell for every hub screen (Moi, Famille, Autonomie, Ressources…).
 * Guarantees identical rhythm, spacing and typography across the app.
 */
const HubShell = ({ title, subtitle, children }: Props) => (
  <div className="min-h-screen bg-background">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-lg px-6 pb-10 pt-10"
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
