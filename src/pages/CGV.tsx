import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Link } from "react-router-dom";

const sections = [
  { id: "objet", title: "1. Objet" },
  { id: "editeur-contact", title: "2. Éditeur et contact" },
  { id: "description", title: "3. Description du Service" },
  { id: "capacite-juridique", title: "4. Capacité juridique" },
  { id: "prix", title: "5. Prix" },
  { id: "modalites-paiement", title: "6. Modalités de paiement" },
  { id: "livraison", title: "7. Livraison du contenu numérique" },
  { id: "retractation", title: "8. Droit de rétractation — renonciation expresse" },
  { id: "remboursement-garanties", title: "9. Absence de remboursement commercial — garanties légales" },
  { id: "compte-utilisateur", title: "10. Compte utilisateur" },
  { id: "propriete-intellectuelle", title: "11. Propriété intellectuelle" },
  { id: "responsabilite", title: "12. Responsabilité" },
  { id: "donnees-personnelles", title: "13. Données personnelles" },
  { id: "modification-cgv", title: "14. Modification des CGV" },
  { id: "mediation", title: "15. Médiation de la consommation" },
  { id: "contact-support", title: "16. Contact & support" },
  { id: "droit-juridiction", title: "17. Droit applicable et juridiction compétente" },
];

const CGV = () => (
  <div className="min-h-screen bg-background">
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Conditions Générales de Vente
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <nav
          aria-label="Sommaire"
          className="rounded-xl border border-border bg-card/50 p-4 md:p-5 mb-8"
        >
          <p className="text-sm font-semibold text-foreground mb-3">Sommaire</p>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm list-none p-0 m-0">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 space-y-6">
          <section id="objet" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (« CGV ») régissent la
              vente de l'accès à l'application <strong>Digital Maman Libre</strong>{" "}
              (ci-après « le Service »), accessible depuis les domaines
              digitalmamanlibre.com et ancrage.lovable.app. La validation de la
              commande, matérialisée par la case à cocher d'acceptation lors du
              paiement, vaut acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          <section id="editeur-contact" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">2. Éditeur et contact</h2>
            <p>
              Le Service est édité par Digital Maman Libre. Les informations
              légales complètes (raison sociale, SIREN, hébergeur, contact)
              figurent dans les{" "}
              <Link to="/mentions-legales" className="underline hover:text-primary">
                Mentions légales
              </Link>
              . Toute demande relative à une commande peut être adressée au
              service client via l'adresse e-mail indiquée dans ces mentions.
            </p>
          </section>

          <section id="description" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">3. Description du Service</h2>
            <p>
              Le Service propose des outils numériques d'accompagnement au
              quotidien : suivi émotionnel, parcours guidés, fiches pratiques et
              ressources de soutien. Il s'agit d'un outil de{" "}
              <strong>bien-être</strong> qui <strong>ne constitue ni un
              dispositif médical, ni un diagnostic, ni un substitut à un avis
              professionnel de santé</strong>. En cas de doute ou de détresse,
              l'utilisateur est invité à consulter un professionnel de santé ou
              à contacter un service d'urgence.
            </p>
          </section>

          <section id="capacite-juridique" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">4. Capacité juridique</h2>
            <p>
              Le client déclare être majeur (18 ans révolus) et disposer de la
              pleine capacité juridique pour conclure un contrat à distance. Le
              Service n'est pas destiné aux mineurs.
            </p>
          </section>

          <section id="prix" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">5. Prix</h2>
            <p>
              L'accès complet au Service est proposé sous forme d'un{" "}
              <strong>paiement unique de 39 € TTC</strong> (toutes taxes
              comprises, en euros), donnant un accès illimité dans le temps aux
              fonctionnalités payantes existantes au moment de l'achat. Aucun
              abonnement n'est souscrit : aucun prélèvement récurrent n'est
              effectué.
            </p>
            <p>
              Les prix sont indiqués TTC sur la page de paiement. La TVA
              applicable est, le cas échéant, celle en vigueur au jour de la
              commande. La mention « TVA non applicable, art. 293 B du CGI »
              s'applique si l'éditeur relève du régime de la franchise en base.
            </p>
          </section>

          <section id="modalites-paiement" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">6. Modalités de paiement</h2>
            <p>
              Le paiement s'effectue en ligne, en une seule fois, par carte
              bancaire ou par les moyens de paiement proposés par notre
              prestataire <strong>Mollie</strong>. La transaction est sécurisée
              et aucune coordonnée bancaire n'est stockée sur nos serveurs. La
              commande est définitivement enregistrée après confirmation du
              paiement par le prestataire.
            </p>
          </section>

          <section id="livraison" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">7. Livraison du contenu numérique</h2>
            <p>
              L'accès aux fonctionnalités payantes est activé{" "}
              <strong>immédiatement</strong> après confirmation du paiement, sur
              le compte utilisateur ayant initié la commande. Une confirmation
              de commande est envoyée par e-mail et tient lieu de justificatif.
            </p>
          </section>

          <section id="retractation" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              8. Droit de rétractation — renonciation expresse
            </h2>
            <p>
              Conformément à l'article <strong>L221-28 13°</strong> du Code de la
              consommation, le droit de rétractation ne peut être exercé pour
              les contrats de fourniture d'un contenu numérique non fourni sur
              un support matériel dont l'exécution a commencé après accord
              préalable exprès du consommateur et renoncement exprès à son
              droit de rétractation.
            </p>
            <p>
              En validant sa commande et en cochant la case prévue à cet effet,
              le client <strong>donne expressément son accord</strong> pour que
              l'exécution du Service débute immédiatement après le paiement, et
              <strong> reconnaît expressément renoncer à son droit de
              rétractation</strong> de 14 jours dès l'activation de l'accès.
            </p>
          </section>

          <section id="remboursement-garanties" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              9. Absence de remboursement commercial — garanties légales
            </h2>
            <p>
              Compte tenu de l'accès immédiat au contenu numérique et de la
              renonciation expresse au droit de rétractation prévue à l'article
              8, <strong>aucun remboursement à titre commercial ne pourra être
              accordé</strong> après activation de l'accès au Service.
            </p>
            <p>
              Le client bénéficie en revanche, en toute hypothèse, des{" "}
              <strong>garanties légales</strong> applicables :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                garantie légale de conformité (articles L217-3 et suivants du
                Code de la consommation), permettant d'obtenir la mise en
                conformité du Service en cas de défaut ;
              </li>
              <li>
                garantie contre les vices cachés (articles 1641 et suivants du
                Code civil).
              </li>
            </ul>
            <p>
              Toute demande au titre de ces garanties doit être adressée au
              service client à l'adresse indiquée dans les Mentions légales, en
              décrivant précisément le défaut constaté.
            </p>
          </section>

          <section id="compte-utilisateur" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">10. Compte utilisateur</h2>
            <p>
              Le client est responsable de la confidentialité de ses
              identifiants et de toute activité réalisée depuis son compte. Tout
              usage frauduleux doit être signalé sans délai au service client.
            </p>
          </section>

          <section id="propriete-intellectuelle" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">11. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus du Service (textes, visuels, parcours,
              code, marques) est protégé par le droit de la propriété
              intellectuelle. L'achat confère un droit d'usage personnel, non
              exclusif et non transférable. Toute reproduction, diffusion,
              revente ou exploitation non autorisée est strictement interdite.
            </p>
          </section>

          <section id="responsabilite" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">12. Responsabilité</h2>
            <p>
              Le Service est fourni dans la limite des moyens techniques
              raisonnables. L'éditeur ne saurait être tenu responsable des
              décisions prises par l'utilisateur sur la base des contenus
              proposés, ni des indisponibilités ponctuelles liées à des
              opérations de maintenance ou à des causes extérieures (force
              majeure, défaillance d'un tiers, du réseau Internet, etc.). La
              responsabilité de l'éditeur ne pourra en tout état de cause
              excéder le montant payé par le client au titre du Service.
            </p>
          </section>

          <section id="donnees-personnelles" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">13. Données personnelles</h2>
            <p>
              Les traitements de données personnelles mis en œuvre dans le
              cadre du Service sont conformes au Règlement (UE) 2016/679 (RGPD)
              et à la loi Informatique et Libertés. Le client dispose des
              droits d'accès, de rectification, d'effacement, de limitation,
              d'opposition et de portabilité, qu'il peut exercer dans les
              conditions précisées dans la{" "}
              <Link to="/confidentialite" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section id="modification-cgv" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">14. Modification des CGV</h2>
            <p>
              L'éditeur se réserve le droit de modifier les présentes CGV à
              tout moment. Les CGV applicables sont celles en vigueur à la date
              de la commande, archivées par l'éditeur.
            </p>
          </section>

          <section id="mediation" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              15. Médiation de la consommation
            </h2>
            <p>
              Conformément aux articles L611-1 et suivants du Code de la
              consommation, le client consommateur a le droit de recourir
              gratuitement à un médiateur de la consommation en vue de la
              résolution amiable d'un litige l'opposant à l'éditeur, après
              avoir tenté au préalable de résoudre le litige directement par
              une réclamation écrite auprès du service client.
            </p>
            <p>
              Les coordonnées du médiateur de la consommation compétent sont
              communiquées sur demande à l'adresse de contact figurant dans les
              Mentions légales.
            </p>
            <p>
              Le client peut également recourir à la plateforme européenne de
              Règlement en Ligne des Litiges (RLL) accessible à l'adresse :{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              .
            </p>
          </section>

          <section id="contact-support" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              16. Contact & support
            </h2>
            <p>
              Pour toute question relative à ta commande, à un{" "}
              <strong>problème de paiement</strong> (échec de transaction,
              double débit, accès non activé après paiement) ou à une{" "}
              <strong>demande au titre des garanties légales</strong> (article
              9), tu peux contacter le service client :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                par e-mail :{" "}
                <a
                  href="mailto:contact@digitalmamanlibre.com"
                  className="underline hover:text-primary"
                >
                  contact@digitalmamanlibre.com
                </a>
              </li>
              <li>
                délai de réponse indicatif : sous{" "}
                <strong>5 jours ouvrés</strong>.
              </li>
            </ul>
            <p>
              Pour un traitement rapide, merci d'indiquer dans ton message :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>l'adresse e-mail utilisée lors de la commande ;</li>
              <li>la date et le montant du paiement ;</li>
              <li>
                la référence de transaction Mollie (visible sur l'e-mail de
                confirmation ou sur le relevé bancaire) ;
              </li>
              <li>une description précise du problème rencontré.</li>
            </ul>
            <p>
              <strong>Demande de remboursement.</strong> Conformément à
              l'article 9, aucun remboursement à titre commercial n'est accordé
              après activation de l'accès au Service. Toute demande fondée sur
              les garanties légales (défaut de conformité, vice caché) ou sur
              un dysfonctionnement technique avéré sera néanmoins examinée. En
              cas d'éligibilité, le remboursement est effectué sur le moyen de
              paiement utilisé lors de la commande, sous un délai maximum de{" "}
              <strong>14 jours</strong> à compter de l'accord du service
              client.
            </p>
          </section>

          <section id="droit-juridiction" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              17. Droit applicable et juridiction compétente
            </h2>
            <p>
              Les présentes CGV sont soumises au <strong>droit français</strong>.
              En cas de litige, les parties s'efforceront de trouver une
              solution amiable avant toute action judiciaire.
            </p>
            <p>
              À défaut de résolution amiable, et conformément à l'article{" "}
              <strong>R. 631-3</strong> du Code de la consommation, le client
              consommateur pourra saisir, à son choix, outre l'une des
              juridictions territorialement compétentes en vertu du Code de
              procédure civile, la juridiction du lieu où il demeurait au
              moment de la conclusion du contrat ou de la survenance du fait
              dommageable.
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
  </div>
);

export default CGV;
