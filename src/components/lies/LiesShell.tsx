import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Handshake } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  backTo?: string;
  children: ReactNode;
  icon?: ReactNode;
};

/**
 * Shell partagé pour toutes les pages de la section "Liés autrement".
 * - Header vert doux (token --lies)
 * - Bouton retour
 * - Conteneur centré responsive
 */
const LiesShell = ({ title, subtitle, backTo = "/lies-autrement", children, icon }: Props) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header
        className="border-b border-border/50"
        style={{ background: "linear-gradient(180deg, hsl(var(--lies-soft)) 0%, hsl(var(--background)) 100%)" }}
      >
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-muted-foreground transition-colors hover:bg-[hsl(var(--lies)/0.1)] hover:text-[hsl(var(--lies))]"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--lies)/0.15)] text-[hsl(var(--lies))]">
              {icon ?? <Handshake className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-3xl text-foreground">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
};

export default LiesShell;
