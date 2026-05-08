import { useLocation } from "react-router-dom";
import { Compass, X } from "lucide-react";
import { useDiscovery } from "@/contexts/DiscoveryContext";
import { useAuth } from "@/contexts/AuthContext";

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

/**
 * Slim banner shown across all in-app pages while discovery mode is on.
 * Lets the user disable the mode in one tap.
 */
export default function DiscoveryBadge() {
  const { active, disable } = useDiscovery();
  const { user, isPaid, loading } = useAuth();
  const location = useLocation();

  if (!active || loading || !user || !isPaid) return null;
  if (HIDDEN_ROUTES.has(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;

  return (
    <div className="sticky top-0 z-30 border-b border-primary/20 bg-primary/10 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Mode « Je découvre » actif</span>
        </div>
        <button
          type="button"
          onClick={disable}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-primary/80 transition-colors hover:bg-primary/15 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Désactiver le mode Je découvre"
        >
          Désactiver <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
