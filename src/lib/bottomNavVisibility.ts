import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** Pages où la barre du bas n'apparaît jamais (pages publiques, paiement, connexion). */
export const BOTTOM_NAV_HIDDEN_ROUTES = [
  "/", "/auth", "/connexion", "/reset-password", "/set-password",
  "/cgv", "/confidentialite", "/mentions-legales",
  "/unsubscribe", "/paywall", "/comparaison", "/aller-plus-loin",
  "/payment-success", "/post-flow", "/devenir-ambassadrice",
  "/appli-organisation-familiale",
];

/** Une seule règle partagée : la barre du bas et le bouton jour/nuit flottant ne se chevauchent jamais. */
export function useBottomNavVisible(): boolean {
  const { user, loading, isPaid } = useAuth();
  const { pathname } = useLocation();
  if (loading || !user || !isPaid) return false;
  if (BOTTOM_NAV_HIDDEN_ROUTES.includes(pathname)) return false;
  if (pathname.startsWith("/fiche-urgence/")) return false;
  return true;
}
