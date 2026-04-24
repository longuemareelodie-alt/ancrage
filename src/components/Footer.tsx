import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto max-w-lg flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/cgv" className="hover:text-foreground transition-colors">
            {t("footer.terms")}
          </Link>
          <Link to="/confidentialite" className="hover:text-foreground transition-colors">
            {t("footer.privacy")}
          </Link>
          <Link to="/mentions-legales" className="hover:text-foreground transition-colors">
            {t("footer.legal")}
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center">{t("footer.tagline")}</p>
      </div>
    </footer>
  );
};

export default Footer;
