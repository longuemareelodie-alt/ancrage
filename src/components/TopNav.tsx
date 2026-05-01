import { Link, useLocation } from "react-router-dom";
import { Home, HelpCircle, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Dev-only: detect if multiple <TopNav /> instances are mounted simultaneously.
let __topNavMountCount = 0;
const __listeners = new Set<(n: number) => void>();
const __notify = () => __listeners.forEach((l) => l(__topNavMountCount));

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
  "/set-password",
  "/unsubscribe",
]);

type NavKey = "home" | "faq" | "tool";

type NavItem = {
  key: NavKey;
  to: string;
  icon: typeof Home;
  match: (pathname: string, hash: string) => boolean;
};

const items: NavItem[] = [
  {
    key: "home",
    to: "/",
    icon: Home,
    match: (p, h) => p === "/" && h !== "#faq",
  },
  {
    key: "faq",
    to: "/#faq",
    icon: HelpCircle,
    match: (p, h) => p === "/" && h === "#faq",
  },
  {
    key: "tool",
    to: "/emotions",
    icon: Sparkles,
    match: (p) => p.startsWith("/emotions") || p.startsWith("/emotion/"),
  },
];

const TopNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [mountCount, setMountCount] = useState(0);

  useEffect(() => {
    __topNavMountCount += 1;
    __notify();
    const listener = (n: number) => setMountCount(n);
    __listeners.add(listener);
    listener(__topNavMountCount);
    if (__topNavMountCount > 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `[TopNav] ⚠️ ${__topNavMountCount} instances montées simultanément — il ne devrait y en avoir qu'une.`,
      );
    }
    return () => {
      __topNavMountCount -= 1;
      __listeners.delete(listener);
      __notify();
    };
  }, []);

  if (!PUBLIC_PATHS.has(location.pathname)) return null;

  const showDuplicateBadge = import.meta.env.DEV && mountCount > 1;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {showDuplicateBadge && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 bg-destructive px-3 py-1 text-[11px] font-semibold text-destructive-foreground"
        >
          ⚠️ DEV : {mountCount} barres TopNav montées simultanément
        </div>
      )}
      <nav
        aria-label={t("nav.main")}
        className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4"
      >
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight"
          aria-label={t("nav.back_home")}
        >
          Ancrage
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {items.map((item) => {
            const active = item.match(location.pathname, location.hash);
            const Icon = item.icon;
            const isCTA = item.key === "tool";
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
                  <span>{t(`nav.${item.key}`)}</span>
                </Link>
              </li>
            );
          })}
          <li className="ms-1">
            <LanguageSwitcher />
          </li>
        </ul>

        {/* Mobile: language + menu */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="topnav-mobile"
            className="inline-flex items-center rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {t("nav.menu")}
          </button>
        </div>
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
                  {t(`nav.${item.key}`)}
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
