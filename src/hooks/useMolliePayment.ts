import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StartPaymentOptions {
  promoCode?: string | null;
}

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
            redirectUrl: `${window.location.origin}/payment-pending`,
            promoCode: options.promoCode ?? null,
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
