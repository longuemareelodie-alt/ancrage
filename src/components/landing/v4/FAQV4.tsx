import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/landingAnalytics";
import { Band, Eyebrow, H2 } from "./kit";

type Item = { q: string; text: string; a?: React.ReactNode };

const ITEMS: Item[] = [
  {
    q: "Éclosia est pour qui ?",
    text: "Pour les familles dont le quotidien demande beaucoup d'organisation : rendez-vous, suivis, documents, routines. Elle est utile à tous les parents, et particulièrement quand un enfant a des besoins spécifiques.",
  },
  {
    q: "Que se passe-t-il après mon achat ?",
    text: "Tu reçois un e-mail pour créer ton mot de passe, puis tu accèdes immédiatement à Éclosia. Tu ajoutes ta famille, tu réponds à quelques questions, et Éclosia te propose ta première action.",
  },
  {
    q: "Que signifie « accès à vie » ?",
    text: "Tu paies une seule fois, sans abonnement, et tu gardes l'accès à Éclosia ainsi qu'aux mises à jour incluses tant que le service existe.",
  },
  {
    q: "Puis-je utiliser Éclosia sur plusieurs appareils ?",
    text: "Oui. Éclosia fonctionne dans le navigateur sur téléphone, tablette et ordinateur, et peut être installée comme une application. Tu retrouves tes données en te connectant.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    text: "Tes données sont rattachées à ton compte, les échanges passent par une connexion chiffrée et rien n'est vendu. Aucun système n'est infaillible : la politique de confidentialité détaille les mesures en place.",
    a: (
      <>
        Tes données sont rattachées à ton compte, les échanges passent par une
        connexion chiffrée et rien n'est vendu. Aucun système n'est infaillible :{" "}
        <Link to="/confidentialite" className="underline hover:text-foreground">
          la politique de confidentialité
        </Link>{" "}
        détaille les mesures en place.
      </>
    ),
  },
  {
    q: "Puis-je supprimer ou exporter mes données ?",
    text: "Oui. Depuis tes paramètres, tu peux exporter tes données et supprimer ton compte ainsi que les informations associées.",
  },
  {
    q: "Puis-je payer en plusieurs fois avec Klarna ?",
    text: "Oui, si Klarna est disponible pour ta situation : le bouton « Payer en plusieurs fois » demande ton adresse de facturation puis ouvre directement le paiement Klarna.",
  },
  {
    q: "Est-ce une application médicale ?",
    text: "Non. Éclosia n'est pas un dispositif médical et ne remplace ni un médecin, ni un professionnel de santé, ni un suivi médical. Elle aide à organiser et à retrouver des informations.",
  },
  {
    q: "Et le droit de rétractation ?",
    text: "Éclosia est un contenu numérique accessible immédiatement après le paiement. En validant ta commande, tu demandes cette exécution immédiate et tu renonces expressément à ton droit de rétractation : aucun remboursement commercial n'est prévu. Les garanties légales restent dues.",
    a: (
      <>
        Éclosia est un contenu numérique accessible immédiatement après le
        paiement. En validant ta commande, tu demandes cette exécution immédiate
        et tu renonces expressément à ton droit de rétractation : aucun
        remboursement commercial n'est prévu. Les garanties légales restent
        dues —{" "}
        <Link to="/cgv" className="underline hover:text-foreground">
          voir les conditions de vente
        </Link>
        .
      </>
    ),
  },
];

const FAQV4 = () => (
  <Band id="faq" className="bg-card">
    <div className="mx-auto max-w-2xl">
      <Eyebrow>Questions</Eyebrow>
      <H2>Ce qu'on nous demande le plus.</H2>
      <Accordion type="single" collapsible className="mt-4">
        {ITEMS.map((i) => (
          <AccordionItem key={i.q} value={i.q} className="border-border/60">
            <AccordionTrigger
              onClick={() => track("faq_open", { q: i.q })}
              className="gap-3 py-2.5 text-left text-[14.5px] font-medium text-night hover:no-underline"
            >
              <span className="flex-1 text-left [text-align:left]">{i.q}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-2.5 text-[14px] leading-relaxed text-muted-foreground">
              {i.a ?? i.text}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ITEMS.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.text },
          })),
        }),
      }}
    />
  </Band>
);

export default FAQV4;
