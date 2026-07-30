import { Heart, PenLine, Moon, Clock } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Moi = () => (
  <HubShell title="Moi" subtitle="Ton espace, à ton rythme. Rien à rattraper ici.">
    <HubCard
      to="/emotions"
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
  </HubShell>
);

export default Moi;
