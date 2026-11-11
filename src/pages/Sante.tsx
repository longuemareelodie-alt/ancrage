import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Pill, HeartPulse, LifeBuoy, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PREMIUM_CTA } from "@/lib/premiumOffer";
import DiscoveryHint from "@/components/DiscoveryHint";
import HubShell, { HubSection } from "@/components/hub/HubShell";
import HubCard from "@/components/hub/HubCard";

/**
 * Santé de la famille — rattachée à Famille. Un seul dossier par membre :
 * les traitements, allergies et documents restent sur le profil du bon membre,
 * cette page ne fait que les rassembler.
 */
const Sante = () => {
  // Même règle que l'accès aux pages Santé : compte payé ou compte historique.
  const { isPaid } = useAuth();
  const hasAccess = !!isPaid;

  const gate = (to: string) => (hasAccess ? to : "/paywall");
  const lockedMeta = hasAccess ? undefined : "Inclus dans l'accès à vie";

  return (
    <HubShell title="Santé de la famille" subtitle="Rendez-vous, traitements et urgences, pour chaque membre.">
      <Link to="/famille" className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Ma famille
      </Link>

      <DiscoveryHint id="sante-home" title="La santé de ta famille">
        Chaque information reste rattachée au bon membre. La fiche d'urgence se partage par un QR
        code sécurisé.
      </DiscoveryHint>

      <HubSection title="Au quotidien" />
      <HubCard to={gate("/sante/rendez-vous")} icon={Calendar} title="Rendez-vous médicaux" desc="Agenda médical avec rappels." meta={lockedMeta} />
      <HubCard to={gate("/sante/medicaments")} icon={Pill} title="Médicaments et traitements" desc="Suivi et rappels quotidiens." meta={lockedMeta} />

      <HubSection title="Dossiers" />
      <HubCard to={gate("/sante/profils-familiaux")} icon={Users} title="Profils médicaux" desc="Un dossier par membre : allergies, diagnostics, documents." meta={lockedMeta} />
      <HubCard to={gate("/sante/fiche-medicale")} icon={HeartPulse} title="Fiche d'urgence" desc="Les infos vitales que tu choisis, via un QR code." meta={lockedMeta} />

      <HubSection title="Ressources" />
      <HubCard to="/sante/ressources" icon={LifeBuoy} title="Numéros et liens utiles" desc="Les contacts santé importants en France." />

      {!hasAccess && (
        <div className="mt-4 rounded-[20px] border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Débloque tout ton suivi santé</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            L'accès à vie te donne tout : agenda médical, suivi des traitements, fiche d'urgence et tout le contenu d'Éclosia.
          </p>
          <Link
            to="/paywall"
            className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {PREMIUM_CTA.unlock_full_access}
          </Link>
        </div>
      )}
    </HubShell>
  );
};

export default Sante;
