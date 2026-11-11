import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/lib/theme";

/** Petit bouton jour/nuit discret, toujours accessible. */
const DayNightToggle = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Passer en mode jour" : "Passer en mode nuit"}
      title={dark ? "Mode jour" : "Mode nuit"}
      className="fixed left-3 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/60 text-muted-foreground opacity-70 shadow-sm backdrop-blur transition hover:opacity-100 active:scale-95"
      style={{ bottom: "calc(60px + max(env(safe-area-inset-bottom), 0.625rem) + 1.25rem)" }}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};

export default DayNightToggle;
