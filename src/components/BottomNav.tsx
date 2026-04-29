import { NavLink, useLocation } from "react-router-dom";
import { Home, Heart, HeartPulse, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Persistent bottom navigation bar for paying users.
 * - Hidden for free users and on auth/landing/legal pages.
 * - Eligibility resolved upstream in AuthContext (no flash, no duplicate query).
 */
const BottomNav = () => {
  const { user, loading, isPaid } = useAuth();
  const location = useLocation();

  // Routes where the bottom nav should NOT appear
  const hiddenRoutes = [
    "/",
    "/auth",
    "/reset-password",
    "/cgv",
    "/confidentialite",
    "/mentions-legales",
    "/unsubscribe",
    "/paywall",
    "/comparaison",
    "/aller-plus-loin",
    "/payment-success",
    "/post-flow",
  ];

  if (!ready) return null;
  if (!user) return null;
  if (!isPaid) return null;
  if (hiddenRoutes.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;

  const items = [
    { to: "/dashboard", label: "Accueil", icon: Home },
    { to: "/checkin", label: "Rituel", icon: Heart },
    { to: "/sante", label: "Santé", icon: HeartPulse },
    { to: "/profil", label: "Espace", icon: User },
  ];

  return (
    <>
      {/* Spacer so content isn't hidden behind the fixed nav */}
      <div aria-hidden className="h-20 w-full" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_hsl(var(--foreground)/0.08)]"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {items.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default BottomNav;
