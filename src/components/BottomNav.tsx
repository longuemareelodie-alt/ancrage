import { useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
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
  Repeat,
  ListChecks,
  BookHeart,
  Star,
  Moon,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Action = { to: string; label: string; icon: LucideIcon };

/**
 * Navigation principale : 5 espaces + un bouton central de création.
 * Le « + » porte toute la création de l'app — c'est pour cela qu'aucun hub
 * n'a besoin de son propre bouton « ajouter ».
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

  // Le menu de création est contextuel : deux suggestions en tête selon
  // l'heure et l'écran courant, le reste replié dessous.
  const hour = new Date().getHours();
  const path = location.pathname;

  const suggested: Action[] = [];
  if (path.startsWith("/famille")) {
    suggested.push({ to: "/famille", label: "Ajouter une information enfant", icon: Users });
    suggested.push({ to: "/autonomie/studio", label: "Créer un support pour lui", icon: Repeat });
  } else if (path.startsWith("/autonomie")) {
    suggested.push({ to: "/autonomie/studio", label: "Créer un support", icon: Repeat });
    suggested.push({ to: "/autonomie/bibliotheque", label: "Partir d'un modèle", icon: ListChecks });
  } else if (hour >= 20 || hour < 7) {
    suggested.push({ to: "/moi/apaisement", label: "M'apaiser maintenant", icon: Moon });
    suggested.push({ to: "/moi/journal", label: "Écrire dans mon journal", icon: PenLine });
  } else {
    suggested.push({ to: "/moi/emotions", label: "Noter une émotion", icon: Heart });
    suggested.push({ to: "/plus/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus });
  }

  const creations: Action[] = [
    { to: "/moi/emotions", label: "Noter une émotion", icon: Heart },
    { to: "/moi/journal", label: "Écrire dans mon journal", icon: PenLine },
    { to: "/plus/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus },
    { to: "/famille/coffre", label: "Déposer un document", icon: FileUp },
    { to: "/autonomie/studio", label: "Créer une routine", icon: Repeat },
    { to: "/autonomie/studio", label: "Créer une check-list", icon: ListChecks },
    { to: "/autonomie/bibliotheque", label: "Créer une histoire sociale", icon: BookHeart },
    { to: "/autonomie/studio", label: "Créer un tableau de récompenses", icon: Star },
  ].filter((a) => !suggested.some((s) => s.label === a.label));

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
      isActive ? "text-primary-dark" : "text-muted-foreground hover:text-foreground"
    }`;

  const renderTab = (item: { to: string; label: string; icon: LucideIcon }) => (
    <li key={item.to} className="flex-1">
      <NavLink to={item.to} className={tabClass}>
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

  const renderAction = (a: Action, key: string) => (
    <button
      key={key}
      onClick={() => {
        setOpen(false);
        navigate(a.to);
      }}
      className="flex w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-3.5 text-left transition-all active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary/60">
        <a.icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-medium text-foreground">{a.label}</span>
    </button>
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
              aria-label="Créer"
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_-12px_hsl(var(--foreground)/0.45)] transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" strokeWidth={2} />
            </button>
          </li>

          {right.map(renderTab)}
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-serif text-2xl">
              Que souhaites-tu faire ?
            </SheetTitle>
          </SheetHeader>

          <p className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Suggéré maintenant
          </p>
          <div className="space-y-2">{suggested.map((a, i) => renderAction(a, "s" + i))}</div>

          <p className="pb-2 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Créer
          </p>
          <div className="space-y-2 pb-8">{creations.map((a, i) => renderAction(a, "c" + i))}</div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
