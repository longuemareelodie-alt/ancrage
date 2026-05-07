import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
}

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) && v.trim().length <= 254;

export const useMolliePayment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startPayment = async (options: StartPaymentOptions = {}) => {
    const product = "premium" as const;
    const promoCode = options.promoCode?.trim() || null;
    const guestEmail = options.guestEmail?.trim().toLowerCase() || null;

    // Guest checkout requires a valid email — we can't create the account
    // server-side without one. Authed users always use their session email.
    if (!user && (!guestEmail || !isValidEmail(guestEmail))) {
      toast.error("Indique ton email pour démarrer le paiement.");
      return;
    }

    // Premium accepts promo codes — no per-product guard needed anymore.

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-mollie-payment",
        {
          body: {
            redirectUrl:
              options.redirectUrl ?? `${window.location.origin}/payment-pending`,
            promoCode,
            product,
            // Server ignores guestEmail when a session is present.
            guestEmail: user ? undefined : guestEmail,
          },
        }
      );

      const structuredError =
        (error as { context?: { error?: string } } | null)?.context?.error ??
        (data as { error?: string } | null)?.error ??
        null;

      if (structuredError === "promo_not_allowed_for_product") {
        toast.error(
          `Les codes promo ne sont pas applicables sur ${PRODUCT_LABELS[product]}.`,
        );
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
