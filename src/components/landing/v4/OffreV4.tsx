import { Check } from "lucide-react";
import KlarnaPayButton from "@/components/KlarnaPayButton";
import { FOUNDING_TIERS, getFoundingTier } from "@/lib/foundingFamilies";
import { formatEurAmount } from "@/lib/premiumOffer";
import { track, useSectionView } from "@/lib/landingAnalytics";
import { Band, priceLabel, useFoundingOffer } from "./kit";

const AVANTAGES = [
  "Toutes les fonctionnalités",
  "Toutes les mises à jour",
  "Badge Famille Fondatrice",
  "Accès anticipé à certaines nouveautés",
  "Pas d'abonnement",
];

const OffreV4 = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const offer = useFoundingOffer();
  const price = priceLabel(offer);
  const tier = getFoundingTier(offer?.tierKey);
  const viewRef = useSectionView("pricing_view");

  return (
    <Band id="tarif">
      <div
        ref={viewRef}
        className="mx-auto max-w-2xl rounded-2xl border border-primary/25 bg-card px-5 py-7 text-center shadow-[0_24px_60px_-40px_hsl(var(--night)/0.45)] md:px-10 md:py-9"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark">
          {tier.emoji} {tier.label}
        </p>
        <p className="mt-2 font-serif text-[clamp(2.2rem,7vw,3.2rem)] leading-none text-night">
          {price ?? "—"}
        </p>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Un seul paiement. Accès à vie.
        </p>

        <ul className="mx-auto mt-5 grid max-w-md gap-1.5 text-left">
          {AVANTAGES.map((a) => (
            <li key={a} className="flex items-start gap-2 text-[14px] text-foreground/85">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark" aria-hidden="true" />
              {a}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[12.5px] text-muted-foreground">
          Tarif fondateur évolutif :{" "}
          {FOUNDING_TIERS.map((t) => formatEurAmount(t.priceCents / 100)).join(" → ")}
        </p>

        <button
          onClick={() => {
            track("founder_cta_click", { from: "offre" });
            track("checkout_start", { from: "offre" });
            onCTA();
          }}
          disabled={loading}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-night px-6 text-[15px] font-medium text-night-foreground transition-transform hover:-translate-y-[1px] disabled:opacity-60"
        >
          🌸 Je rejoins Éclosia{price ? ` — ${price}` : ""}
        </button>

        <p className="mt-3 text-[12px] text-muted-foreground">
          Paiement sécurisé · Accès immédiat · Sans abonnement
        </p>

        <KlarnaPayButton className="mt-3 w-full" />
      </div>
    </Band>
  );
};

export default OffreV4;
