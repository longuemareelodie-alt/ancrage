import { Link } from "react-router-dom";
import { Check, ChevronRight, Plus } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import { SPACES, useActiveSpaces } from "@/lib/spaces";
import { toast } from "@/hooks/use-toast";

/** Accès secondaire : chaque espace reste joignable, même masqué. */
const MesEspaces = () => {
  const { spaces, toggle } = useActiveSpaces();
  return (
    <HubShell title="Tous mes espaces" subtitle="Tout est là, même ce que tu as rangé.">
      {SPACES.map((s) => {
        const on = spaces.includes(s.id);
        return (
          <div key={s.id} className="flex items-center gap-2 rounded-[20px] border border-border/70 bg-card pr-3">
            <Link to={s.to} className="flex min-h-[64px] min-w-0 flex-1 items-center gap-3 px-5 py-4">
              <span className="text-xl" aria-hidden>{s.mascot}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
            {on ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground">
                <Check className="h-3.5 w-3.5" /> Actif
              </span>
            ) : (
              <button
                onClick={async () => {
                  const r = await toggle(s.id, true);
                  toast({ description: r.ok ? `${s.label} est de retour. 🌸` : "Ça n'a pas pu être enregistré." });
                }}
                className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            )}
          </div>
        );
      })}
      <Link to="/mon-eclosia" className="block pt-4 text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
        Personnaliser mon Éclosia
      </Link>
    </HubShell>
  );
};

export default MesEspaces;
