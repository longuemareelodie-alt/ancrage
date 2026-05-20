import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Users, FolderClosed, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/ancrage", label: "Accueil", icon: Home, end: true },
  { to: "/ancrage/enfants", label: "Enfants", icon: Users },
  { to: "/ancrage/documents", label: "Documents", icon: FolderClosed },
  { to: "/ancrage/ia", label: "IA", icon: Sparkles },
  { to: "/ancrage/profil", label: "Profil", icon: User },
];

const AncrageLayout = () => {
  const { pathname } = useLocation();
  return (
    <div
      className="min-h-screen w-full"
      style={
        {
          // Scoped Ancrage palette — sage / beige / off-white
          ["--ancrage-bg" as string]: "#F7F4EE",
          ["--ancrage-surface" as string]: "#FFFFFF",
          ["--ancrage-soft" as string]: "#EFEAE0",
          ["--ancrage-ink" as string]: "#2E342E",
          ["--ancrage-ink-soft" as string]: "#6B7268",
          ["--ancrage-sage" as string]: "#A7BFA3",
          ["--ancrage-sage-deep" as string]: "#7C9B78",
          ["--ancrage-sand" as string]: "#E8DDC8",
          ["--ancrage-blush" as string]: "#F4D6CC",
          ["--ancrage-sky" as string]: "#D6E4E5",
          background: "var(--ancrage-bg)",
          color: "var(--ancrage-ink)",
          fontFamily:
            "'Inter', 'SF Pro Text', system-ui, -apple-system, sans-serif",
        } as React.CSSProperties
      }
    >
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-md px-5 pt-6 pb-32"
      >
        <Outlet />
      </motion.main>

      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      >
        <div
          className="mx-auto max-w-md px-3 pb-3 pt-2"
          style={{
            background:
              "linear-gradient(to top, var(--ancrage-bg) 70%, transparent)",
          }}
        >
          <ul
            className="flex items-stretch justify-around rounded-2xl px-2 py-2 shadow-[0_8px_30px_-12px_rgba(46,52,46,0.18)]"
            style={{
              background: "var(--ancrage-surface)",
              border: "1px solid var(--ancrage-soft)",
            }}
          >
            {tabs.map((t) => (
              <li key={t.to} className="flex-1">
                <NavLink
                  to={t.to}
                  end={t.end}
                  className="group flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-all"
                  style={({ isActive }) => ({
                    color: isActive
                      ? "var(--ancrage-sage-deep)"
                      : "var(--ancrage-ink-soft)",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                        style={{
                          background: isActive
                            ? "var(--ancrage-soft)"
                            : "transparent",
                        }}
                      >
                        <t.icon
                          className="h-[18px] w-[18px]"
                          strokeWidth={isActive ? 2.4 : 1.8}
                        />
                      </span>
                      <span className="leading-none">{t.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default AncrageLayout;
