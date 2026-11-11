import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  LifeBuoy,
  Briefcase,
  SlidersHorizontal,
  LayoutGrid,
  Puzzle,
} from "lucide-react";
import HubShell, { HubSection } from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";
import { DayNightButton } from "@/components/DayNightToggle";

/**
 * Menu — « Explorer Éclosia ». Tous les outils, classés par univers.
 * Chaque entrée est un raccourci vers l'outil existant : rien n'est recréé ici.
 */
const Plus = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/recherche?q=${encodeURIComponent(q.trim())}` : "/recherche");
  };

  return (
    <HubShell
      title="Explorer Éclosia"
      subtitle="Tous tes outils, classés par univers."
      action={<DayNightButton className="mt-1" />}
    >
      <form onSubmit={search} role="search">
        <label className="flex min-h-[52px] items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 focus-within:border-primary/50">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un outil, un enfant, un document…"
            aria-label="Rechercher dans Éclosia"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </form>

      <HubSection title="Organisation" />
      <HubCard to="/organisation" icon={CalendarDays} title="Calendrier et tâches" desc="Rendez-vous, rappels, à faire, courses." />
      <HubCard to="/budget" icon={Wallet} title="Budget" desc="Mois par mois, factures et dépenses." />
      <HubCard to="/famille/coffre" icon={FolderLock} title="Coffre-fort" desc="Les documents importants du foyer." />

      <HubSection title="Famille" />
      <HubCard to="/sante" icon={HeartPulse} title="Santé de la famille" desc="Rendez-vous, traitements, fiche d'urgence." />
      <HubCard to="/autonomie" icon={Puzzle} title="Autonomie et supports" desc="Routines, histoires sociales, cartes visuelles." />

      <HubSection title="Activité" />
      <HubCard to="/business" icon={Briefcase} title="Business" desc="Contacts, relances, clientes. Sans pression." />

      <HubSection title="Ressources et communauté" />
      <HubCard to="/ressources" icon={BookHeart} title="Ressources" desc="Neuroatypie, LSF, activités, annuaire." />
      <HubCard to="/lies-autrement" icon={Sprout} title="Liés autrement" desc="L'espace des familles qui avancent autrement." />
      <HubCard to="/lies-autrement/communaute" icon={Users} title="Échanges" desc="Parler avec d'autres parents." />

      <HubSection title="Programme" />
      <HubCard to="/mon-impact" icon={Handshake} title="Programme ambassadrice" desc="Ton impact et tes commissions." />

      <HubSection title="Mon compte" />
      <HubCard to="/profil" icon={Heart} title="Mon profil" />
      <HubCard to="/mon-eclosia" icon={SlidersHorizontal} title="Personnalisation" desc="Ce qu'Éclosia te propose au quotidien." />
      <HubCard to="/mes-espaces" icon={LayoutGrid} title="Tous mes espaces" desc="Tout reste là, même masqué." />
      <HubCard to="/parametres" icon={Settings} title="Réglages" desc="Notifications, mode jour et nuit, confidentialité." />
      <HubCard to="/parametres#support" icon={LifeBuoy} title="Support" desc="Une question ? On te répond." />
    </HubShell>
  );
};

export default Plus;
