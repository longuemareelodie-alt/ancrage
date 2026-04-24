import { Link } from "react-router-dom";
import { ChevronRight, Home, HelpCircle, Sparkles } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  to?: string; // si absent = page courante (non cliquable)
};

interface BreadcrumbProps {
  /** Items du fil d'Ariane (Accueil ajouté automatiquement en premier). */
  items: BreadcrumbItem[];
  /** Affiche les raccourcis « FAQ » et « Essayer gratuitement » à droite. Défaut : true. */
  showQuickLinks?: boolean;
}

/**
 * Fil d'Ariane pour les pages publiques (légales, paywall, comparaison...).
 * Ajoute automatiquement « Accueil » en tête et propose deux raccourcis
 * (FAQ + accès à l'outil) sur la droite.
 */
const Breadcrumb = ({ items, showQuickLinks = true }: BreadcrumbProps) => {
  const fullItems: BreadcrumbItem[] = [{ label: "Accueil", to: "/" }, ...items];

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="border-b border-border bg-card/40 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs">
        {/* Trail */}
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          {fullItems.map((item, i) => {
            const isLast = i === fullItems.length - 1;
            return (
              <li key={`${item.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className="h-3 w-3 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {i === 0 && <Home className="h-3 w-3" aria-hidden />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className="flex items-center gap-1 px-1 py-0.5 font-medium text-foreground"
                  >
                    {i === 0 && <Home className="h-3 w-3" aria-hidden />}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Quick links */}
        {showQuickLinks && (
          <div className="flex items-center gap-1">
            <Link
              to="/#faq"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <HelpCircle className="h-3 w-3" aria-hidden />
              <span>FAQ</span>
            </Link>
            <Link
              to="/emotions"
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Sparkles className="h-3 w-3" aria-hidden />
              <span>Essayer l'outil</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumb;
