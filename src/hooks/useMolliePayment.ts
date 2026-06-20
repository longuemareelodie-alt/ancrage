import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getStoredReferralCode } from "@/lib/referralTracking";

interface StartPaymentOptions {
  promoCode?: string | null;
  /** Override the redirect URL after Mollie checkout. */
  redirectUrl?: string;
  /**
   * Email to use when the visitor is NOT authenticated (guest checkout).
   * Required when `user` is null. Ignored when a session exists — the
   * authed email is always used in that case.
   */
  guestEmail?: string;
  /** Force a single Mollie payment method (e.g. "klarna"). */
  method?: string;
  /** Billing address (required by Klarna). */
  billingAddress?: {
    givenName?: string;
    familyName?: string;
    streetAndNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export const useMolliePayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startPayment = async (options: StartPaymentOptions = {}) => {
    const product = "premium" as const;
    const promoCode = options.promoCode?.trim() || null;
    const guestEmail = options.guestEmail?.trim().toLowerCase() || null;

    // Premium accepts promo codes — no per-product guard needed anymore.

    setLoading(true);
    try {
      const referralCode = getStoredReferralCode();
      const { data, error } = await supabase.functions.invoke(
        "create-mollie-payment",
        {
          body: {
            redirectUrl:
              options.redirectUrl ?? `${window.location.origin}/payment-pending`,
            promoCode,
            product,
            // Server ignores guestEmail when a session is present. For guests,
            // the email is optional before payment: Mollie/customer details are
            // used by the webhook to send the account activation link after payment.
            guestEmail: user ? undefined : guestEmail,
            method: options.method,
            billingAddress: options.billingAddress,
            referralCode,
          },
        }
      );

      const structuredError =
        (error as { context?: { error?: string } } | null)?.context?.error ??
        (data as { error?: string } | null)?.error ??
        null;

      if (structuredError === "promo_not_allowed_for_product") {
        toast.error("Les codes promo ne sont pas applicables sur cette offre.");
        return;
      }

      if (structuredError === "invalid_promo_code") {
        toast.error("Code promo invalide.");
        return;
      }

      if (structuredError === "guest_email_required") {
        toast.error("Email invalide. Vérifie l'orthographe.");
        return;
      }

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
