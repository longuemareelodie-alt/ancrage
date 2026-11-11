import { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Petit bouton dans l'en-tête, à droite du titre (ex. jour/nuit). */
  action?: ReactNode;
  /** Conservé pour compatibilité : l'espace de la barre du bas est géré globalement. */
  clearBottomNav?: boolean;
};

/**
 * Shared shell for every hub screen (Moi, Famille, Autonomie, Menu…).
 * Guarantees identical rhythm, spacing and typography across the app.
 */
const HubShell = ({ title, subtitle, children, action }: Props) => (
  <div className="min-h-screen bg-background">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-lg px-6 pb-10 pt-10"
    >
      <header className="mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="space-y-3">{children}</div>
    </motion.div>
  </div>
);

export default HubShell;

/** Titre de section numéroté, partagé par les hubs (« 01 — Mon équilibre »). */
export const HubSection = ({ index, title, hint }: { index?: string; title: string; hint?: string }) => (
  <div className="pb-1 pt-5 first:pt-0">
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {index && <span className="mr-1.5 tabular-nums text-primary-dark">{index}</span>}
      {index && <span className="mr-1.5 text-muted-foreground/50">—</span>}
      {title}
    </p>
    {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
  </div>
);
