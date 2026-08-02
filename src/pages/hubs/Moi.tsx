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
} from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Moi = () => (
  <HubShell title="Moi" subtitle="Ton espace, à ton rythme. Rien à rattraper ici.">
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
