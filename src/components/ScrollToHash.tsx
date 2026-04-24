import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Quand l'URL contient un hash (#faq par ex.), scrolle vers l'élément
 * correspondant après le rendu. React Router ne le fait pas par défaut.
 */
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Pas de hash : remonte en haut sur changement de route
      window.scrollTo({ top: 0 });
      return;
    }
    const id = hash.replace("#", "");
    // Délai pour laisser le DOM se monter (transitions framer-motion)
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
