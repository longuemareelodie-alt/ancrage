import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/lib/theme";
import { useBottomNavVisible } from "@/lib/bottomNavVisibility";

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/**
 * Bouton jour/nuit intégré dans un en-tête (Aujourd'hui, Menu) :
 * il ne flotte jamais au-dessus des cartes.
 */
export const DayNightButton = ({ className = "" }: { className?: string }) => {
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
      title={dark ? "Mode jour" : "Mode nuit"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:text-foreground active:scale-95 ${className}`}
    >
      {dark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
    </button>
  );
};

/**
 * Version flottante, réservée aux pages sans barre du bas (pages publiques).
 * Dans l'appli, le bouton vit dans l'en-tête d'Aujourd'hui et dans le Menu.
 */
const DayNightToggle = () => {
  const dark = useIsDark();
  const inApp = useBottomNavVisible();
  if (inApp) return null;
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
      title={dark ? "Mode jour" : "Mode nuit"}
      className="fixed left-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/70 text-muted-foreground opacity-80 shadow-sm backdrop-blur transition hover:opacity-100 active:scale-95"
      style={{ bottom: "calc(max(env(safe-area-inset-bottom), 0.5rem) + 0.75rem)" }}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default DayNightToggle;
