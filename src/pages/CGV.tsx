import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const CGV = () => (
  <div className="min-h-screen bg-background">
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Conditions Générales de Vente
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (« CGV ») régissent la vente
              de l'accès à l'application <strong>Digital Maman Libre</strong>
              (ci-après « le Service »), accessible depuis les domaines
              digitalmamanlibre.com et ancrage.lovable.app. Toute commande implique
              l'acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Éditeur</h2>
            <p>
              Le Service est édité par Digital Maman Libre. Pour toute information
              légale détaillée, se reporter aux{" "}
              <Link to="/mentions-legales" className="underline hover:text-primary">
                Mentions légales
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Description du Service</h2>
            <p>
              Le Service propose des outils numériques d'accompagnement pour mamans :
              suivi émotionnel, parcours guidés, fiches santé et ressources de
              soutien. Il s'agit d'un outil de bien-être et <strong>en aucun cas
              d'un dispositif médical</strong> ni d'un substitut à un avis
              professionnel de santé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Prix et modalités de paiement</h2>
            <p>
              L'accès complet au Service est proposé sous forme d'un{" "}
              <strong>paiement unique de 39 € TTC</strong>, donnant un accès illimité
              dans le temps aux fonctionnalités payantes existantes au moment de
              l'achat. Aucun abonnement récurrent n'est mis en place : aucun
              prélèvement automatique ne sera effectué.
            </p>
            <p>
              Les paiements sont traités de manière sécurisée par notre prestataire
              <strong> Mollie</strong>. Aucune coordonnée bancaire n'est stockée sur
              nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Livraison</h2>
            <p>
              L'accès aux fonctionnalités payantes est activé{" "}
              <strong>immédiatement</strong> après confirmation du paiement, sur le
              compte utilisateur ayant initié la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Droit de rétractation</h2>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le client
              reconnaît expressément que la fourniture du Service débute dès la
              validation du paiement et <strong>renonce à son droit de rétractation</strong>{" "}
              de 14 jours dès lors qu'il accède au contenu numérique immédiatement
              après l'achat.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Remboursement</h2>
            <p>
              En cas de dysfonctionnement avéré rendant le Service inutilisable et
              non résolu sous un délai raisonnable, une demande de remboursement
              peut être adressée à l'adresse de contact indiquée dans les Mentions
              légales, dans les 14 jours suivant l'achat.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Compte utilisateur</h2>
            <p>
              Le client est responsable de la confidentialité de ses identifiants
              et de toute activité réalisée depuis son compte. Tout usage frauduleux
              doit être signalé sans délai.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus (textes, visuels, parcours, code) est protégé
              par le droit d'auteur. Toute reproduction, diffusion ou exploitation
              non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Responsabilité</h2>
            <p>
              Le Service est fourni « en l'état ». L'éditeur ne saurait être tenu
              responsable des décisions prises par l'utilisateur sur la base des
              contenus proposés. En cas de détresse, l'utilisateur est invité à
              contacter un professionnel de santé ou un service d'urgence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Données personnelles</h2>
            <p>
              Le traitement des données personnelles est détaillé dans la{" "}
              <Link to="/confidentialite" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Droit applicable et litiges</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige,
              une solution amiable sera recherchée avant toute action judiciaire.
              À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
  </div>
);

export default CGV;
