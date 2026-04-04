import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto max-w-lg flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/cgv" className="hover:text-foreground transition-colors">
            Conditions générales de vente
          </Link>
          <Link to="/confidentialite" className="hover:text-foreground transition-colors">
            Politique de confidentialité
          </Link>
          <Link to="/mentions-legales" className="hover:text-foreground transition-colors">
            Mentions légales
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Cet outil ne remplace pas un accompagnement médical, juridique ou psychologique.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
