import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "react-router-dom";

const sections = [
  { id: "preambule", title: "1. Préambule" },
  { id: "responsable", title: "2. Responsable du traitement" },
  { id: "donnees-collectees", title: "3. Données collectées" },
  { id: "finalites", title: "4. Finalités et bases légales" },
  { id: "destinataires", title: "5. Destinataires et sous-traitants" },
  { id: "transferts", title: "6. Transferts hors UE" },
  { id: "durees", title: "7. Durées de conservation" },
  { id: "securite", title: "8. Sécurité des données" },
  { id: "droits", title: "9. Vos droits" },
  { id: "cookies", title: "10. Cookies et traceurs" },
  { id: "mineurs", title: "11. Mineurs" },
  { id: "modifications", title: "12. Modifications de la politique" },
  { id: "contact", title: "13. Contact et réclamation" },
];

const Confidentialite = () => (
  <div className="min-h-screen bg-background">
    <Breadcrumb items={[{ label: "Politique de confidentialité" }]} />
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Politique de confidentialité
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
          <section id="preambule" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">1. Préambule</h2>
            <p>
              La présente politique décrit la manière dont{" "}
              <strong>Digital Maman Libre</strong> (ci-après «&nbsp;l'Éditeur&nbsp;»)
              collecte, utilise et protège les données personnelles des
              utilisateurs (ci-après «&nbsp;l'Utilisateur&nbsp;» ou
              «&nbsp;vous&nbsp;») dans le cadre du site et de l'application{" "}
              <strong>Digital Maman Libre</strong> (ci-après «&nbsp;le
              Service&nbsp;»). Elle s'inscrit dans le respect du Règlement (UE)
              2016/679 du 27&nbsp;avril 2016 (ci-après «&nbsp;RGPD&nbsp;») et de
              la loi n°&nbsp;78-17 du 6&nbsp;janvier 1978 modifiée dite
              «&nbsp;Informatique et Libertés&nbsp;».
            </p>
          </section>

          <section id="responsable" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              2. Responsable du traitement
            </h2>
            <p>
              Le responsable de traitement est&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Raison sociale&nbsp;: Digital Maman Libre</li>
              <li>Forme juridique&nbsp;: micro-entreprise</li>
              <li>SIRET&nbsp;: 829&nbsp;977&nbsp;958&nbsp;00018</li>
              <li>
                Adresse&nbsp;: 17 rue André Maurois, 76150 Maromme, France
              </li>
              <li>
                Représentante légale&nbsp;: Élodie Mauger-Longuemare
              </li>
              <li>
                E-mail&nbsp;:{" "}
                <a
                  href="mailto:contact@digitalmamanlibre.com"
                  className="underline hover:text-primary"
                >
                  contact@digitalmamanlibre.com
                </a>
              </li>
            </ul>
            <p>
              Compte tenu de sa taille, l'Éditeur n'est pas tenu de désigner
              un délégué à la protection des données (DPO). Toute demande
              relative aux données personnelles peut être adressée
              directement au contact ci-dessus.
            </p>
          </section>

          <section id="donnees-collectees" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              3. Données collectées
            </h2>
            <p>
              Selon votre utilisation du Service, les catégories de données
              suivantes peuvent être collectées&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Données de compte</strong>&nbsp;: adresse e-mail, mot
                de passe (chiffré), date de création, préférences linguistiques
                et d'affichage.
              </li>
              <li>
                <strong>Données d'usage du Service</strong>&nbsp;: check-ins
                émotionnels, notes personnelles, parcours suivis,
                statistiques de progression, badges et streaks.
              </li>
              <li>
                <strong>Données de santé déclaratives</strong> (facultatives,
                saisies par vos soins)&nbsp;: rendez-vous médicaux,
                médicaments, fiche médicale, ressources personnelles.
              </li>
              <li>
                <strong>Données de paiement</strong>&nbsp;: identifiant de
                transaction, statut, montant, dates. Les données bancaires
                (numéro de carte) sont collectées et traitées exclusivement
                par notre prestataire <strong>Mollie B.V.</strong> et ne
                transitent jamais par nos serveurs.
              </li>
              <li>
                <strong>Données techniques</strong>&nbsp;: journaux de
                connexion, identifiants de session, type d'appareil et de
                navigateur, logs d'erreurs (à des fins de sécurité et de
                bon fonctionnement).
              </li>
              <li>
                <strong>Communications</strong>&nbsp;: échanges avec le
                support, retours qualitatifs.
              </li>
            </ul>
          </section>

          <section id="finalites" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              4. Finalités et bases légales
            </h2>
            <p>Les données sont traitées pour les finalités suivantes&nbsp;:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Fourniture du Service</strong> (création de compte,
                authentification, accès aux contenus et parcours)&nbsp;: base
                légale de l'<em>exécution du contrat</em> (art. 6.1.b RGPD).
              </li>
              <li>
                <strong>Gestion des paiements et facturation</strong>&nbsp;:
                exécution du contrat et obligations légales comptables (art.
                6.1.b et 6.1.c RGPD).
              </li>
              <li>
                <strong>Suivi personnel (check-ins, fiche santé, parcours)</strong>
                &nbsp;: exécution du contrat. Les données de santé déclaratives
                ne sont saisies qu'à votre initiative et restent visibles
                uniquement par vous.
              </li>
              <li>
                <strong>Sécurité, prévention de la fraude et logs
                techniques</strong>&nbsp;: <em>intérêt légitime</em> de
                l'Éditeur (art. 6.1.f RGPD).
              </li>
              <li>
                <strong>Réponses aux demandes du support et obligations
                légales</strong>&nbsp;: exécution du contrat et respect
                d'obligations légales (art. 6.1.b et 6.1.c RGPD).
              </li>
              <li>
                <strong>Envoi d'e-mails transactionnels</strong> (confirmation,
                rappels, sécurité du compte)&nbsp;: exécution du contrat.
              </li>
            </ul>
            <p>
              Aucun traitement à des fins de prospection commerciale tierce
              ni de profilage publicitaire n'est mis en œuvre.
            </p>
          </section>

          <section id="destinataires" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              5. Destinataires et sous-traitants
            </h2>
            <p>
              Les données sont destinées exclusivement à l'Éditeur et à ses
              sous-traitants techniques agissant sur instructions documentées,
              dans le cadre d'accords de traitement conformes à l'article
              28&nbsp;du RGPD&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase Inc.</strong> — hébergement de la base de
                données et des fonctions serveur (infrastructure cloud).
              </li>
              <li>
                <strong>Lovable AB</strong> (Suède) — hébergement et
                déploiement de l'application.
              </li>
              <li>
                <strong>Mollie B.V.</strong> (Pays-Bas) — traitement des
                paiements en ligne.
              </li>
              <li>
                <strong>Resend</strong> ou prestataire équivalent — envoi
                des e-mails transactionnels.
              </li>
            </ul>
            <p>
              Aucune donnée n'est cédée, louée ni vendue à des tiers à des
              fins commerciales.
            </p>
          </section>

          <section id="transferts" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              6. Transferts hors UE
            </h2>
            <p>
              Certains sous-traitants peuvent être amenés à traiter des
              données depuis des pays situés hors de l'Union européenne.
              Dans ce cas, l'Éditeur s'assure que des garanties appropriées
              sont mises en place, notamment via les{" "}
              <strong>clauses contractuelles types</strong> de la Commission
              européenne (décision 2021/914), conformément aux articles
              44&nbsp;et suivants du RGPD.
            </p>
          </section>

          <section id="durees" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              7. Durées de conservation
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Compte utilisateur et contenus associés</strong>&nbsp;:
                pendant toute la durée de votre compte, puis suppression dans
                un délai maximum de 30&nbsp;jours après clôture.
              </li>
              <li>
                <strong>Données de facturation</strong>&nbsp;: 10&nbsp;ans
                à compter de l'émission, en application des obligations
                comptables (art. L.&nbsp;123-22 du Code de commerce).
              </li>
              <li>
                <strong>Logs techniques et de sécurité</strong>&nbsp;:
                12&nbsp;mois maximum.
              </li>
              <li>
                <strong>Données de support</strong>&nbsp;: 3&nbsp;ans à
                compter du dernier contact.
              </li>
            </ul>
          </section>

          <section id="securite" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              8. Sécurité des données
            </h2>
            <p>
              L'Éditeur met en œuvre des mesures techniques et
              organisationnelles appropriées pour garantir la sécurité,
              l'intégrité et la confidentialité des données&nbsp;:
              chiffrement TLS des échanges, chiffrement au repos par
              l'hébergeur, hachage des mots de passe, contrôle d'accès
              strict (Row-Level Security), journalisation des opérations
              sensibles et sauvegardes régulières.
            </p>
          </section>

          <section id="droits" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              9. Vos droits
            </h2>
            <p>
              Conformément aux articles 15 à 22&nbsp;du RGPD, vous disposez
              des droits suivants&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>droit d'<strong>accès</strong> à vos données&nbsp;;</li>
              <li>droit de <strong>rectification</strong>&nbsp;;</li>
              <li>
                droit à l'<strong>effacement</strong> («&nbsp;droit à
                l'oubli&nbsp;»)&nbsp;;
              </li>
              <li>droit à la <strong>limitation</strong> du traitement&nbsp;;</li>
              <li>droit à la <strong>portabilité</strong>&nbsp;;</li>
              <li>
                droit d'<strong>opposition</strong> aux traitements fondés sur
                l'intérêt légitime&nbsp;;
              </li>
              <li>
                droit de définir des <strong>directives post-mortem</strong>
                &nbsp;relatives à vos données.
              </li>
            </ul>
            <p>
              Ces droits s'exercent depuis votre espace «&nbsp;Profil&nbsp;»
              (export et suppression de compte) ou par e-mail à{" "}
              <a
                href="mailto:contact@digitalmamanlibre.com"
                className="underline hover:text-primary"
              >
                contact@digitalmamanlibre.com
              </a>
              . Une réponse vous sera apportée sous{" "}
              <strong>1&nbsp;mois</strong> maximum. Une preuve d'identité
              pourra vous être demandée en cas de doute raisonnable.
            </p>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              10. Cookies et traceurs
            </h2>
            <p>
              Le Service utilise uniquement des cookies et traceurs{" "}
              <strong>strictement nécessaires</strong> à son fonctionnement
              (authentification, sécurité, préférences d'affichage,
              fonctionnement hors-ligne de la PWA). Conformément à l'article
              82 de la loi Informatique et Libertés, ces traceurs sont
              exemptés du recueil du consentement. Aucun cookie publicitaire
              ni outil de mesure d'audience tiers n'est déposé.
            </p>
          </section>

          <section id="mineurs" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              11. Mineurs
            </h2>
            <p>
              Le Service est destiné à un public majeur. Aucune donnée n'est
              collectée sciemment auprès de mineurs de moins de 15&nbsp;ans
              sans le consentement du titulaire de l'autorité parentale,
              conformément à l'article 7-1 de la loi Informatique et
              Libertés.
            </p>
          </section>

          <section id="modifications" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              12. Modifications de la politique
            </h2>
            <p>
              L'Éditeur se réserve le droit de modifier la présente
              politique à tout moment afin de refléter les évolutions
              légales, réglementaires ou techniques. La version applicable
              est celle en vigueur lors de votre accès au Service. La date
              de dernière mise à jour figure en tête de page.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              13. Contact et réclamation
            </h2>
            <p>
              Pour toute question relative à vos données personnelles, vous
              pouvez écrire à{" "}
              <a
                href="mailto:contact@digitalmamanlibre.com"
                className="underline hover:text-primary"
              >
                contact@digitalmamanlibre.com
              </a>
              .
            </p>
            <p>
              Si vous estimez, après nous avoir contactés, que vos droits ne
              sont pas respectés, vous pouvez introduire une réclamation
              auprès de la <strong>CNIL</strong>&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
              <li>
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  www.cnil.fr
                </a>
              </li>
            </ul>
            <p>
              Voir également les{" "}
              <Link to="/mentions-legales" className="underline hover:text-primary">
                Mentions légales
              </Link>{" "}
              et les{" "}
              <Link to="/cgv" className="underline hover:text-primary">
                Conditions générales de vente
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
    <BackToTop />
  </div>
);

export default Confidentialite;
