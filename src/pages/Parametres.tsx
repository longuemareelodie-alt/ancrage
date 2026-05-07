import { Link } from "react-router-dom";
import { ArrowLeft, Settings as SettingsIcon, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { useParentType } from "@/hooks/useParentType";
import {
  PARENT_TYPE_LABELS,
  PARENT_TYPE_CHOSEN_KEY,
  type ParentType,
} from "@/lib/parentType";
import { SCHOOL_CONTEXT_CHOSEN_KEY } from "@/lib/schoolContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const OPTIONS: ParentType[] = ["maman", "papa"];

export default function Parametres() {
  const [parentType, setParentType, hasChosen] = useParentType();
  const [confirmReset, setConfirmReset] = useState(false);

  function resetOnboarding() {
    try {
      localStorage.removeItem(PARENT_TYPE_CHOSEN_KEY);
      localStorage.removeItem(SCHOOL_CONTEXT_CHOSEN_KEY);
    } catch { /* noop */ }
    setConfirmReset(false);
    toast.success("Onboarding réinitialisé", {
      description: "Il s'affichera à votre prochaine visite de l'accueil.",
      action: { label: "Voir maintenant", onClick: () => { window.location.href = "/"; } },
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>

      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl text-foreground">Paramètres</h1>
          <p className="text-sm text-muted-foreground">
            Personnalisez votre expérience.
          </p>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-serif text-lg text-foreground">Profil parent</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Adapte les textes et illustrations à votre identité.
          {!hasChosen && " (par défaut : Maman)"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const active = parentType === opt && hasChosen;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setParentType(opt);
                  toast.success(`Profil enregistré : ${PARENT_TYPE_LABELS[opt]}`);
                }}
                aria-pressed={active}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {opt === "papa" ? "👨" : "👩"}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                  {PARENT_TYPE_LABELS[opt]}
                  {active && <Check className="h-4 w-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-serif text-lg text-foreground">Onboarding</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Réinitialise votre choix pour revoir le mini-questionnaire de
          bienvenue (profil parent + contexte du quotidien).
        </p>
        <Button
          variant="outline"
          onClick={() => setConfirmReset(true)}
          className="mt-4 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser l'onboarding
        </Button>
      </section>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoir l'onboarding ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le mini-questionnaire de bienvenue s'affichera à nouveau lors de
              votre prochaine visite de l'accueil. Vos autres données restent
              intactes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={resetOnboarding}>
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
