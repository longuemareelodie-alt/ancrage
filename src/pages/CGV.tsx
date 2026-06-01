import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "react-router-dom";
import { PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";

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
    <Breadcrumb items={[{ label: "Conditions générales de vente" }]} />
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Conditions Générales de Vente
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Dernière mise à jour&nbsp;: {new Date().toLocaleDateString("fr-FR")}
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
              Les présentes Conditions générales de vente (ci-après «&nbsp;CGV&nbsp;»)
              régissent la vente de l'accès à l'application{" "}
              <strong>Digital Maman Libre</strong> (ci-après «&nbsp;le
              Service&nbsp;»), accessible depuis les domaines
              digitalmamanlibre.com et ancrage.lovable.app. La validation de
              la commande, matérialisée par le clic sur le bouton de paiement
              et la mention d'acceptation associée, vaut acceptation pleine
              et entière des présentes CGV par le client (ci-après «&nbsp;le
              Client&nbsp;»).
            </p>
          </section>

          <section id="editeur-contact" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              2. Éditeur et contact
            </h2>
            <p>
              Le Service est édité par <strong>Digital Maman Libre</strong>,
              micro-entreprise immatriculée sous le SIRET{" "}
              <strong>829&nbsp;977&nbsp;958&nbsp;00018</strong> (SIREN
              829&nbsp;977&nbsp;958), dont le siège social est situé au{" "}
              <strong>17 rue André Maurois, 76150 Maromme, France</strong>.
              TVA non applicable, art. 293&nbsp;B du CGI. Directrice de la
              publication&nbsp;: <strong>Élodie Mauger-Longuemare</strong>.
            </p>
            <p>
              Service client&nbsp;:{" "}
              <a
                href="mailto:contact@digitalmamanlibre.com"
                className="underline hover:text-primary"
              >
                contact@digitalmamanlibre.com
              </a>
              . L'ensemble des informations légales figure également dans les{" "}
              <Link
                to="/mentions-legales"
                className="underline hover:text-primary"
              >
                Mentions légales
              </Link>
              .
            </p>
          </section>

          <section id="description" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              3. Description du Service
            </h2>
            <p>
              Le Service propose des outils numériques d'accompagnement au
              quotidien&nbsp;: suivi émotionnel, parcours guidés, fiches
              pratiques et ressources de soutien. Il s'agit d'un outil de{" "}
              <strong>bien-être</strong> qui{" "}
              <strong>
                ne constitue ni un dispositif médical, ni un diagnostic, ni
                un substitut à un avis professionnel de santé
              </strong>
              . En cas de doute ou de détresse, le Client est invité à
              consulter un professionnel de santé ou à contacter un service
              d'urgence.
            </p>
          </section>

          <section id="capacite-juridique" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              4. Capacité juridique
            </h2>
            <p>
              Le Client déclare être majeur (18&nbsp;ans révolus) et disposer
              de la pleine capacité juridique pour conclure un contrat à
              distance. Le Service n'est pas destiné aux mineurs.
            </p>
          </section>

          <section id="prix" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">5. Prix</h2>
            <p>
              L'accès complet au Service est proposé sous forme d'un{" "}
              <strong>paiement unique de {PREMIUM_PRICE_SHORT} TTC</strong>{" "}
              (toutes taxes comprises, en euros), donnant un accès illimité
              dans le temps aux fonctionnalités payantes existantes au moment
              de l'achat.
              Aucun abonnement n'est souscrit&nbsp;: aucun prélèvement
              récurrent n'est effectué.
            </p>
            <p>
              Les prix sont indiqués TTC sur la page de paiement. L'éditeur
              relève du régime de la franchise en base de TVA, ce qui
              justifie la mention «&nbsp;TVA non applicable, art. 293&nbsp;B
              du CGI&nbsp;». Aucune TVA n'est donc facturée au Client.
            </p>
          </section>

          <section id="modalites-paiement" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              6. Modalités de paiement
            </h2>
            <p>
              Le paiement s'effectue en ligne, en une seule fois, par carte
              bancaire ou par les moyens de paiement proposés par le
              prestataire <strong>Mollie B.V.</strong> La transaction est
              sécurisée et aucune coordonnée bancaire n'est stockée sur les
              serveurs de l'éditeur. La commande est définitivement
              enregistrée après confirmation du paiement par le prestataire.
            </p>
          </section>

          <section id="livraison" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">7. Livraison du contenu numérique — chronologie</h2>
            <p>
              La fourniture du contenu numérique suit une chronologie précise,
              automatisée et horodatée :
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>T0 — Validation de la commande :</strong> sur la page de
                paiement <code>/paywall</code>, le client prend connaissance de
                la mention d'acceptation affichée sous le bouton de paiement
                (reproduite à l'article 8) puis clique sur le bouton{" "}
                <strong>{`« Je veux me sentir mieux — ${PREMIUM_PRICE_SHORT} »`}</strong>. Ce clic
                vaut <strong>acceptation expresse des présentes CGV</strong> et{" "}
                <strong>renonciation expresse au droit de rétractation</strong>.
                Le client est ensuite redirigé vers la page sécurisée du
                prestataire <strong>Mollie</strong> pour finaliser le paiement.
              </li>
              <li>
                <strong>T0 + quelques secondes — Confirmation du paiement :</strong>{" "}
                Mollie horodate la transaction (champ <code>paidAt</code> au
                format ISO 8601 UTC) et notifie l'éditeur du succès du paiement
                via un webhook serveur-à-serveur sécurisé. La requête webhook
                est journalisée côté serveur (date, heure, identifiant de
                transaction Mollie commençant par <code>tr_</code>).
              </li>
              <li>
                <strong>T0 + immédiat — Activation de l'accès :</strong> dès
                réception de la confirmation Mollie, le webhook met à jour le
                profil utilisateur en base de données (<code>is_premium = true</code>,{" "}
                <code>plan_type</code> renseigné). Cette mise à jour est
                horodatée automatiquement par la base de données via le champ{" "}
                <code>updated_at</code>. L'accès aux fonctionnalités payantes
                est <strong>activé immédiatement</strong> sur le compte ayant
                initié la commande.
              </li>
              <li>
                <strong>T0 + immédiat — E-mail de bienvenue premium :</strong>{" "}
                un e-mail transactionnel est envoyé automatiquement à l'adresse
                e-mail du compte, avec une clé d'idempotence basée sur
                l'identifiant de transaction Mollie (<code>welcome-premium-&lt;tr_…&gt;</code>).
                Cet e-mail a pour objet{" "}
                <strong>« Ton accès premium ANCRAGE est activé 💛 »</strong>{" "}
                et confirme l'activation effective du Service ainsi que les
                fonctionnalités débloquées. Il vaut{" "}
                <strong>confirmation de la prise en compte de la commande</strong>{" "}
                et <strong>preuve de l'exécution immédiate du contrat</strong>.
              </li>
            </ol>
            <p>
              <strong>Éléments de preuve conservés.</strong> L'éditeur conserve,
              à des fins probatoires : (i) l'horodatage de la transaction côté
              Mollie et son identifiant <code>tr_…</code>, accessibles depuis
              l'espace marchand Mollie ; (ii) les journaux de la fonction
              webhook (requête entrante, identifiants extraits, mise à jour du
              profil) ; (iii) la date de mise à jour du profil utilisateur
              (<code>updated_at</code>) en base de données ; (iv) la trace
              d'envoi de l'e-mail de bienvenue premium et sa clé d'idempotence.
              Ces éléments sont conservés pendant la durée légale applicable et
              peuvent être communiqués au client sur simple demande à l'adresse
              de contact figurant dans les Mentions légales.
            </p>
          </section>

          <section id="retractation" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              8. Droit de rétractation — renonciation expresse
            </h2>
            <p>
              Conformément à l'article <strong>L221-28 13°</strong> du Code de la
              consommation, le droit de rétractation de 14 jours{" "}
              <strong>ne peut être exercé</strong> pour les contrats de
              fourniture d'un contenu numérique non fourni sur un support
              matériel dont l'exécution a commencé après{" "}
              <strong>accord préalable exprès</strong> du consommateur et{" "}
              <strong>renoncement exprès</strong> à son droit de rétractation.
            </p>
            <p>
              <strong>Recueil du consentement.</strong> Le consentement est
              recueilli sur la page <code>/paywall</code> selon le mécanisme
              dit du <em>« click-wrap »</em> : la mention d'acceptation est
              affichée de manière lisible et permanente directement sous le
              bouton de paiement, dans la formulation suivante (texte affiché
              mot pour mot dans l'application) :
            </p>
            <blockquote className="border-l-2 border-primary/40 pl-4 italic text-foreground/80">
              {`« En cliquant sur "Je veux me sentir mieux — ${PREMIUM_PRICE_SHORT}", j'accepte les
              Conditions générales de vente et reconnais que l'accès au contenu
              numérique débute immédiatement après le paiement, ce qui entraîne
              la renonciation expresse à mon droit de rétractation. »`}
            </blockquote>
            <p>
              Le clic sur le bouton <strong>{`« Je veux me sentir mieux — ${PREMIUM_PRICE_SHORT} »`}</strong>{" "}
              vaut donc, de manière indissociable et simultanée, (i) acceptation
              expresse des présentes CGV, (ii) demande expresse d'exécution
              immédiate du Service après paiement, et (iii) renonciation
              expresse au droit de rétractation de 14 jours prévu aux articles
              L221-18 et suivants du Code de la consommation.
            </p>
            <p>
              <strong>Chronologie probante.</strong> La renonciation expresse au
              droit de rétractation est justifiée par la chronologie décrite à
              l'article 7 :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                la mention d'acceptation est affichée à l'écran et lue par le
                client <strong>avant</strong> son clic sur le bouton de
                paiement (preuve de l'accord préalable exprès et du
                renoncement exprès) ;
              </li>
              <li>
                l'exécution du contrat (mise à jour du profil en{" "}
                <code>is_premium = true</code> et déblocage des fonctionnalités
                payantes) commence <strong>immédiatement</strong> après la
                confirmation du paiement par Mollie, comme l'attestent
                l'horodatage Mollie (<code>paidAt</code>) et l'horodatage de
                mise à jour du profil (<code>updated_at</code>) ;
              </li>
              <li>
                l'e-mail de bienvenue premium, envoyé automatiquement avec une
                clé d'idempotence liée à l'identifiant de transaction Mollie,{" "}
                <strong>matérialise l'activation effective du Service</strong>{" "}
                et constitue, conjointement avec les horodatages serveur et les
                journaux Mollie, la preuve du début d'exécution.
              </li>
            </ul>
            <p>
              En conséquence, dès l'activation de l'accès — laquelle intervient
              immédiatement après la confirmation du paiement par Mollie et est
              attestée par l'e-mail de bienvenue premium —, le client{" "}
              <strong>ne dispose plus du droit de rétractation</strong> et
              aucune demande à ce titre ne pourra être accueillie.
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
            <h2 className="text-lg font-semibold text-foreground">
              10. Compte utilisateur
            </h2>
            <p>
              Le Client est responsable de la confidentialité de ses
              identifiants et de toute activité réalisée depuis son compte.
              Tout usage frauduleux doit être signalé sans délai au service
              client.
            </p>
          </section>

          <section id="propriete-intellectuelle" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              11. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des contenus du Service (textes, visuels, parcours,
              code, marques, logos) est protégé par le droit de la propriété
              intellectuelle, conformément aux articles L.&nbsp;111-1 et
              suivants du Code de la propriété intellectuelle. L'achat
              confère au Client un droit d'usage personnel, non exclusif et
              non transférable, limité à un usage strictement privé. Toute
              reproduction, représentation, diffusion, revente ou
              exploitation non autorisée est strictement interdite et
              constitue une contrefaçon sanctionnée par les articles
              L.&nbsp;335-2 et suivants du même Code.
            </p>
          </section>

          <section id="responsabilite" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              12. Responsabilité
            </h2>
            <p>
              Le Service est fourni dans la limite des moyens techniques
              raisonnables. L'éditeur ne saurait être tenu responsable des
              décisions prises par le Client sur la base des contenus
              proposés, ni des indisponibilités ponctuelles liées à des
              opérations de maintenance ou à des causes extérieures (force
              majeure, défaillance d'un tiers, du réseau Internet, etc.). La
              responsabilité de l'éditeur ne pourra, en tout état de cause,
              excéder le montant payé par le Client au titre du Service.
            </p>
          </section>

          <section id="donnees-personnelles" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              13. Données personnelles
            </h2>
            <p>
              Les traitements de données personnelles mis en œuvre dans le
              cadre du Service sont conformes au Règlement (UE) 2016/679
              (RGPD) et à la loi n°&nbsp;78-17 du 6 janvier 1978 modifiée
              dite «&nbsp;Informatique et Libertés&nbsp;». Le Client dispose
              des droits d'accès, de rectification, d'effacement, de
              limitation, d'opposition et de portabilité, qu'il peut exercer
              dans les conditions précisées dans la{" "}
              <Link
                to="/confidentialite"
                className="underline hover:text-primary"
              >
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section id="modification-cgv" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              14. Modification des CGV
            </h2>
            <p>
              L'éditeur se réserve le droit de modifier les présentes CGV à
              tout moment. Les CGV applicables à une commande sont celles en
              vigueur à la date de sa validation, archivées par l'éditeur.
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
              16. Contact &amp; support
            </h2>
            <p>
              Pour toute question relative à une commande, à un{" "}
              <strong>problème de paiement</strong> (échec de transaction,
              double débit, accès non activé après paiement) ou à une{" "}
              <strong>demande au titre des garanties légales</strong>{" "}
              (article&nbsp;9), le Client peut contacter le service client&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                par e-mail&nbsp;:{" "}
                <a
                  href="mailto:contact@digitalmamanlibre.com"
                  className="underline hover:text-primary"
                >
                  contact@digitalmamanlibre.com
                </a>
                &nbsp;;
              </li>
              <li>
                délai de réponse indicatif&nbsp;: sous{" "}
                <strong>5&nbsp;jours ouvrés</strong>.
              </li>
            </ul>
            <p>
              Pour un traitement rapide, il est recommandé d'indiquer dans
              le message&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>l'adresse e-mail utilisée lors de la commande&nbsp;;</li>
              <li>la date et le montant du paiement&nbsp;;</li>
              <li>
                la référence de transaction Mollie (visible sur l'e-mail de
                confirmation ou sur le relevé bancaire)&nbsp;;
              </li>
              <li>une description précise du problème rencontré.</li>
            </ul>
            <p>
              <strong>Demande de remboursement.</strong> Conformément à
              l'article&nbsp;9, aucun remboursement à titre commercial n'est
              accordé après activation de l'accès au Service. Toute demande
              fondée sur les garanties légales (défaut de conformité, vice
              caché) ou sur un dysfonctionnement technique avéré sera
              néanmoins examinée. En cas d'éligibilité, le remboursement est
              effectué sur le moyen de paiement utilisé lors de la commande,
              sous un délai maximum de <strong>14&nbsp;jours</strong> à
              compter de l'accord du service client.
            </p>
          </section>

          <section id="droit-juridiction" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              17. Droit applicable et juridiction compétente
            </h2>
            <p>
              Les présentes CGV sont soumises au <strong>droit français</strong>.
            </p>
            <p>
              <strong>Résolution amiable.</strong> En cas de litige, les
              parties pourront rechercher une solution amiable, notamment par
              le recours à la médiation de la consommation prévue à l'article
              15. Cette démarche est <strong>facultative</strong> et{" "}
              <strong>
                sans préjudice du droit du client consommateur de saisir
                directement la juridiction compétente
              </strong>{" "}
              à tout moment.
            </p>
            <p>
              <strong>Juridiction compétente.</strong> Conformément à l'article{" "}
              <strong>R. 631-3</strong> du Code de la consommation, le client
              consommateur peut saisir, <strong>à son choix</strong>, outre
              l'une des juridictions territorialement compétentes en
              application du Code de procédure civile (notamment la juridiction
              du lieu où demeure le défendeur, art. 42 CPC, ou celle du lieu
              de l'exécution de la prestation de service, art. 46 CPC) :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                la juridiction du lieu où il <strong>demeurait au moment de
                la conclusion du contrat</strong> ;
              </li>
              <li>
                ou la juridiction du lieu de la{" "}
                <strong>survenance du fait dommageable</strong>.
              </li>
            </ul>
            <p>
              Aucune clause des présentes CGV ne saurait être interprétée
              comme limitant ce choix ou comme imposant la compétence
              exclusive d'une juridiction au consommateur.
            </p>
            <p>
              <strong>Litiges transfrontaliers.</strong> Si le client
              consommateur réside dans un autre État membre de l'Union
              européenne, il conserve par ailleurs le bénéfice des règles de
              compétence prévues par le Règlement (UE) n° 1215/2012 du 12
              décembre 2012 (« Bruxelles I bis »), notamment la faculté de
              saisir les juridictions de l'État membre de son domicile (art.
              18 du Règlement).
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
    <BackToTop />
  </div>
);

export default CGV;
