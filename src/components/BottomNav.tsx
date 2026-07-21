import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Heart, Wallet, HeartPulse, Grid3x3, Users, FolderLock, CalendarDays, BarChart3, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * Bottom navigation for paying users.
 * 5 primary tabs + "Plus" opens a sheet with the 9-module grid.
 */
const BottomNav = () => {
  const { user, loading, isPaid } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const hiddenRoutes = [
    "/", "/auth", "/reset-password", "/set-password",
    "/cgv", "/confidentialite", "/mentions-legales",
    "/unsubscribe", "/paywall", "/comparaison", "/aller-plus-loin",
    "/payment-success", "/post-flow",
  ];

  if (loading || !user || !isPaid) return null;
  if (hiddenRoutes.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;

  const primary = [
    { to: "/dashboard", label: "Accueil", icon: Home },
    { to: "/emotions", label: "Émotions", icon: Heart },
    { to: "/budget", label: "Budget", icon: Wallet },
    { to: "/sante", label: "Santé", icon: HeartPulse },
  ];

  const allModules = [
    { to: "/dashboard", label: "Accueil", icon: Home, emoji: "🏠" },
    { to: "/emotions", label: "Émotions", icon: Heart, emoji: "❤️" },
    { to: "/famille", label: "Famille", icon: Users, emoji: "👨‍👩‍👧" },
    { to: "/sante", label: "Santé", icon: HeartPulse, emoji: "💊" },
    { to: "/coffre", label: "Coffre-fort", icon: FolderLock, emoji: "📂" },
    { to: "/budget", label: "Budget", icon: Wallet, emoji: "💰" },
    { to: "/organisation", label: "Organisation", icon: CalendarDays, emoji: "📅" },
    { to: "/statistiques", label: "Statistiques", icon: BarChart3, emoji: "📊" },
    { to: "/profil", label: "Profil", icon: User, emoji: "👤" },
  ];

  return (
    <>
      <div aria-hidden className="h-20 w-full" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_hsl(var(--foreground)/0.08)]"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {primary.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="w-full flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Grid3x3 className="h-5 w-5" />
                  <span>Plus</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader className="mb-4"><SheetTitle className="font-playfair text-2xl text-left">Tous les modules</SheetTitle></SheetHeader>
                <div className="grid grid-cols-3 gap-3 pb-6">
                  {allModules.map((m) => (
                    <NavLink
                      key={m.to}
                      to={m.to}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95"
                    >
                      <div className="text-2xl">{m.emoji}</div>
                      <span className="text-xs font-medium text-foreground">{m.label}</span>
                    </NavLink>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default BottomNav;
