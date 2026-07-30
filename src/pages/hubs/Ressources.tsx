import { BookHeart, BookOpen, Sparkles, PhoneCall } from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Ressources = () => (
  <HubShell
    title="Ressources"
    subtitle="Comprendre, apprendre, trouver la bonne porte."
  >
    <HubCard
      to="/lies-autrement/ressources"
      icon={BookHeart}
      title="Neuroatypie"
      desc="TSA, TDAH, DYS, épilepsie… et les ressources françaises."
    />
    <HubCard
      to="/lies-autrement/lsf"
      icon={BookOpen}
      title="Langue des signes"
      desc="Premiers signes, thèmes et flashcards."
    />
    <HubCard
      to="/lies-autrement/activites"
      icon={Sparkles}
      title="Activités"
      desc="Idées adaptées par âge et par besoin."
    />
    <HubCard
      to="/sante/ressources"
      icon={PhoneCall}
      title="Annuaire utile"
      desc="Numéros et liens essentiels en France."
    />
  </HubShell>
);

export default Ressources;
