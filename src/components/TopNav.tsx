import { Link, useLocation } from "react-router-dom";
import { Home, HelpCircle, Sparkles } from "lucide-react";
import { useState } from "react";

/**
 * Top navigation for public pages.
 * Shows clear links to Home, FAQ (homepage anchor), and the tool entry point.
 * The current page is highlighted via aria-current + an active style.
 *
 * Hidden on app/tool screens to avoid duplication with BottomNav.
 */
const PUBLIC_PATHS = new Set<string>([
  "/",
  "/cgv",
  "/mentions-legales",
  "/confidentialite",
  "/comparaison",
  "/paywall",
  "/aller-plus-loin",
  "/auth",
  "/reset-password",
  "/unsubscribe",
]);

type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  match: (pathname: string, hash: string) => boolean;
};

const items: NavItem[] = [
  {
    label: "Accueil",
    to: "/",
    icon: Home,
    match: (p, h) => p === "/" && h !== "#faq",
  },
  {
    label: "FAQ",
    to: "/#faq",
    icon: HelpCircle,
    match: (p, h) => p === "/" && h === "#faq",
  },
  {
    label: "Accéder à l'outil",
    to: "/emotions",
    icon: Sparkles,
    match: (p) => p.startsWith("/emotions") || p.startsWith("/emotion/"),
  },
];

const TopNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!PUBLIC_PATHS.has(location.pathname)) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4"
      >
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight"
          aria-label="Retour à l'accueil"
        >
          Ancrage
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {items.map((item) => {
            const active = item.match(location.pathname, location.hash);
            const Icon = item.icon;
            const isCTA = item.label === "Accéder à l'outil";
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isCTA
                      ? active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-primary/90 text-primary-foreground hover:bg-primary"
                      : active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="topnav-mobile"
          className="inline-flex items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
        >
          Menu
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul
          id="topnav-mobile"
          className="flex flex-col gap-1 border-t border-border/60 bg-background px-4 py-2 sm:hidden"
        >
          {items.map((item) => {
            const active = item.match(location.pathname, location.hash);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </header>
  );
};

export default TopNav;
