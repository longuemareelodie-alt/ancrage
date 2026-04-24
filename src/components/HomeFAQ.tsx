import SectionBlock from "@/components/SectionBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "Ancrage, c'est quoi exactement ?",
    a: "Un outil de bien-être pensé pour t'aider à faire redescendre ton corps quand ton système nerveux est en alerte. Pas une thérapie, pas un diagnostic : des actions simples, courtes, à faire seule, à ton rythme.",
  },
  {
    q: "C'est gratuit ou payant ?",
    a: "Tu peux essayer gratuitement les écrans émotion et le rituel de base, sans créer de compte. L'accès complet (parcours guidé, espace santé, bouton urgence, ressources, notes privées) est à 39€ en paiement unique, sans abonnement, sans prélèvement récurrent.",
  },
  {
    q: "Est-ce que c'est un abonnement ?",
    a: "Non. C'est un paiement unique de 39€ qui te donne accès à vie aux fonctionnalités payantes existantes au moment de l'achat. Aucune carte n'est conservée, aucun prélèvement n'est programmé.",
  },
  {
    q: "Est-ce que ça remplace un suivi médical ou un thérapeute ?",
    a: "Non, jamais. Ancrage est un outil de bien-être : il ne pose pas de diagnostic et ne remplace pas un professionnel de santé. Si tu traverses une période difficile ou ressens une détresse, parles-en à un médecin, un psychologue, ou contacte les services d'urgence.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: (
      <>
        Oui. Tes notes, tes états émotionnels et tes informations de santé sont
        stockés de façon sécurisée et restent strictement les tiens. Tu peux
        les exporter ou tout supprimer à tout moment depuis ton profil. Détails
        complets dans la{" "}
        <Link to="/confidentialite" className="underline hover:text-primary">
          Politique de confidentialité
        </Link>
        .
      </>
    ),
  },
  {
    q: "Combien de temps faut-il par jour ?",
    a: "Quelques minutes suffisent. La plupart des actions durent entre 1 et 5 minutes. L'idée n'est pas d'ajouter une charge mentale supplémentaire, mais de t'offrir un point d'appui rapide quand tu en as besoin.",
  },
  {
    q: "Sur quels appareils ça marche ?",
    a: "Sur n'importe quel téléphone, tablette ou ordinateur récent, directement depuis ton navigateur. Aucune installation. Tu peux aussi ajouter Ancrage à ton écran d'accueil pour y accéder comme une app.",
  },
  {
    q: "Puis-je être remboursée ?",
    a: (
      <>
        L'accès au contenu numérique étant immédiat après le paiement, tu
        renonces expressément à ton droit de rétractation au moment du clic
        (article L221-28 13° du Code de la consommation). Aucun remboursement
        commercial n'est donc possible après activation de l'accès. Tu
        bénéficies en revanche des garanties légales. Détails dans les{" "}
        <Link to="/cgv" className="underline hover:text-primary">
          Conditions générales de vente
        </Link>
        .
      </>
    ),
  },
];

const HomeFAQ = () => {
  // JSON-LD FAQPage : on ne sérialise que le texte (pas les éléments React)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof f.a === "string" ? f.a : extractText(f.a),
      },
    })),
  };

  return (
    <SectionBlock>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold md:text-2xl">Questions fréquentes</h2>
          <p className="text-sm text-muted-foreground">
            Avant de commencer, voici les réponses aux questions qu'on me pose
            le plus souvent.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold md:text-base">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </SectionBlock>
  );
};

// Helper : extrait le texte brut d'un noeud React simple (pour le JSON-LD SEO)
function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in (node as object)) {
    return extractText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export default HomeFAQ;
