import { useEffect, useState } from "react";
import { formatEurAmount, PREMIUM_PRICE_EUR } from "@/lib/premiumOffer";
import {
  FoundingOffer,
  fetchFoundingOffer,
  getFoundingTier,
} from "@/lib/foundingFamilies";

/**
 * Ligne de prix courte : tarif fondateur réellement configuré côté base,
 * avec le prix public de 97 € comme repère. Rien n'est affiché tant que
 * la base n'a pas répondu — jamais de faux prix.
 */
const FoundingPriceLine = ({ className = "" }: { className?: string }) => {
  const [offer, setOffer] = useState<FoundingOffer | null>(null);

  useEffect(() => {
    let alive = true;
    fetchFoundingOffer().then((o) => alive && setOffer(o));
    return () => {
      alive = false;
    };
  }, []);

  if (!offer) return null;
  const tier = getFoundingTier(offer.tierKey);
  const reduced = offer.priceCents < 9700;

  return (
    <div className={`flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 md:justify-start ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
        {tier.emoji} Tarif fondateur
      </span>
      <span className="font-serif text-3xl leading-none text-night">
        {formatEurAmount(offer.priceCents / 100)}
      </span>
      {reduced && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {formatEurAmount(PREMIUM_PRICE_EUR)}
          </span>
          <span className="text-[12.5px] text-muted-foreground">
            soit {formatEurAmount(PREMIUM_PRICE_EUR - offer.priceCents / 100)} de moins
          </span>
        </>
      )}
      <span className="text-[12.5px] text-muted-foreground">· paiement unique</span>
    </div>
  );
};

export default FoundingPriceLine;
