import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import SectionBlock from "./SectionBlock";
import { PREMIUM_PRICE_LONG, PREMIUM_LIFETIME_LABEL } from "@/lib/premiumOffer";

interface FreemiumGateProps {
  /** Titre du blocage (ex. "Tu commences à ressentir la différence."). */
  title: string;
  /** Texte secondaire optionnel. */
  message?: string;
}

/**
 * Écran de blocage doux affiché quand un utilisateur freemium atteint
 * une limite d'usage (check-in 3 jours, feelings 1 fois, etc.).
 */
const FreemiumGate = ({ title, message }: FreemiumGateProps) => {
  const navigate = useNavigate();
  return (
    <SectionBlock variant="blue">
      <div className="mx-auto max-w-md space-y-5 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <h2 className="text-xl font-bold leading-snug">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {message ??
            `Continue avec Eclosia — ${PREMIUM_PRICE_LONG} · ${PREMIUM_LIFETIME_LABEL}. Pas d'abonnement, jamais.`}
        </p>
        <button
          type="button"
          onClick={() => navigate("/paywall")}
          className="w-full rounded-2xl bg-[hsl(270_50%_60%)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Je déverrouille tout
        </button>
      </div>
    </SectionBlock>
  );
};

export default FreemiumGate;
