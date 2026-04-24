import { Link } from "react-router-dom";
import { Home, HelpCircle } from "lucide-react";

interface QuickBackLinksProps {
  /** Optional override for the FAQ target. Defaults to home page FAQ anchor. */
  faqTo?: string;
  /** Visual layout: floating top-bar inside a page, or inline pill. */
  variant?: "bar" | "inline";
  className?: string;
}

/**
 * Quick-access return links shown on tool screens & emotion detail pages.
 * Lets the user jump back to Home or the contextual FAQ in one tap.
 */
const QuickBackLinks = ({
  faqTo = "/#faq",
  variant = "bar",
  className = "",
}: QuickBackLinksProps) => {
  const base =
    "inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card hover:text-foreground border border-border";

  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Link to="/" className={base} aria-label="Retour à l'accueil">
          <Home className="h-3.5 w-3.5" /> Accueil
        </Link>
        <Link to={faqTo} className={base} aria-label="Retour à la FAQ">
          <HelpCircle className="h-3.5 w-3.5" /> FAQ
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 pt-4 ${className}`}
    >
      <Link to="/" className={base} aria-label="Retour à l'accueil">
        <Home className="h-3.5 w-3.5" /> Accueil
      </Link>
      <Link to={faqTo} className={base} aria-label="Retour à la FAQ">
        <HelpCircle className="h-3.5 w-3.5" /> FAQ
      </Link>
    </div>
  );
};

export default QuickBackLinks;
