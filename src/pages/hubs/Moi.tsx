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
import HubShell, { HubSection } from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

/**
 * Moi — trois univers, dans l'ordre où on en a besoin :
 * d'abord se poser, ensuite avancer, enfin garder une trace.
 * Les actions rapides (noter, écrire, s'apaiser) restent dans le « + ».
 */
const Moi = () => (
  <HubShell title="Moi" subtitle="Ton espace, à ton rythme. Rien à rattraper ici.">
    <HubSection index="01" title="Mon équilibre" hint="Pour te poser, maintenant." />
    <HubCard to="/moi/emotions" icon={Heart} title="Mes émotions" desc="Noter comment tu vas, en un geste." />
    <HubCard to="/moi/apaisement" icon={Moon} title="M'apaiser" desc="Respiration, ancrage, relaxation. Tout de suite." />

    <HubSection index="02" title="Mon évolution" hint="Avancer doucement, sans pression." />
    <HubCard to="/moi/objectifs" icon={Target} title="Objectifs" desc="Ce que tu veux, à ton rythme." />
    <HubCard to="/moi/habitudes" icon={CalendarCheck} title="Mes habitudes" desc="Une grille de la semaine. Un jour vide n'est pas un échec." />
    <HubCard to="/moi/chemin" icon={Clock} title="Mon chemin" desc="Ta chronologie : moments, émotions, victoires." />
    <HubCard to="/portrait-transformation" icon={Sparkles} title="Mon portrait" desc="Qui tu deviens, mois après mois." />

    <HubSection index="03" title="Mes souvenirs et mon histoire" hint="Ce que tu vis mérite d'être gardé." />
    <HubCard to="/lies-autrement/journal" icon={PenLine} title="Journal" desc="Écrire librement ou guidée. 100 % privé." />
    <HubCard to="/moi/badges" icon={Trophy} title="Mes petits moments" desc="Tes badges privés. Aucun classement." />
    <HubCard to="/livre-reconstruction" icon={BookOpen} title="Livre de reconstruction" desc="Ton livre personnel, exportable en PDF." />
    <HubCard to="/frise-evolution" icon={History} title="Frise" desc="Avant, tempête, aujourd'hui." />
  </HubShell>
);

export default Moi;
