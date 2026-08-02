import { useEffect, useState } from "react";
import { formatEurAmount, PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import { FoundingOffer, fetchFoundingOffer } from "@/lib/foundingFamilies";

/**
 * Le grand prix affiché sur la page de vente.
 * Il vient de la base (palier Familles Fondatrices) et retombe sur le tarif
 * plein tant qu'on ne sait pas : jamais de faux prix, jamais de fausse rareté.
 */
const FoundingPrice = () => {
  const [offer, setOffer] = useState<FoundingOffer | null>(null);

  useEffect(() => {
    let alive = true;
    fetchFoundingOffer().then((o) => {
      if (alive) setOffer(o);
    });
    return () => {
      alive = false;
    };
  }, []);

  const isReduced = !!offer && offer.priceCents < 9700;

  return (
    <div className="mt-10 flex items-baseline justify-center gap-3">
      <span className="font-serif text-[clamp(3rem,7vw,5rem)] leading-none text-night">
        {offer ? formatEurAmount(offer.priceCents / 100) : PREMIUM_PRICE_SHORT}
      </span>
      {isReduced && (
        <span className="text-lg text-muted-foreground line-through">
          {PREMIUM_PRICE_SHORT}
        </span>
      )}
    </div>
  );
};

export default FoundingPrice;
