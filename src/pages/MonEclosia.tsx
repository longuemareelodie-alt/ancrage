import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
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
import { SPACES, useActiveSpaces, type SpaceId } from "@/lib/spaces";
import { toast } from "@/hooks/use-toast";

const MonEclosia = () => {
  const navigate = useNavigate();
  const { spaces, toggle } = useActiveSpaces();
  const [confirm, setConfirm] = useState<SpaceId | null>(null);

  const active = SPACES.filter((s) => spaces.includes(s.id));
  const hidden = SPACES.filter((s) => !spaces.includes(s.id));

  const add = async (id: SpaceId) => {
    const res = await toggle(id, true);
    toast({ description: res.ok ? "C'est ajouté. 🌸" : "Ça n'a pas pu être enregistré. On réessaie ?" });
  };

  const hide = async () => {
    if (!confirm) return;
    const id = confirm;
    setConfirm(null);
    const res = await toggle(id, false);
    toast({ description: res.ok ? "Espace masqué. Tes données sont gardées." : "Ça n'a pas pu être enregistré." });
  };

  return (
    <HubShell
      title="Personnaliser mon Éclosia"
      subtitle="Choisis ce que tu veux voir au quotidien. Tu peux modifier tes choix quand tu veux."
    >
      <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Mes espaces actifs
      </p>
      <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>☀️</span>
          <span className="flex-1 text-sm font-semibold text-foreground">Aujourd'hui</span>
          <span className="text-xs text-muted-foreground">Toujours visible</span>
        </div>
      </div>
      {active.map((s) => (
        <label
          key={s.id}
          className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-4"
        >
          <span className="text-xl" aria-hidden>{s.mascot}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">{s.label}</span>
            <span className="block text-xs text-muted-foreground">{s.desc}</span>
          </span>
          <input
            type="checkbox"
            checked
            onChange={() => setConfirm(s.id)}
            aria-label={`Masquer ${s.label}`}
            className="h-5 w-5 accent-[hsl(var(--primary))]"
          />
        </label>
      ))}

      {hidden.length > 0 && (
        <>
          <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ajouter un espace
          </p>
          {hidden.map((s) => (
            <button
              key={s.id}
              onClick={() => void add(s.id)}
              className="flex w-full min-h-[56px] items-center gap-3 rounded-[20px] border border-dashed border-border bg-card/60 px-5 py-4 text-left active:scale-[0.99]"
            >
              <Plus className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-xl" aria-hidden>{s.mascot}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.desc}</span>
              </span>
            </button>
          ))}
        </>
      )}

      <div className="space-y-2 pt-6">
        <button
          onClick={() => navigate("/bienvenue?besoins=1")}
          className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground"
        >
          Modifier mes besoins
        </button>
        <button
          onClick={() => navigate("/bienvenue?besoins=1&refaire=1")}
          className="w-full rounded-full border border-border px-5 py-3.5 text-sm font-semibold text-foreground"
        >
          Refaire mes questions
        </button>
        <Link to="/mes-espaces" className="block py-2 text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
          Voir tous mes espaces
        </Link>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masquer cet espace ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tes données seront conservées. Tu pourras le réactiver quand tu veux.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => void hide()}>Masquer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HubShell>
  );
};

export default MonEclosia;
