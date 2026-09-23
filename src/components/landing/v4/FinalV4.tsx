import { ArrowRight } from "lucide-react";
import { track } from "@/lib/landingAnalytics";
import { Band, priceLabel, useFoundingOffer } from "./kit";

const FinalV4 = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const price = priceLabel(useFoundingOffer());

  return (
    <Band id="rejoindre">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-[clamp(1.5rem,4vw,2.4rem)] leading-[1.12] text-night">
          Tu n'as pas besoin de tout gérer aujourd'hui.
        </h2>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/75">
          Éclosia est là pour t'aider à savoir quoi faire maintenant.
        </p>
        <p className="mt-3 text-[15px] font-medium text-night">
          🌸 {price ?? "Tarif fondateur"} · accès à vie
        </p>
        <button
          onClick={() => {
            track("founder_cta_click", { from: "final" });
            track("checkout_start", { from: "final" });
            onCTA();
          }}
          disabled={loading}
          className="mt-4 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-night px-7 text-[15px] font-medium text-night-foreground transition-transform hover:-translate-y-[1px] disabled:opacity-60"
        >
          Je rejoins Éclosia
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </Band>
  );
};

export default FinalV4;
