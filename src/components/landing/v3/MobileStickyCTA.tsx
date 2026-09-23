import { useEffect, useState } from "react";
import { formatEurAmount } from "@/lib/premiumOffer";
import { FoundingOffer, fetchFoundingOffer } from "@/lib/foundingFamilies";
import { track } from "@/lib/landingAnalytics";

/**
 * Barre d'achat mobile : apparaît après le premier écran, ne masque pas
 * le contenu (le <main> garde un padding bas sur mobile).
 */
const MobileStickyCTA = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const [offer, setOffer] = useState<FoundingOffer | null>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchFoundingOffer().then((o) => alive && setOffer(o));
    return () => {
      alive = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-3 py-1.5 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-night">
          🌸{" "}
          {offer
            ? `${formatEurAmount(offer.priceCents / 100)} · accès à vie`
            : "Accès à vie, sans abonnement"}
        </p>
        <button
          onClick={() => {
            track("founder_cta_click", { from: "sticky" });
            track("checkout_start", { from: "sticky" });
            onCTA();
          }}
          disabled={loading}
          className="min-h-[40px] shrink-0 rounded-full bg-night px-4 text-[13.5px] font-medium text-night-foreground disabled:opacity-60"
        >
          Rejoindre →
        </button>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
