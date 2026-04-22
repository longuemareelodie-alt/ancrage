import { useNavigate } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import { ArrowLeft, Phone, ExternalLink, ShieldAlert, HeartHandshake, Scale } from "lucide-react";

interface Resource {
  name: string;
  desc?: string;
  phone?: string;
  url?: string;
}

const violences: Resource[] = [
  { name: "3919 — Violences Femmes Info", desc: "Anonyme et gratuit, 24/7", phone: "3919" },
  { name: "Police Secours", phone: "17" },
  { name: "Numéro d'urgence européen", phone: "112" },
  { name: "Solidarité Femmes", url: "https://www.solidaritefemmes.org" },
  { name: "Arrêtons les violences (gouv)", url: "https://arretonslesviolences.gouv.fr" },
  { name: "Tchat anonyme 24/7", url: "https://commentonsaime.fr" },
  { name: "France Victimes", phone: "116006", url: "https://www.france-victimes.fr" },
];

const cancer: Resource[] = [
  { name: "Cancer Info — Ligue contre le cancer", phone: "0805 123 124", url: "https://www.ligue-cancer.net" },
  { name: "Institut National du Cancer", url: "https://www.e-cancer.fr" },
  { name: "RoseUp Association (femmes cancer)", url: "https://www.rose-up.fr" },
  { name: "Vivre Comme Avant (cancer du sein)", url: "https://vivrecommeavant.fr" },
  { name: "SAMU", phone: "15" },
  { name: "Maladies Rares Info Services", phone: "0156535281", url: "https://www.maladiesraresinfo.org" },
];

const droits: Resource[] = [
  { name: "Service Public", url: "https://www.service-public.fr" },
  { name: "CAF", url: "https://www.caf.fr" },
  { name: "Ameli (Sécurité sociale)", url: "https://www.ameli.fr" },
  { name: "France Travail", url: "https://www.francetravail.fr" },
  { name: "Défenseur des Droits", phone: "09 69 39 00 00", url: "https://www.defenseurdesdroits.fr" },
  { name: "CIDFF — Droits des femmes", url: "https://fncidff.info" },
  { name: "Mes Droits Sociaux", url: "https://www.mesdroitssociaux.gouv.fr" },
  { name: "Aide juridictionnelle", url: "https://www.justice.fr/aide-juridictionnelle" },
];

const SanteRessources = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <button onClick={() => navigate("/sante")} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour
        </button>
        <h1 className="text-2xl font-bold">🌸 Mes Ressources</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Numéros d'urgence et liens utiles. Tu n'es pas seule.
        </p>
      </SectionBlock>

      <SectionBlock>
        <Category icon={ShieldAlert} title="Violences conjugales" items={violences} color="text-red-600" />
      </SectionBlock>

      <SectionBlock>
        <Category icon={HeartHandshake} title="Cancer & maladie" items={cancer} color="text-pink-600" />
      </SectionBlock>

      <SectionBlock>
        <Category icon={Scale} title="Droits & aides sociales" items={droits} color="text-blue-600" />
      </SectionBlock>
    </div>
  );
};

const Category = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: Resource[]; color: string; }) => (
  <div>
    <div className="mb-3 flex items-center gap-2">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className="text-base font-bold">{title}</h2>
    </div>
    <div className="space-y-2">
      {items.map((r) => (
        <div key={r.name} className="rounded-xl bg-card p-3 shadow-sm">
          <p className="text-sm font-semibold">{r.name}</p>
          {r.desc && <p className="mt-0.5 text-xs text-muted-foreground">{r.desc}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {r.phone && (
              <a
                href={`tel:${r.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                <Phone className="h-3 w-3" /> {r.phone}
              </a>
            )}
            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
              >
                <ExternalLink className="h-3 w-3" /> Site web
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SanteRessources;
