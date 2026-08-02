import { useEffect, useState } from "react";
import { formatEurAmount } from "@/lib/premiumOffer";
import {
  MyFoundingStatus,
  fetchMyFoundingStatus,
  getFoundingTier,
} from "@/lib/foundingFamilies";

/**
 * Le badge à vie d'une famille, avec sa date d'arrivée et son tarif obtenu.
 * Présenté comme une reconnaissance, jamais comme un statut à défendre.
 * Variante `chip` : badge seul (communauté, commentaires, forum).
 */
const FoundingBadge = ({ variant = "card" }: { variant?: "card" | "chip" }) => {
  const [status, setStatus] = useState<MyFoundingStatus>(null);

  useEffect(() => {
    let alive = true;
    fetchMyFoundingStatus().then((s) => {
      if (alive) setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Bloc vide = bloc masqué.
  if (!status?.isFounding) return null;

  const tier = getFoundingTier(status.tierKey);
  const joined = status.joinedAt
    ? new Date(status.joinedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  if (variant === "chip") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-foreground">
        {tier.emoji} {tier.badgeLabel}
      </span>
    );
  }

  return (
    <div className="rounded-[24px] border border-primary/25 bg-primary/5 px-5 py-5">
      <p className="text-sm font-semibold text-foreground">
        {tier.emoji} {tier.badgeLabel}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Tu fais partie des toutes premières familles d'Éclosia. Ce badge te reste à vie.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {joined && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Arrivée</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{joined}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tarif obtenu</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {formatEurAmount(status.priceCents / 100)} · à vie
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Accès anticipé à certaines nouveautés, et tes idées peuvent nourrir Éclosia.
      </p>
    </div>
  );
};

export default FoundingBadge;
