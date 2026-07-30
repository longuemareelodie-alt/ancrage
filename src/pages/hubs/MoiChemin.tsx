import { Clock, BookOpen, Image, BarChart3, History } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const MoiChemin = () => (
  <HubShell
    title="Mon chemin"
    subtitle="Tout ce que tu as déjà traversé, rassemblé au même endroit."
  >
    <HubCard
      to="/frise-evolution"
      icon={Clock}
      title="Ma frise d'évolution"
      desc="Avant, tempête, aujourd'hui."
    />
    <HubCard
      to="/livre-reconstruction"
      icon={BookOpen}
      title="Mon livre de reconstruction"
      desc="Tes mois, chapitre par chapitre. Exportable en PDF."
    />
    <HubCard
      to="/portrait-transformation"
      icon={Image}
      title="Mes portraits"
      desc="Ton portrait de transformation."
    />
    <HubCard
      to="/statistiques"
      icon={BarChart3}
      title="Mes repères"
      desc="Ce que disent tes semaines, en douceur."
    />
    <HubCard
      to="/historique"
      icon={History}
      title="Mon historique"
      desc="Toutes tes notes d'humeur."
    />
  </HubShell>
);

export default MoiChemin;
