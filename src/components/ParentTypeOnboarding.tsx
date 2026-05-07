import { useEffect, useState } from "react";
import { setParentType, hasChosenParentType, markParentTypeChosen, type ParentType } from "@/lib/parentType";

/**
 * First-run modal asking the user to pick a parent profile (maman / papa).
 * Once chosen (or skipped), we mark it via hasChosenParentType so the modal
 * never reappears. "Plus tard" keeps the default but does NOT mark a choice,
 * so subsequent micro-scenes use the neutral fallback copy.
 */
export default function ParentTypeOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasChosenParentType()) setOpen(true);
  }, []);

  function choose(value: ParentType) {
    setParentType(value);
    setOpen(false);
  }

  function skip() {
    // Mark as seen so we don't pop again, but don't claim a profile.
    markParentTypeChosen();
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
          onClick={skip}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
