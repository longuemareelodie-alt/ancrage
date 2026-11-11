import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Heart,
  Users,
  Menu as MenuIcon,
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
  Pill,
  Grid3x3,
  Brain,
  Sparkles,
  Sprout,
  LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useBottomNavVisible } from "@/lib/bottomNavVisibility";

type Action = { to: string; label: string; icon: LucideIcon };
type Tab = { to: string; label: string; icon: LucideIcon; match: string[] };

/**
 * Navigation principale, identique pour toutes :
 * Aujourd'hui · Famille · [+] · Moi · Menu.
 * Santé vit dans Famille, le reste dans Menu. Le « + » ne propose que des
 * actions rapides — jamais une deuxième page de navigation.
 */
const TABS_LEFT: Tab[] = [
  { to: "/aujourdhui", label: "Aujourd'hui", icon: Home, match: ["/aujourdhui", "/pulse"] },
  { to: "/famille", label: "Famille", icon: Users, match: ["/famille", "/sante"] },
];
const TABS_RIGHT: Tab[] = [
  { to: "/moi", label: "Moi", icon: Heart, match: ["/moi", "/lies-autrement/journal", "/portrait-transformation", "/livre-reconstruction", "/frise-evolution"] },
  { to: "/plus", label: "Menu", icon: MenuIcon, match: ["/plus", "/recherche", "/mon-eclosia", "/mes-espaces", "/parametres", "/profil"] },
];

/** Actions rapides par défaut : ce qui se fait en moins d'une minute. */
const QUICK: Action[] = [
  { to: "/moi/emotions", label: "Noter une émotion", icon: Heart },
  { to: "/lies-autrement/journal", label: "Écrire dans mon journal", icon: PenLine },
  { to: "/moi/objectifs", label: "Ajouter une priorité ou un objectif", icon: Target },
  { to: "/moi/apaisement", label: "M'apaiser maintenant", icon: Moon },
  { to: "/autonomie/studio", label: "Créer un support", icon: Sprout },
  { to: "/pulse/vider-ma-tete", label: "Vider ma tête", icon: Brain },
];

const MENUS: { match: string[]; title: string; actions: Action[] }[] = [
  {
    match: ["/famille", "/sante"],
    title: "Pour ta famille",
    actions: [
      { to: "/famille?nouveau=1", label: "Ajouter un membre", icon: Users },
      { to: "/famille/coffre", label: "Scanner un document", icon: FileUp },
      { to: "/sante/rendez-vous", label: "Ajouter un rendez-vous médical", icon: CalendarPlus },
      { to: "/sante/medicaments", label: "Ajouter un traitement", icon: Pill },
      { to: "/autonomie/studio", label: "Créer un support", icon: Sprout },
    ],
  },
  {
    match: ["/autonomie"],
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
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const visible = useBottomNavVisible();

  if (!visible) return null;

  const path = location.pathname;
  const isActive = (t: Tab) => t.match.some((m) => path === m || path.startsWith(m + "/"));
  const menu =
    MENUS.find((m) => m.match.some((p) => path === p || path.startsWith(p + "/"))) ??
    { title: "Pour toi", actions: QUICK };

  const renderTab = (t: Tab) => {
    const active = isActive(t);
    return (
      <div key={t.to} className="min-w-0 flex-1">
        <Link
          to={t.to}
          aria-current={active ? "page" : undefined}
          className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors ${
            active ? "text-primary-dark" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
              active ? "bg-secondary/70" : ""
            }`}
          >
            <t.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.75} />
          </span>
          <span className="max-w-full truncate leading-none tracking-[-0.01em]">{t.label}</span>
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Espace réservé : hauteur barre (56px) + safe-area réelle + marge — rien ne passe dessous */}
      <div aria-hidden className="h-[calc(56px+max(env(safe-area-inset-bottom),0.625rem)+2rem)] w-full shrink-0" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),0.625rem)]"
        aria-label="Navigation principale"
      >
        <div className="relative mx-auto flex h-14 max-w-lg items-stretch rounded-[22px] border border-border/60 bg-card/95 shadow-[0_10px_30px_-14px_hsl(var(--foreground)/0.28)] backdrop-blur-xl">
          <div className="flex min-w-0 flex-1 items-stretch">{TABS_LEFT.map(renderTab)}</div>
          <div aria-hidden className="w-16 shrink-0" />
          <div className="flex min-w-0 flex-1 items-stretch">{TABS_RIGHT.map(renderTab)}</div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Actions rapides"
              className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_18px_-6px_hsl(var(--primary-dark)/0.65)] ring-4 ring-card transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left text-2xl">{menu.title}</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 pb-8">
            {menu.actions.map((a, i) => (
              <button
                key={a.label + i}
                onClick={() => {
                  setOpen(false);
                  navigate(a.to);
                }}
                className="flex min-h-[56px] w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-3 text-left transition-all active:scale-[0.99]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary/60">
                  <a.icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
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
