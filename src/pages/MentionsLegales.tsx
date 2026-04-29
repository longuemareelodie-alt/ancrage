import SectionBlock from "@/components/SectionBlock";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "react-router-dom";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <Breadcrumb items={[{ label: "Mentions légales" }]} />
    <SectionBlock>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
          Mentions légales
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>

        <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Éditeur du site</h2>
            <p>
              Le site et l'application <strong>Digital Maman Libre</strong>{" "}
              (ci-après « le Service »), accessibles depuis les domaines
              digitalmamanlibre.com et ancrage.lovable.app, sont édités par :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Raison sociale : Digital Maman Libre</li>
              <li>Forme juridique : Micro-entreprise</li>
              <li>SIREN : 829 977 958</li>
              <li>SIRET : 829 977 958 00018</li>
              <li>Adresse du siège : 17 rue André Maurois, 76150 Maromme, France</li>
              <li>TVA non applicable, art. 293 B du CGI</li>
              <li>
                E-mail :{" "}
                <a
                  href="mailto:contact@digitalmamanlibre.com"
                  className="underline hover:text-primary"
                >
                  contact@digitalmamanlibre.com
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Directrice de la publication</h2>
            <p>
              La directrice de la publication est{" "}
              <strong>Mauger-Longuemare Élodie</strong>, représentante légale de
              Digital Maman Libre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Hébergement</h2>
            <p>
              Le Service est hébergé par <strong>Supabase / Lovable</strong>.
              Les coordonnées complètes de l'hébergeur peuvent être communiquées
              sur simple demande à l'adresse de contact ci-dessus.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus du Service (textes, visuels, parcours,
              code, marques, logos) est protégé par le droit de la propriété
              intellectuelle. Toute reproduction, diffusion, revente ou
              exploitation non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Données personnelles</h2>
            <p>
              Les modalités de traitement des données personnelles sont
              détaillées dans la{" "}
              <Link to="/confidentialite" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Conditions de vente</h2>
            <p>
              Les conditions applicables à toute commande sur le Service sont
              définies dans les{" "}
              <Link to="/cgv" className="underline hover:text-primary">
                Conditions générales de vente
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
            <p>
              Pour toute question, tu peux écrire à{" "}
              <a
                href="mailto:contact@digitalmamanlibre.com"
                className="underline hover:text-primary"
              >
                contact@digitalmamanlibre.com
              </a>
              . Délai de réponse indicatif : sous{" "}
              <strong>5 jours ouvrés</strong>.
            </p>
          </section>
        </div>
      </div>
    </SectionBlock>
    <Footer />
  </div>
);

export default MentionsLegales;
