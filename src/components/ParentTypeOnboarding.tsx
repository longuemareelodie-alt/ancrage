import { useEffect, useState } from "react";
import { setParentType, type ParentType } from "@/lib/parentType";

const CHOSEN_KEY = "ancrage_parent_type_chosen";

/**
 * First-run modal asking the user to pick a parent profile (maman / papa).
 * Once chosen, we set a flag in localStorage so the modal never reappears.
 * Users can always change their choice later from the home toggle or /profil.
 */
export default function ParentTypeOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const chosen = localStorage.getItem(CHOSEN_KEY);
      if (!chosen) setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  function choose(value: ParentType) {
    setParentType(value);
    try { localStorage.setItem(CHOSEN_KEY, "1"); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Avant de commencer
        </div>
        <h2 className="mb-2 text-center font-serif text-2xl text-foreground">
          On adapte le ton à toi.
        </h2>
        <p className="mb-5 text-center text-sm text-muted-foreground">
          On garde exactement les mêmes outils. On ajuste juste les mots,
          les exemples et les accords. Tu pourras changer à tout moment.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => choose("maman")}
            className="rounded-2xl border border-border bg-background p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-1 text-3xl">🌸</div>
            <div className="text-base font-semibold text-foreground">Maman</div>
            <div className="text-xs text-muted-foreground">Ton plus doux, déculpabilisant</div>
          </button>
          <button
            onClick={() => choose("papa")}
            className="rounded-2xl border border-border bg-background p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-1 text-3xl">🌊</div>
            <div className="text-base font-semibold text-foreground">Papa</div>
            <div className="text-xs text-muted-foreground">Ton plus direct, opérationnel</div>
          </button>
        </div>

        <button
          onClick={() => choose("maman")}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
