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
  Target,
  Syringe,
  Pill,
  Grid3x3,
  Brain,
  Mic,
  Sparkles,
  Wallet,
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
    "/", "/auth", "/connexion", "/reset-password", "/set-password",
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

  // Le menu de création est contextuel : il propose exactement ce que l'on
  // vient faire depuis l'onglet où l'on se trouve.
  const path = location.pathname;

  const MENUS: { match: string; title: string; actions: Action[] }[] = [
    {
      match: "/moi",
      title: "Pour toi",
      actions: [
        { to: "/moi/emotions", label: "Noter une émotion", icon: Heart },
        { to: "/lies-autrement/journal", label: "Écrire dans mon journal", icon: PenLine },
        { to: "/moi/objectifs", label: "Ajouter un objectif", icon: Target },
        { to: "/moi/apaisement", label: "M'apaiser maintenant", icon: Moon },
      ],
    },
    {
      match: "/famille",
      title: "Pour ta famille",
      actions: [
        { to: "/famille", label: "Ajouter un enfant", icon: Users },
        { to: "/famille/coffre", label: "Scanner un document", icon: FileUp },
        { to: "/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus },
        { to: "/sante/medicaments", label: "Ajouter un traitement", icon: Pill },
      ],
    },
    {
      match: "/autonomie",
      title: "Créer un support",
      actions: [
        { to: "/autonomie/assistant", label: "Créer avec l'Assistant Éclosia", icon: Sparkles },
        { to: "/autonomie/studio", label: "Nouvelle routine", icon: Repeat },
        { to: "/autonomie/studio", label: "Nouvelle histoire sociale", icon: BookHeart },
        { to: "/autonomie/studio", label: "Nouvelle check-list", icon: ListChecks },
        { to: "/autonomie/studio", label: "Nouveau tableau de récompenses", icon: Star },
        { to: "/autonomie/studio", label: "Nouvelle carte visuelle", icon: Grid3x3 },
      ],
    },
    {
      match: "/plus",
      title: "Tous les raccourcis",
      actions: [
        { to: "/pulse/vider-ma-tete", label: "Vider ma tête", icon: Brain },
        { to: "/recherche", label: "Rechercher dans Éclosia", icon: Grid3x3 },
        { to: "/moi/emotions", label: "Noter une émotion", icon: Heart },
        { to: "/lies-autrement/journal", label: "Écrire dans mon journal", icon: PenLine },
        { to: "/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus },
        { to: "/budget", label: "Ajouter une dépense", icon: Wallet },
        { to: "/famille/coffre", label: "Déposer un document", icon: FileUp },
      ],
    },
  ];

  const fallback = {
    title: "Que souhaites-tu faire ?",
    actions: [
      { to: "/pulse/vider-ma-tete", label: "Vider ma tête", icon: Brain },
      { to: "/plus/organisation", label: "Ajouter une tâche", icon: ListChecks },
      { to: "/organisation", label: "Ajouter un rendez-vous", icon: CalendarPlus },
      { to: "/moi/emotions", label: "Noter une émotion", icon: Heart },
      { to: "/famille/coffre", label: "Déposer un document", icon: FileUp },
      { to: "/pulse/vider-ma-tete", label: "Parler (bientôt)", icon: Mic },
    ] as Action[],
  };

  const menu = MENUS.find((m) => path.startsWith(m.match)) ?? fallback;


  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
      isActive ? "text-primary-dark" : "text-muted-foreground hover:text-foreground"
    }`;

  const renderTab = (item: { to: string; label: string; icon: LucideIcon }) => (
    <li key={item.to} className="min-w-0">
      <NavLink to={item.to} className={tabClass}>
        {({ isActive }) => (
          <>
            <item.icon
              className="h-[18px] w-[18px] transition-transform"
              strokeWidth={isActive ? 2.2 : 1.75}
            />
            <span className="max-w-full truncate leading-none tracking-[-0.01em]">{item.label}</span>
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
      <div aria-hidden className="h-[calc(5.25rem+env(safe-area-inset-bottom))] w-full" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),0.625rem)]"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto grid h-[60px] max-w-lg grid-cols-6 items-stretch rounded-[22px] border border-border/60 bg-card/95 shadow-[0_10px_30px_-14px_hsl(var(--foreground)/0.28)] backdrop-blur-xl">
          {left.map(renderTab)}

          <li className="flex min-w-0 items-center justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Créer"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_6px_14px_-8px_hsl(var(--primary-dark)/0.6)] transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </li>

          {right.map(renderTab)}
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left font-serif text-2xl">{menu.title}</SheetTitle>
          </SheetHeader>

          <div className="space-y-2 pb-8">
            {menu.actions.map((a, i) => renderAction(a, "a" + i))}
          </div>

        </SheetContent>
      </Sheet>
    </>
  );
};

export default BottomNav;
