import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StartPaymentOptions {
  promoCode?: string | null;
  /** "premium" (default, 39€ lifetime) or "initiation_7d" (4,99€). */
  product?: "premium" | "initiation_7d";
  /** Override the redirect URL after Mollie checkout. */
  redirectUrl?: string;
}

/** Products that do NOT accept promo codes (kept in sync with the edge function catalog). */
const PRODUCTS_WITHOUT_PROMO: ReadonlyArray<NonNullable<StartPaymentOptions["product"]>> = [
  "initiation_7d",
];

const PRODUCT_LABELS: Record<NonNullable<StartPaymentOptions["product"]>, string> = {
  premium: "l'accès Premium",
  initiation_7d: "l'initiation 7 jours (4,99 €)",
};

export const useMolliePayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startPayment = async (options: StartPaymentOptions = {}) => {
    if (!user) {
      toast.error("Tu dois être connectée pour accéder au paiement.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-mollie-payment",
        {
          body: {
            redirectUrl:
              options.redirectUrl ?? `${window.location.origin}/payment-pending`,
            promoCode: options.promoCode ?? null,
            product: options.product ?? "premium",
          },
        }
      );

      if (error) {
        // Try to parse a structured error from the edge function
        const ctx = (error as { context?: { error?: string } }).context;
        if (ctx?.error === "invalid_promo_code") {
          toast.error("Code promo invalide.");
          return;
        }
        console.error("Payment function error:", error);
        toast.error("Erreur lors de la création du paiement. Réessaie.");
        return;
      }

      if (data?.error === "invalid_promo_code") {
        toast.error("Code promo invalide.");
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Impossible d'obtenir le lien de paiement.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return { startPayment, loading };
};
