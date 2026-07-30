import {
  CalendarDays,
  Wallet,
  FolderLock,
  HeartPulse,
  Users,
  BookHeart,
  Handshake,
  Heart,
  Settings,
  Sprout,
} from "lucide-react";
import HubShell from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

const Plus = () => (
  <HubShell title="Plus" subtitle="Tout le reste, rangé par besoin.">
    <p className="pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Organisation
    </p>
    <HubCard
      to="/organisation"
      icon={CalendarDays}
      title="Calendrier & tâches"
      desc="Rendez-vous, rappels, à faire."
    />
    <HubCard to="/budget" icon={Wallet} title="Budget" desc="Dépenses, factures, échéances." />
    <HubCard
      to="/famille/coffre"
      icon={FolderLock}
      title="Coffre-fort"
      desc="Documents importants du foyer."
    />

    <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Santé
    </p>
    <HubCard to="/sante" icon={HeartPulse} title="Espace santé" desc="Rendez-vous, traitements, fiche d'urgence." />

    <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Ressources
    </p>
    <HubCard to="/ressources" icon={BookHeart} title="Ressources" desc="Neuroatypie, LSF, activités, annuaire." />
    <HubCard to="/lies-autrement" icon={Sprout} title="Liés autrement" desc="L'espace des familles qui avancent autrement." />

    <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Communauté
    </p>
    <HubCard to="/lies-autrement/communaute" icon={Users} title="Échanges" desc="Parler avec d'autres parents." />
    <HubCard to="/mon-impact" icon={Handshake} title="Mon impact" desc="Programme ambassadrice." />

    <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Mon compte
    </p>
    <HubCard to="/profil" icon={Heart} title="Mon profil" />
    <HubCard to="/parametres" icon={Settings} title="Réglages" />
  </HubShell>
);

export default Plus;
