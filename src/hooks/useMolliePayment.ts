import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useMolliePayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

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
            redirectUrl: `${window.location.origin}/payment-success`,
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

  const startSubscription = async (plan: "monthly" | "yearly" = "monthly") => {
    if (!user) {
      toast.error("Tu dois être connectée pour accéder au paiement.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-mollie-subscription",
        {
          body: {
            plan,
            redirectUrl: `${window.location.origin}/payment-success`,
          },
        }
      );

      if (error) {
        console.error("Subscription function error:", error);
        toast.error("Erreur lors de la création de l'abonnement. Réessaie.");
        return;
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Impossible d'obtenir le lien de paiement.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user) {
      toast.error("Tu dois être connectée.");
      return false;
    }

    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "cancel-mollie-subscription"
      );

      if (error) {
        console.error("Cancel subscription error:", error);
        toast.error("Erreur lors de l'annulation. Réessaie.");
        return false;
      }

      if (data?.success) {
        toast.success("Ton abonnement a été annulé.");
        return true;
      } else {
        toast.error(data?.error || "Impossible d'annuler l'abonnement.");
        return false;
      }
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Une erreur est survenue. Réessaie.");
      return false;
    } finally {
      setCancelLoading(false);
    }
  };

  return { startPayment, startSubscription, cancelSubscription, loading, cancelLoading };
};
