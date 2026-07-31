import { Heart, PenLine, Moon, Clock, Target } from "lucide-react";
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
      title="Mon journal"
      desc="Écrire librement ou guidée. 100 % privé."
    />
    <HubCard
      to="/moi/apaisement"
      icon={Moon}
      title="M'apaiser maintenant"
      desc="Quand ça déborde, un chemin court et calme."
    />
    <HubCard
      to="/moi/chemin"
      icon={Clock}
      title="Mon chemin"
      desc="Frise, livre de reconstruction, portraits, repères."
    />
    <HubCard
      to="/moi/objectifs"
      icon={Target}
      title="Objectifs & réussites"
      desc="Ce que tu veux, ce que tu as déjà réussi."
    />
  </HubShell>
);

export default Moi;
