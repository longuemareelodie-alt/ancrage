import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "react-router-dom";

const sections = [
  { id: "editeur", title: "1. Éditeur du site" },
  { id: "directrice-publication", title: "2. Directrice de la publication" },
  { id: "hebergement", title: "3. Hébergement" },
  { id: "propriete-intellectuelle", title: "4. Propriété intellectuelle" },
  { id: "donnees-personnelles", title: "5. Données personnelles" },
  { id: "cookies", title: "6. Cookies" },
  { id: "conditions-vente", title: "7. Conditions de vente" },
  { id: "mediation", title: "8. Médiation de la consommation" },
  { id: "droit-applicable", title: "9. Droit applicable" },
  { id: "contact", title: "10. Contact" },
];

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <Breadcrumb items={[{ label: "Mentions légales" }]} />
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Mentions légales
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
          <section id="editeur" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">1. Éditeur du site</h2>
            <p>
              Le site et l'application <strong>Digital Maman Libre</strong>{" "}
              (ci-après «&nbsp;le Service&nbsp;»), accessibles depuis les
              domaines digitalmamanlibre.com et ancrage.lovable.app, sont
              édités par&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Raison sociale&nbsp;: Digital Maman Libre</li>
              <li>Forme juridique&nbsp;: micro-entreprise</li>
              <li>SIREN&nbsp;: 829&nbsp;977&nbsp;958</li>
              <li>SIRET&nbsp;: 829&nbsp;977&nbsp;958&nbsp;00018</li>
              <li>
                Adresse du siège&nbsp;: 17 rue André Maurois, 76150 Maromme,
                France
              </li>
              <li>TVA non applicable, art. 293&nbsp;B du CGI</li>
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
          </section>

          <section id="directrice-publication" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              2. Directrice de la publication
            </h2>
            <p>
              La directrice de la publication est{" "}
              <strong>Élodie Mauger-Longuemare</strong>, représentante légale
              de Digital Maman Libre.
            </p>
          </section>

          <section id="hebergement" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">3. Hébergement</h2>
            <p>
              Le Service est hébergé par <strong>Supabase Inc.</strong>{" "}
              (970 Toa Payoh North #07-04, Singapour 318992) via la
              plateforme <strong>Lovable</strong> (Lovable AB, Stockholm,
              Suède). Les coordonnées complètes de l'hébergeur peuvent être
              communiquées sur simple demande à l'adresse de contact
              ci-dessus.
            </p>
          </section>

          <section id="propriete-intellectuelle" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              4. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des contenus du Service (textes, visuels, parcours,
              code, marques, logos) est protégé par le droit de la propriété
              intellectuelle. Toute reproduction, représentation, diffusion,
              revente ou exploitation, totale ou partielle, sans autorisation
              écrite préalable de l'éditeur, est strictement interdite et
              constitue une contrefaçon sanctionnée par les articles
              L.&nbsp;335-2 et suivants du Code de la propriété
              intellectuelle.
            </p>
          </section>

          <section id="donnees-personnelles" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              5. Données personnelles
            </h2>
            <p>
              Les traitements de données personnelles mis en œuvre dans le
              cadre du Service sont conformes au Règlement (UE) 2016/679
              (RGPD) et à la loi n°&nbsp;78-17 du 6 janvier 1978 modifiée
              dite «&nbsp;Informatique et Libertés&nbsp;». Les modalités
              détaillées (finalités, base légale, durées de conservation,
              destinataires, droits des personnes) sont précisées dans la{" "}
              <Link
                to="/confidentialite"
                className="underline hover:text-primary"
              >
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
            <p>
              Le Service utilise uniquement des cookies et traceurs{" "}
              <strong>strictement nécessaires</strong> à son fonctionnement
              (authentification, sécurité, préférences d'affichage).
              Conformément à l'article 82 de la loi Informatique et Libertés,
              ces traceurs sont exemptés du recueil du consentement. Aucun
              cookie publicitaire ou de mesure d'audience tierce n'est
              déposé.
            </p>
          </section>

          <section id="conditions-vente" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              7. Conditions de vente
            </h2>
            <p>
              Les conditions applicables à toute commande sur le Service sont
              définies dans les{" "}
              <Link to="/cgv" className="underline hover:text-primary">
                Conditions générales de vente
              </Link>
              .
            </p>
          </section>

          <section id="mediation" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              8. Médiation de la consommation
            </h2>
            <p>
              Conformément aux articles L.&nbsp;611-1 et suivants du Code de
              la consommation, le client consommateur peut recourir
              gratuitement à un médiateur de la consommation en vue de la
              résolution amiable d'un litige, après avoir tenté au préalable
              de le résoudre par une réclamation écrite auprès du service
              client. Les modalités sont précisées à l'article 15 des{" "}
              <Link to="/cgv" className="underline hover:text-primary">
                CGV
              </Link>
              .
            </p>
          </section>

          <section id="droit-applicable" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">
              9. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont soumises au{" "}
              <strong>droit français</strong>. Les modalités de juridiction
              compétente en cas de litige sont précisées à l'article 17 des
              CGV.
            </p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
            <p>
              Pour toute question, vous pouvez écrire à{" "}
              <a
                href="mailto:contact@digitalmamanlibre.com"
                className="underline hover:text-primary"
              >
                contact@digitalmamanlibre.com
              </a>
              . Délai de réponse indicatif&nbsp;: sous{" "}
              <strong>5&nbsp;jours ouvrés</strong>.
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
    <BackToTop />
  </div>
);

export default MentionsLegales;
