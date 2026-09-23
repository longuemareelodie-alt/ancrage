import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Footer from "@/components/Footer";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { track } from "@/lib/landingAnalytics";

import HeroV4 from "@/components/landing/v4/HeroV4";
import PulseV4 from "@/components/landing/v4/PulseV4";
import EspacesV4 from "@/components/landing/v4/EspacesV4";
import PremierJourV4 from "@/components/landing/v4/PremierJourV4";
import DemarrageV4 from "@/components/landing/v4/DemarrageV4";
import CompagnonsV4 from "@/components/landing/v4/CompagnonsV4";
import HistoireV4 from "@/components/landing/v4/HistoireV4";
import ConfianceV4 from "@/components/landing/v4/ConfianceV4";
import OffreV4 from "@/components/landing/v4/OffreV4";
import FAQV4 from "@/components/landing/v4/FAQV4";
import FinalV4 from "@/components/landing/v4/FinalV4";
import AmbassadriceTeaser from "@/components/landing/v3/AmbassadriceTeaser";
import MobileStickyCTA from "@/components/landing/v3/MobileStickyCTA";

/**
 * Page de vente Éclosia.
 * Parcours : comprendre → se reconnaître → voir le produit → se projeter →
 * être rassurée → rejoindre les Familles Fondatrices.
 * Aucun chiffre, témoignage ou compte à rebours inventé : le tarif vient
 * de la base, les témoignages n'apparaissent que s'ils existent vraiment.
 */

const LINKS = [
  { href: "#pulse", label: "Comment ça marche" },
  { href: "#espaces", label: "Les espaces" },
  { href: "#fondatrice", label: "Mon histoire" },
  { href: "#tarif", label: "Tarif" },
  { href: "#faq", label: "Questions" },
];

const Nav = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Link to="/" className="font-serif text-lg tracking-tight text-night">
          Éclosia
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/connexion"
            className="text-[13px] font-medium text-night/70 transition-colors hover:text-night"
          >
            Je me connecte
          </Link>
          <button
            onClick={() => {
              track("founder_cta_click", { from: "nav" });
              track("checkout_start", { from: "nav" });
              onCTA();
            }}
            disabled={loading}
            className="rounded-full bg-night px-5 py-2.5 text-[13px] font-medium text-night-foreground transition-all duration-300 hover:bg-night/90 disabled:opacity-60"
          >
            🌸 Rejoindre
          </button>
        </div>

        <button
          className="rounded-full p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-1 px-6 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm text-foreground hover:bg-card"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/connexion"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-sm text-foreground hover:bg-card"
            >
              Je me connecte
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                track("founder_cta_click", { from: "nav-mobile" });
                track("checkout_start", { from: "nav-mobile" });
                onCTA();
              }}
              className="mt-2 min-h-[50px] rounded-full bg-night px-5 text-sm font-medium text-night-foreground"
            >
              🌸 Rejoindre les Familles Fondatrices
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

const Index = () => {
  const { startPayment, loading } = useMolliePayment();
  const onCTA = () => startPayment();

  useEffect(() => {
    track("landing_view");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onCTA={onCTA} loading={loading} />

      <main className="pb-14 md:pb-0">
        <HeroV4 onCTA={onCTA} loading={loading} />
        <PulseV4 />
        <EspacesV4 />
        <PremierJourV4 />
        <DemarrageV4 />
        <CompagnonsV4 />
        <HistoireV4 />
        <ConfianceV4 />
        <OffreV4 onCTA={onCTA} loading={loading} />
        <FAQV4 />
        <AmbassadriceTeaser />
        <FinalV4 onCTA={onCTA} loading={loading} />
      </main>

      <Footer />
      <MobileStickyCTA onCTA={onCTA} loading={loading} />
    </div>
  );
};

export default Index;
