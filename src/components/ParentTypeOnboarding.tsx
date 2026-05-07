import { useEffect, useState } from "react";
import { setParentType, hasChosenParentType, markParentTypeChosen, type ParentType } from "@/lib/parentType";
import { setSchoolContext, type SchoolContext } from "@/lib/schoolContext";

const SCHOOL_CHOSEN_KEY = "ancrage_school_context_chosen";

function hasChosenSchoolContext(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SCHOOL_CHOSEN_KEY) === "1";
}
function markSchoolContextChosen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHOOL_CHOSEN_KEY, "1");
}

/**
 * First-run modal: 2 steps.
 *  1. Parent profile (maman / papa)
 *  2. Daily context (avant l'école / boulot / vacances)
 *
 * Each step can be skipped independently with "Plus tard".
 */
export default function ParentTypeOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"parent" | "school">("parent");

  useEffect(() => {
    const needParent = !hasChosenParentType();
    const needSchool = !hasChosenSchoolContext();
    if (needParent || needSchool) {
      setOpen(true);
      setStep(needParent ? "parent" : "school");
    }
  }, []);

  function chooseParent(value: ParentType) {
    setParentType(value);
    if (!hasChosenSchoolContext()) setStep("school");
    else setOpen(false);
  }

  function skipParent() {
    markParentTypeChosen();
    if (!hasChosenSchoolContext()) setStep("school");
    else setOpen(false);
  }

  function chooseSchool(value: SchoolContext) {
    setSchoolContext(value);
    markSchoolContextChosen();
    setOpen(false);
  }

  function skipSchool() {
    markSchoolContextChosen();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Avant de commencer · {step === "parent" ? "1/2" : "2/2"}
        </div>

        {step === "parent" ? (
          <>
            <h2 className="mb-2 text-center font-serif text-2xl text-foreground">
              On adapte le ton à toi.
            </h2>
            <p className="mb-5 text-center text-sm text-muted-foreground">
              On garde exactement les mêmes outils. On ajuste juste les mots,
              les exemples et les accords. Tu pourras changer à tout moment.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseParent("maman")}
                className="rounded-2xl border border-border bg-background p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="mb-1 text-3xl">🌸</div>
                <div className="text-base font-semibold text-foreground">Maman</div>
                <div className="text-xs text-muted-foreground">Ton plus doux, déculpabilisant</div>
              </button>
              <button
                onClick={() => chooseParent("papa")}
                className="rounded-2xl border border-border bg-background p-4 text-center transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="mb-1 text-3xl">🌊</div>
                <div className="text-base font-semibold text-foreground">Papa</div>
                <div className="text-xs text-muted-foreground">Ton plus direct, opérationnel</div>
              </button>
            </div>

            <button
              onClick={skipParent}
              className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Plus tard
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-center font-serif text-2xl text-foreground">
              C'est quoi, ton matin type ?
            </h2>
            <p className="mb-5 text-center text-sm text-muted-foreground">
              Pour que les micro-scènes collent à ta réalité.
              Tu pourras changer à tout moment.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => chooseSchool("school")}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">🎒</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">Avant l'école</span>
                  <span className="block text-xs text-muted-foreground">Réveil, cartable, départ pressé</span>
                </span>
              </button>
              <button
                onClick={() => chooseSchool("work")}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">☕</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">Avant le boulot</span>
                  <span className="block text-xs text-muted-foreground">Sans enfants à gérer le matin</span>
                </span>
              </button>
              <button
                onClick={() => chooseSchool("holiday")}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="text-2xl">🌿</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">Vacances / week-end</span>
                  <span className="block text-xs text-muted-foreground">Pas de cadre imposé</span>
                </span>
              </button>
            </div>

            <button
              onClick={skipSchool}
              className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Plus tard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
