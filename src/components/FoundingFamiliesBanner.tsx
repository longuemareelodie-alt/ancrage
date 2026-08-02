import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatEurAmount } from "@/lib/premiumOffer";
import {
  FOUNDING_TIERS,
  FoundingOffer,
  fetchFoundingOffer,
  getFoundingTier,
} from "@/lib/foundingFamilies";

/**
 * Familles Fondatrices — le tarif du moment, affiché avec douceur.
 * Le compteur vient de la base : il n'avance qu'avec des paiements validés.
 * Aucun compte à rebours anxiogène, aucune pression : juste ce qui est vrai
 * aujourd'hui, et ce qui reste ouvert.
 */
const FoundingFamiliesBanner = ({ className = "" }: { className?: string }) => {
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

  // Tant qu'on ne sait pas, on n'affiche rien : mieux vaut le silence qu'un faux prix.
  if (!offer) return null;

  const tier = getFoundingTier(offer.tierKey);
  const remaining = offer.remainingAtThisPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto max-w-xl rounded-[28px] border border-border/70 bg-card px-6 py-7 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {tier.emoji} {tier.label}
      </p>

      <div className="mt-3 flex items-end gap-3">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {formatEurAmount(offer.priceCents / 100)}
        </span>
        {offer.priceCents < 9700 && (
          <span className="pb-1 text-sm text-muted-foreground line-through">
            {formatEurAmount(97)}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tier.badgeLabel
          ? "Accès à vie, toutes les mises à jour, ton badge à vie et un accès anticipé aux nouveautés."
          : "Accès à vie, toutes les mises à jour incluses."}
      </p>

      {remaining !== null && remaining > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {remaining === 1
            ? "Il reste 1 place à ce tarif."
            : `Il reste ${remaining} places à ce tarif.`}
          {offer.familiesJoined > 0 && ` ${offer.familiesJoined} famille${offer.familiesJoined > 1 ? "s" : ""} nous ${offer.familiesJoined > 1 ? "ont" : "a"} déjà rejointes.`}
        </p>
      )}

      {/* L'échelle complète : rien n'est caché, tout est annoncé à l'avance. */}
      <ul className="mt-5 space-y-1.5 border-t border-border/60 pt-4">
        {FOUNDING_TIERS.map((t) => {
          const isCurrent = t.key === tier.key;
          const isPassed =
            FOUNDING_TIERS.indexOf(t) < FOUNDING_TIERS.findIndex((x) => x.key === tier.key);
          return (
            <li
              key={t.key}
              className={`flex items-center justify-between text-xs ${
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              <span className={isPassed ? "line-through opacity-60" : ""}>
                {t.emoji} {t.seats ? `${t.seats} ${t.label.toLowerCase()}` : t.label}
              </span>
              <span className={isPassed ? "line-through opacity-60" : ""}>
                {formatEurAmount(t.priceCents / 100)}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default FoundingFamiliesBanner;
