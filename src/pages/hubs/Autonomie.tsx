import { Sparkles, ShieldAlert, Rainbow, Wand2 } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Autonomie = () => (
  <HubShell
    title="Autonomie"
    subtitle="Des supports concrets pour l'aider à faire seul, à son rythme."
  >
    <HubCard
      to="/autonomie/studio"
      icon={Wand2}
      title="Studio"
      desc="Créer routines, emplois du temps visuels, récompenses, check-lists."
    />
    <HubCard
      to="/autonomie/crise"
      icon={ShieldAlert}
      title="Gérer une crise"
      desc="Étapes claires, à la maison ou dehors."
    />
    <HubCard
      to="/comment-tu-te-sens"
      icon={Rainbow}
      title="Comment tu te sens ?"
      desc="Aider ton enfant à nommer ses émotions."
    />
    <HubCard
      to="/lies-autrement/activites"
      icon={Sparkles}
      title="Activités & lien"
      desc="Idées par âge et selon les besoins."
    />
  </HubShell>
);

export default Autonomie;
