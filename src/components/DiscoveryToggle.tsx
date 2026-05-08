import { Compass } from "lucide-react";
import { useDiscovery } from "@/contexts/DiscoveryContext";

/**
 * Compact toggle pill for the "Je découvre" mode.
 * When enabling, also re-arms previously dismissed contextual hints.
 */
export default function DiscoveryToggle() {
  const { active, enable, disable, resetHints } = useDiscovery();

  const handleClick = () => {
    if (active) {
      disable();
    } else {
      resetHints();
      enable();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      }`}
    >
      <Compass className="h-3.5 w-3.5" />
      {active ? "Mode Je découvre : ON" : "Activer Je découvre"}
    </button>
  );
}
