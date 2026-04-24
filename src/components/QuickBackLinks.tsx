import { Link } from "react-router-dom";
import { Home, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuickBackLinksProps {
  faqTo?: string;
  variant?: "bar" | "inline";
  className?: string;
}

const QuickBackLinks = ({
  faqTo = "/#faq",
  variant = "bar",
  className = "",
}: QuickBackLinksProps) => {
  const { t } = useTranslation();
  const base =
    "inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card hover:text-foreground border border-border";

  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Link to="/" className={base} aria-label={t("nav.back_home")}>
          <Home className="h-3.5 w-3.5" /> {t("nav.home")}
        </Link>
        <Link to={faqTo} className={base} aria-label={t("nav.back_faq")}>
          <HelpCircle className="h-3.5 w-3.5" /> {t("nav.faq")}
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 pt-4 ${className}`}
    >
      <Link to="/" className={base} aria-label={t("nav.back_home")}>
        <Home className="h-3.5 w-3.5" /> {t("nav.home")}
      </Link>
      <Link to={faqTo} className={base} aria-label={t("nav.back_faq")}>
        <HelpCircle className="h-3.5 w-3.5" /> {t("nav.faq")}
      </Link>
    </div>
  );
};

export default QuickBackLinks;
