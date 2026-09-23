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
  "/connexion",
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
      className="fixed right-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
    </button>
  );
}
