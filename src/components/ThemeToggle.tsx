import { Moon, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredTheme, setTheme, type ThemeChoice } from "@/lib/theme";
import { haptic } from "@/lib/feedback";

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Automatique", icon: SunMoon },
];

/** Choix d'ambiance — clair, sombre chaleureux, ou automatique. */
const ThemeToggle = () => {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => setChoice(getStoredTheme()), []);

  const pick = (value: ThemeChoice) => {
    setChoice(value);
    setTheme(value);
    haptic("light");
  };

  return (
    <div role="radiogroup" aria-label="Ambiance visuelle" className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => pick(value)}
            className={`calm-press flex min-h-11 flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-xs font-medium ${
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
