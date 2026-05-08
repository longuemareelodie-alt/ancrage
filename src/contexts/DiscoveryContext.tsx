import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "discovery_mode_v1";
const DISMISSED_PREFIX = "discovery_hint_dismissed_v1:";
const FIRST_VISIT_KEY = "discovery_seen_first_visit_v1";

type DiscoveryContextValue = {
  active: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  isHintDismissed: (id: string) => boolean;
  dismissHint: (id: string) => void;
  resetHints: () => void;
};

const Ctx = createContext<DiscoveryContextValue | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const { user, isPaid, loading } = useAuth();
  const [active, setActive] = useState<boolean>(false);
  const [, force] = useState(0);

  // Hydrate from storage + auto-enable on very first visit for paid users
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setActive(stored === "1");
      return;
    }
    if (!loading && user && isPaid) {
      const firstSeen = localStorage.getItem(FIRST_VISIT_KEY);
      if (!firstSeen) {
        localStorage.setItem(FIRST_VISIT_KEY, "1");
        localStorage.setItem(STORAGE_KEY, "1");
        setActive(true);
      }
    }
  }, [loading, user, isPaid]);

  const persist = useCallback((next: boolean) => {
    setActive(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
  }, []);

  const enable = useCallback(() => persist(true), [persist]);
  const disable = useCallback(() => persist(false), [persist]);
  const toggle = useCallback(() => persist(!active), [persist, active]);

  const isHintDismissed = useCallback((id: string) => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISSED_PREFIX + id) === "1";
  }, []);

  const dismissHint = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DISMISSED_PREFIX + id, "1");
    force((n) => n + 1);
  }, []);

  const resetHints = useCallback(() => {
    if (typeof window === "undefined") return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(DISMISSED_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
    force((n) => n + 1);
  }, []);

  const value = useMemo<DiscoveryContextValue>(
    () => ({ active, enable, disable, toggle, isHintDismissed, dismissHint, resetHints }),
    [active, enable, disable, toggle, isHintDismissed, dismissHint, resetHints],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDiscovery() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiscovery must be used inside DiscoveryProvider");
  return ctx;
}
