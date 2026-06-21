import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Printer, Loader2, Home, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CURRENT_CONTRACT_VERSION,
  CURRENT_CONTRACT_HASH,
  type ContractStatus,
} from "@/lib/ambassadorContract";

const EDITEUR = {
  nom: "Digital Maman Libre",
  forme: "Entreprise individuelle (micro-entreprise)",
  siret: "829 977 958 00018",
  siren: "829 977 958",
  tva: "FR49829977958",
  email: "contact@digitalmamanlibre.com",
};

export default function AmbassadriceContrat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ContractStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_my_contract_status");
      if (!error) setStatus(data as unknown as ContractStatus);
      setLoading(false);
    })();
  }, [user]);

  const alreadyCurrent =
    status?.accepted && status.version === CURRENT_CONTRACT_VERSION;

  const submit = async () => {
    if (!accepted) {
      toast.error("Merci de cocher l'acceptation du contrat.");
      return;
    }
    if (fullName.trim().length < 2) {
      toast.error("Renseigne ton nom complet (prénom + nom).");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.rpc("accept_ambassador_contract", {
      _full_name: fullName.trim(),
      _contract_version: CURRENT_CONTRACT_VERSION,
      _contract_hash: CURRENT_CONTRACT_HASH,
      _user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message?.includes("not premium")
          ? "Le programme est réservé aux mamans Eclosia premium."
          : "Une erreur est survenue.",
      );
      return;
    }
    toast.success("Contrat accepté — bienvenue dans le cercle 🌱");
    setTimeout(() => navigate("/mon-impact"), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-3xl mx-auto px-6 pt-8 space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/mon-impact"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-full"
          >
            <Printer className="w-4 h-4 mr-2" /> Imprimer / PDF
          </Button>
        </div>

        <header className="text-center">
          <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
          <h1 className="font-serif-display text-3xl sm:text-4xl text-primary-dark">
            Contrat d'affiliation Eclosia
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Version {CURRENT_CONTRACT_VERSION}
          </p>
        </header>

        {alreadyCurrent && (
          <div className="rounded-2xl bg-sage/15 border border-sage/30 p-5 text-sm flex items-start gap-3 print:hidden">
            <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-foreground">
                Tu as déjà accepté la version en vigueur.
              </div>
              <div className="text-muted-foreground mt-1">
                Signé par <strong>{status?.full_name}</strong> le{" "}
                {status?.accepted_at
                  ? new Date(status.accepted_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
                .
              </div>
            </div>
          </div>
        )}

        {status?.accepted && !alreadyCurrent && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm print:hidden">
            <div className="font-medium text-foreground">
              Le contrat a été mis à jour.
            </div>
            <div className="text-muted-foreground mt-1">
              Tu avais accepté la version <strong>{status.version}</strong>.
              Merci de relire et d'accepter la nouvelle version pour continuer à
              recevoir tes commissions.
            </div>
          </div>
        )}

        <article className="rounded-[1.5rem] bg-card p-6 sm:p-8 shadow-soft space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              1. Parties
            </h2>
            <p>
              Le présent contrat est conclu entre&nbsp;:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>L'éditeur</strong>&nbsp;: {EDITEUR.nom},{" "}
                {EDITEUR.forme}, SIRET {EDITEUR.siret} (SIREN {EDITEUR.siren}),
                TVA intracommunautaire {EDITEUR.tva}, ci-après « Eclosia ».
              </li>
              <li>
                <strong>L'ambassadrice</strong>&nbsp;: l'utilisatrice premium
                titulaire du compte Eclosia ayant accepté électroniquement le
                présent contrat (identifiée par son adresse email de compte et
                son nom complet déclaré).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              2. Objet
            </h2>
            <p>
              Eclosia met à disposition de l'ambassadrice un lien et un code de
              parrainage personnels lui permettant de recommander
              l'abonnement Eclosia à d'autres mamans. Chaque nouvelle abonnée
              premium qui rejoint Eclosia via ce lien donne droit à une
              commission, selon les modalités décrites ci-après.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              3. Statut indépendant
            </h2>
            <p>
              L'ambassadrice agit en qualité de <strong>partenaire
              indépendante</strong>. Le présent contrat n'établit aucun lien
              de subordination, de salariat, de mandat exclusif ni de
              franchise. L'ambassadrice n'a pas le pouvoir d'engager Eclosia.
              Elle est seule responsable, le cas échéant, de la déclaration
              de ses revenus de parrainage auprès des autorités fiscales et
              sociales compétentes selon son pays de résidence et son propre
              statut.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              4. Cercles et taux de commission
            </h2>
            <p>Les commissions sont calculées sur le prix HT payé par la maman parrainée pour son abonnement premium, et évoluent selon le cercle de l'ambassadrice&nbsp;:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>🌱 Cercle Graine</strong> (0 à 4 mamans validées)&nbsp;: <strong>20 %</strong></li>
              <li><strong>🌸 Cercle Fleur</strong> (5 à 14 mamans validées)&nbsp;: <strong>25 %</strong></li>
              <li><strong>💛 Cercle Fondatrice</strong> (15 mamans validées et plus)&nbsp;: <strong>30 %</strong></li>
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">
              Le cercle est recalculé automatiquement à chaque validation.
              Une fois atteint, un cercle ne peut pas redescendre.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              5. Validation et délai
            </h2>
            <p>
              Une recommandation est <strong>« en attente »</strong> dès qu'une
              nouvelle maman souscrit via le lien de l'ambassadrice. Elle
              passe à l'état <strong>« validée »</strong> après un délai de{" "}
              <strong>14 jours</strong> à compter du paiement, correspondant
              au délai légal de rétractation et anti-remboursement.
            </p>
            <p className="mt-2">
              Si la maman parrainée demande un remboursement, annule ou est
              remboursée pour quelque raison que ce soit pendant ce délai, la
              commission est annulée et ne sera pas versée.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              6. Paiement des commissions
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Les commissions validées sont cumulées et versées par
                <strong> virement SEPA</strong> sur l'IBAN renseigné par
                l'ambassadrice depuis son espace « Mon Impact ».
              </li>
              <li>
                Le paiement est déclenché <strong>une fois par mois</strong>
                (généralement entre le 1<sup>er</sup> et le 5 du mois suivant),
                pour tout solde supérieur ou égal à <strong>20 €</strong>.
              </li>
              <li>
                Si le solde est inférieur à 20 €, il est reporté au mois
                suivant.
              </li>
              <li>
                L'ambassadrice reçoit un email de confirmation à chaque
                virement effectué, indiquant le montant, la période concernée,
                les 4 derniers chiffres de l'IBAN crédité et la référence du
                lot.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              7. Obligations de l'ambassadrice
            </h2>
            <p>L'ambassadrice s'engage à&nbsp;:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                Communiquer <strong>honnêtement et sans promesse exagérée</strong>{" "}
                sur Eclosia (pas de garantie de résultat, pas de discours
                médical, pas d'allégation thérapeutique).
              </li>
              <li>
                Respecter les lois en vigueur, notamment en matière de
                publicité, de protection des données et de droit de la
                consommation (mention claire de son lien d'affiliation
                lorsqu'elle communique publiquement, conformément aux
                obligations légales des influenceurs).
              </li>
              <li>
                Ne pas faire de spam, ni d'achat de trafic frauduleux, ni
                d'auto-parrainage (souscrire avec un second compte pour
                toucher une commission).
              </li>
              <li>
                Ne pas dénigrer Eclosia ni d'autres ambassadrices.
              </li>
              <li>
                Protéger la confidentialité des informations sensibles
                auxquelles elle pourrait avoir accès.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              8. Suspension et résiliation
            </h2>
            <p>
              Le présent contrat est conclu pour une durée indéterminée.
              Chaque partie peut y mettre fin à tout moment, sans préavis,
              par simple notification écrite (email à {EDITEUR.email} pour
              l'ambassadrice, depuis l'espace personnel ou par email pour
              Eclosia).
            </p>
            <p className="mt-2">
              En cas de manquement aux obligations ci-dessus (notamment
              fraude, auto-parrainage, dénigrement), Eclosia peut suspendre
              immédiatement le compte ambassadrice et annuler les
              commissions non encore versées correspondant aux fraudes
              constatées.
            </p>
            <p className="mt-2">
              À la résiliation, les commissions déjà validées et atteignant
              le seuil de 20 € sont versées normalement. Les commissions en
              attente sont annulées.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              9. Données personnelles
            </h2>
            <p>
              Les données collectées dans le cadre du programme
              (identité, email, IBAN, nom du titulaire, historique des
              parrainages et paiements, IP et navigateur lors de
              l'acceptation du présent contrat) sont traitées par
              {" "}{EDITEUR.nom} en qualité de responsable de traitement,
              pour la stricte exécution du programme et le respect des
              obligations légales (comptabilité, lutte contre la fraude).
              Elles sont conservées pendant la durée du contrat puis
              archivées conformément aux durées légales (10 ans pour les
              pièces comptables).
            </p>
            <p className="mt-2">
              L'ambassadrice dispose d'un droit d'accès, de rectification,
              d'effacement et de portabilité, exerçable à {EDITEUR.email}.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              10. Évolutions du contrat
            </h2>
            <p>
              Eclosia peut modifier le présent contrat. Toute modification
              matérielle (taux, seuil, délai) sera notifiée à l'ambassadrice
              par email et nécessitera une nouvelle acceptation
              électronique pour continuer à recevoir des commissions. Les
              commissions déjà validées avant la nouvelle version restent
              dues selon les termes en vigueur au moment de leur
              validation.
            </p>
          </section>

          <section>
            <h2 className="font-serif-display text-xl text-primary-dark mb-2">
              11. Droit applicable
            </h2>
            <p>
              Le présent contrat est soumis au <strong>droit français</strong>.
              Tout litige sera, à défaut de résolution amiable préalable
              (l'ambassadrice est invitée à contacter {EDITEUR.email} avant
              toute action), soumis aux tribunaux compétents du ressort du
              siège de l'éditeur.
            </p>
          </section>
        </article>

        {!alreadyCurrent && (
          <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4 print:hidden">
            <h3 className="font-serif-display text-lg text-primary-dark">
              Acceptation électronique
            </h3>
            <div>
              <Label htmlFor="fullName">Nom complet (prénom + nom)</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marie Dupont"
                className="mt-1"
                autoComplete="name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ce nom vaut signature électronique du contrat.
              </p>
            </div>

            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
              />
              <span>
                J'ai lu et j'accepte sans réserve le contrat d'affiliation
                Eclosia version {CURRENT_CONTRACT_VERSION}. Je reconnais
                agir en tant que partenaire indépendante et être seule
                responsable de mes obligations fiscales et sociales.
              </span>
            </label>

            <Button
              onClick={submit}
              disabled={submitting || !accepted || fullName.trim().length < 2}
              size="lg"
              className="rounded-full w-full sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Accepter et activer mon compte ambassadrice
            </Button>

            <p className="text-xs text-muted-foreground">
              En validant, ton acceptation est horodatée et archivée (date,
              version du contrat, navigateur). Tu peux à tout moment
              télécharger une copie de ce contrat via le bouton
              « Imprimer / PDF ».
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
