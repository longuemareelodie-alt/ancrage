import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/landingAnalytics";

/** Barre du haut des pages de vente V5 (accueil et pages thématiques). */
const Nav = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-night-foreground/10 bg-night/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
        <Link to="/" className="font-wide text-[14px] font-bold tracking-[0.22em] text-night-foreground">
          ÉCLOSIA
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/connexion"
            className="rounded-full px-3 py-2 text-[13px] font-medium text-night-foreground/75 transition-colors hover:text-night-foreground"
          >
            Connexion
          </Link>
          <button
            onClick={() => {
              track("founder_cta_click", { from: "nav" });
              track("checkout_start", { from: "nav" });
              onCTA();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-night-foreground px-4 py-2.5 text-[13px] font-semibold text-night transition-transform hover:-translate-y-[1px] disabled:opacity-60"
          >
            Je commence <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
