import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useMolliePayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
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
          },
        }
      );

      if (error) {
        console.error("Payment function error:", error);
        toast.error("Erreur lors de la création du paiement. Réessaie.");
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
