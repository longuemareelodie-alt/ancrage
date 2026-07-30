import { Wind, Compass, Footprints, LifeBuoy, Sparkles } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const MoiApaisement = () => (
  <HubShell
    title="M'apaiser"
    subtitle="Commence par le premier bloc. Tu n'as rien d'autre à faire maintenant."
  >
    <HubCard
      to="/calme"
      icon={Wind}
      title="Retrouver le calme"
      desc="Un exercice court, tout de suite."
    />
    <HubCard
      to="/comprendre"
      icon={Compass}
      title="Comprendre ce qui se passe"
      desc="Mettre des mots sur ce que tu traverses."
    />
    <HubCard
      to="/avancer"
      icon={Footprints}
      title="Avancer d'un pas"
      desc="Une action minuscule, réalisable aujourd'hui."
    />
    <HubCard
      to="/parcours"
      icon={Sparkles}
      title="Mon parcours guidé"
      desc="Le fil doux, étape par étape."
    />
    <HubCard
      to="/urgence"
      icon={LifeBuoy}
      title="Besoin d'aide immédiate"
      desc="Numéros et gestes d'urgence."
    />
  </HubShell>
);

export default MoiApaisement;
