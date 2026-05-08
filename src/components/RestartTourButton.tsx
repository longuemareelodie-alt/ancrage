import { useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscovery } from "@/contexts/DiscoveryContext";
import { START_TOUR_EVENT } from "@/components/GuidedTour";

/**
 * Floating "Refaire la visite" button — visible on all in-app pages
 * for paid users. Hidden on landing, auth and legal pages.
 */
const HIDDEN_ROUTES = new Set<string>([
  "/",
  "/auth",
  "/reset-password",
  "/set-password",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
  "/unsubscribe",
  "/paywall",
  "/comparaison",
  "/aller-plus-loin",
  "/payment-success",
  "/payment-pending",
  "/payment-canceled",
  "/post-flow",
]);

export default function RestartTourButton() {
  const { user, isPaid, loading } = useAuth();
  const { active: discoveryActive } = useDiscovery();
  const location = useLocation();

  if (loading || !user || !isPaid) return null;
  // In discovery mode, contextual hints already guide the user — hide the FAB
  if (discoveryActive) return null;
  if (HIDDEN_ROUTES.has(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new CustomEvent(START_TOUR_EVENT))
      }
      aria-label="Refaire la visite guidée"
      title="Refaire la visite guidée"
      className="fixed bottom-24 right-4 z-30 inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card/95 px-3.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
    >
      <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
      <span>Visite</span>
    </button>
  );
}
