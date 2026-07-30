import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Heart,
  Users,
  Sprout,
  MoreHorizontal,
  Plus,
  CalendarPlus,
  FileUp,
  PenLine,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * Primary navigation: 5 needs-based hubs + one central quick-action button.
 * Designed for minimal cognitive load — never more than five destinations.
 */
const BottomNav = () => {
  const { user, loading, isPaid } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const hiddenRoutes = [
    "/", "/auth", "/reset-password", "/set-password",
    "/cgv", "/confidentialite", "/mentions-legales",
    "/unsubscribe", "/paywall", "/comparaison", "/aller-plus-loin",
    "/payment-success", "/post-flow", "/devenir-ambassadrice",
  ];

  if (loading || !user || !isPaid) return null;
  if (hiddenRoutes.includes(location.pathname)) return null;
  if (location.pathname.startsWith("/fiche-urgence/")) return null;

  const left = [
    { to: "/aujourdhui", label: "Aujourd'hui", icon: Home },
    { to: "/moi", label: "Moi", icon: Heart },
  ];
  const right = [
    { to: "/famille", label: "Famille", icon: Users },
    { to: "/autonomie", label: "Autonomie", icon: Sprout },
    { to: "/plus", label: "Plus", icon: MoreHorizontal },
  ];

  const quickActions = [
    { to: "/emotions", label: "Noter une émotion", icon: Heart },
    { to: "/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus },
    { to: "/famille/coffre", label: "Déposer un document", icon: FileUp },
    { to: "/lies-autrement/journal", label: "Écrire au journal", icon: PenLine },
  ];

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
      isActive ? "text-primary-dark" : "text-muted-foreground hover:text-foreground"
    }`;

  const renderTab = (item: { to: string; label: string; icon: typeof Home }) => (
    <li key={item.to} className="flex-1">
      <NavLink to={item.to} end className={tabClass}>
        {({ isActive }) => (
          <>
            <item.icon
              className="h-[18px] w-[18px] transition-transform"
              strokeWidth={isActive ? 2.2 : 1.75}
            />
            <span className="leading-none">{item.label}</span>
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <>
      <div aria-hidden className="h-24 w-full" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        aria-label="Navigation principale"
      >
        <ul className="relative mx-auto flex max-w-lg items-stretch justify-around px-2 py-2">
          {left.map(renderTab)}

          <li className="flex w-16 shrink-0 items-start justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Actions rapides"
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_-12px_hsl(var(--foreground)/0.45)] transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" strokeWidth={2} />
            </button>
          </li>

          {right.map(renderTab)}
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-serif text-2xl">
              Que veux-tu faire ?
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-8">
            {quickActions.map((a) => (
              <button
                key={a.to}
                onClick={() => {
                  setOpen(false);
                  navigate(a.to);
                }}
                className="flex w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 text-left transition-all active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/60">
                  <a.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-medium text-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
