import {
  Heart,
  PenLine,
  Moon,
  Clock,
  Target,
  Trophy,
  Sparkles,
  BookOpen,
  History,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Moi = () => (
  <HubShell title="Moi" subtitle="Ton espace, à ton rythme. Rien à rattraper ici.">
    <div className="rounded-[20px] border border-border/70 bg-card px-5 py-4">
      <p className="text-sm font-semibold text-foreground">De quoi as-tu besoin maintenant ?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ["🌙 M'apaiser", "/moi/apaisement"],
          ["🧠 Vider ma tête", "/pulse/vider-ma-tete"],
          ["🎯 Choisir une priorité", "/moi/objectifs"],
          ["🧩 Créer un support", "/autonomie/studio"],
          ["📓 Écrire", "/lies-autrement/journal"],
        ].map(([l, to]) => (
          <Link key={to} to={to} className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
            {l}
          </Link>
        ))}
      </div>
    </div>
    <HubCard
      to="/moi/emotions"
      icon={Heart}
      title="Mes émotions"
      desc="Noter comment tu vas, en un geste."
    />
    <HubCard
      to="/lies-autrement/journal"
      icon={PenLine}
      title="Journal"
      desc="Écrire librement ou guidée. 100 % privé."
    />
    <HubCard
      to="/moi/apaisement"
      icon={Moon}
      title="M'apaiser"
      desc="Respiration, ancrage, relaxation. Tout de suite."
    />
    <HubCard
      to="/moi/chemin"
      icon={Clock}
      title="Mon chemin"
      desc="Ta chronologie : moments, émotions, victoires."
    />
    <HubCard
      to="/moi/objectifs"
      icon={Target}
      title="Objectifs"
      desc="Ce que tu veux, à ton rythme."
    />
    <HubCard
      to="/moi/habitudes"
      icon={CalendarCheck}
      title="Mes habitudes"
      desc="Une grille de la semaine. Un jour vide n'est pas un échec."
    />
    <HubCard
      to="/moi/badges"
      icon={Trophy}
      title="Mes petits moments"
      desc="Tes badges privés. Aucun classement."
    />
    <HubCard
      to="/portrait-transformation"
      icon={Sparkles}
      title="Portrait"
      desc="Qui tu deviens, mois après mois."
    />
    <HubCard
      to="/livre-reconstruction"
      icon={BookOpen}
      title="Livre de reconstruction"
      desc="Ton livre personnel, exportable en PDF."
    />
    <HubCard
      to="/frise-evolution"
      icon={History}
      title="Frise"
      desc="Avant, tempête, aujourd'hui."
    />
  </HubShell>
);

export default Moi;
