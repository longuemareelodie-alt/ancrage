import { useEffect, useState } from "react";
import { formatEurAmount } from "@/lib/premiumOffer";
import { FoundingOffer, fetchFoundingOffer } from "@/lib/foundingFamilies";

/**
 * Kit compact de la page de vente V4.
 * Objectif : densité. Séparations 32–48 px sur mobile, 60–90 px sur desktop,
 * jamais de section pleine hauteur, jamais de bloc décoratif vide.
 */

export const Band = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`px-5 py-6 md:px-6 md:py-10 ${className}`}>
    <div className="mx-auto w-full max-w-[1100px]">{children}</div>
  </section>
);

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-primary-dark/80">
    {children}
  </p>
);

export const H2 = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={`mt-1.5 font-serif text-[clamp(1.4rem,3.2vw,2.15rem)] leading-[1.15] tracking-[-0.01em] text-night ${className}`}
  >
    {children}
  </h2>
);

export const Lead = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/75">{children}</p>
);

/** Tarif fondateur réel (base de données). `null` tant que rien n'a répondu. */
export const useFoundingOffer = () => {
  const [offer, setOffer] = useState<FoundingOffer | null>(null);
  useEffect(() => {
    let alive = true;
    fetchFoundingOffer().then((o) => alive && setOffer(o));
    return () => {
      alive = false;
    };
  }, []);
  return offer;
};

export const priceLabel = (offer: FoundingOffer | null) =>
  offer ? formatEurAmount(offer.priceCents / 100) : null;
