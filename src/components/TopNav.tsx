import { Link, useLocation } from "react-router-dom";
import { Home, HelpCircle, Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ParentTypeBadge from "@/components/ParentTypeBadge";

/**
 * Right-side navigation panel for public pages.
 * Replaces the previous top bar — same links + parent badge, integrated as a
 * collapsible vertical sidebar pinned to the right edge.
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

const STORAGE_KEY = "ancrage_sidebar_open";

const TopNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === "1";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* noop */
    }
  }, [open]);

  if (!PUBLIC_PATHS.has(location.pathname)) return null;

  return (
    <>
      {/* Toggle button — always visible on the right edge */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ancrage-side-nav"
        aria-label={open ? t("nav.menu") : t("nav.menu")}
        className="fixed right-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-soft backdrop-blur transition-colors hover:bg-muted"
      >
        {open ? (
          <PanelRightClose className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelRightOpen className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <aside
        id="ancrage-side-nav"
        aria-label={t("nav.main")}
        data-state={open ? "open" : "closed"}
        className={[
          "fixed right-0 top-0 z-40 flex h-full w-64 flex-col gap-4 border-l border-border/60 bg-background/95 px-4 pb-6 pt-16 shadow-soft-lg backdrop-blur transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <Link
          to="/"
          className="text-base font-semibold tracking-tight"
          aria-label={t("nav.back_home")}
        >
          Ancrage
        </Link>

        <nav aria-label={t("nav.main")}>
          <ul className="flex flex-col gap-1">
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
                      "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
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
          </ul>
        </nav>

        <div className="mt-auto">
          <ParentTypeBadge />
        </div>
      </aside>
    </>
  );
};

export default TopNav;
