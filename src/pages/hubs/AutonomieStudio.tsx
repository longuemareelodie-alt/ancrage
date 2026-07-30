import { CalendarRange, ListChecks, Repeat, Star, BookHeart, Sparkles } from "lucide-react";
import HubShell from "@/components/hub/HubShell";

const TOOLS = [
  { icon: Repeat, label: "Routine", soon: true },
  { icon: CalendarRange, label: "Emploi du temps", soon: true },
  { icon: BookHeart, label: "Histoire sociale", soon: true },
  { icon: Star, label: "Récompenses", soon: true },
  { icon: ListChecks, label: "Check-list", soon: true },
  { icon: Sparkles, label: "Aide IA", soon: true },
];

const AutonomieStudio = () => (
  <HubShell
    title="Studio d'autonomie"
    subtitle="Bientôt : crée des supports visuels personnalisés, imprimables en PDF."
  >
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TOOLS.map(({ icon: Icon, label, soon }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-border bg-card/60 px-3 py-6 text-center"
        >
          <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
          <span className="text-xs font-medium text-foreground">{label}</span>
          {soon && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Bientôt
            </span>
          )}
        </div>
      ))}
    </div>
    <p className="pt-4 text-xs leading-relaxed text-muted-foreground">
      Cet espace est déjà réservé dans la navigation : les supports arriveront
      ici sans rien déplacer de ce que tu utilises aujourd'hui.
    </p>
  </HubShell>
);

export default AutonomieStudio;
