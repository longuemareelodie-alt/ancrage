import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import { track } from "@/lib/landingAnalytics";

type Item = { q: string; a: React.ReactNode; text: string };

const ITEMS: Item[] = [
  {
    q: "À qui s'adresse Éclosia ?",
    text: "Aux familles dont le quotidien demande beaucoup d'organisation : rendez-vous, suivis, documents, routines. Elle est utile à tous les parents, et particulièrement quand un enfant a des besoins spécifiques.",
    a: "Aux familles dont le quotidien demande beaucoup d'organisation : rendez-vous, suivis, documents, routines. Elle est utile à tous les parents, et particulièrement quand un enfant a des besoins spécifiques.",
  },
  {
    q: "Est-ce une application médicale ?",
    text: "Non. Éclosia n'est pas un dispositif médical et ne remplace ni un médecin, ni un professionnel de santé, ni un accompagnement psychologique ou juridique. Elle aide à organiser et à retrouver des informations.",
    a: "Non. Éclosia n'est pas un dispositif médical et ne remplace ni un médecin, ni un professionnel de santé, ni un accompagnement psychologique ou juridique. Elle aide à organiser et à retrouver des informations.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    text: "Tes données sont rattachées à ton compte, les échanges passent par une connexion chiffrée et rien n'est vendu à des fins commerciales. Aucun système n'est infaillible : la politique de confidentialité détaille les mesures en place.",
    a: (
      <>
        Tes données sont rattachées à ton compte, les échanges passent par une
        connexion chiffrée et rien n'est vendu à des fins commerciales. Aucun
        système n'est infaillible :{" "}
        <Link to="/confidentialite" className="underline hover:text-primary">
          la politique de confidentialité
        </Link>{" "}
        détaille les mesures en place.
      </>
    ),
  },
  {
    q: "Quelles données puis-je enregistrer ?",
    text: "Rendez-vous, tâches, courses, notes, traitements et informations de santé déclaratives, documents, journal personnel, supports créés pour ton enfant. Tu choisis ce que tu saisis.",
    a: "Rendez-vous, tâches, courses, notes, traitements et informations de santé déclaratives, documents, journal personnel, supports créés pour ton enfant. Tu choisis ce que tu saisis.",
  },
  {
    q: "Puis-je utiliser Éclosia sur plusieurs appareils ?",
    text: "Oui. Éclosia fonctionne dans le navigateur, sur téléphone, tablette et ordinateur, et peut être installée comme une application depuis ton téléphone. Tu retrouves tes données en te connectant.",
    a: "Oui. Éclosia fonctionne dans le navigateur, sur téléphone, tablette et ordinateur, et peut être installée comme une application depuis ton téléphone. Tu retrouves tes données en te connectant.",
  },
  {
    q: "Combien coûte Éclosia ?",
    text: "Le prix public est de 97 €, en paiement unique, sans abonnement. Les premières familles bénéficient d'un tarif fondateur évolutif, affiché en direct sur cette page.",
    a: "Le prix public est de 97 €, en paiement unique, sans abonnement. Les premières familles bénéficient d'un tarif fondateur évolutif, affiché en direct sur cette page.",
  },
  {
    q: "Pourquoi le prix évolue-t-il ?",
    text: "Parce que les premières familles rejoignent Éclosia au début de son histoire et acceptent d'accompagner son lancement. Le tarif monte ensuite par paliers annoncés à l'avance, jusqu'au prix public.",
    a: "Parce que les premières familles rejoignent Éclosia au début de son histoire et acceptent d'accompagner son lancement. Le tarif monte ensuite par paliers annoncés à l'avance, jusqu'au prix public.",
  },
  {
    q: "Comment fonctionne le tarif fondateur ?",
    text: "Chaque palier comporte un nombre de places défini. Le compteur n'avance qu'avec des paiements réellement validés : quand un palier est complet, le palier suivant s'applique.",
    a: "Chaque palier comporte un nombre de places défini. Le compteur n'avance qu'avec des paiements réellement validés : quand un palier est complet, le palier suivant s'applique.",
  },
  {
    q: "Que signifie accès à vie ?",
    text: "Tu paies une fois et ton accès reste actif, sans abonnement ni renouvellement, pour toute la durée de vie du service.",
    a: "Tu paies une fois et ton accès reste actif, sans abonnement ni renouvellement, pour toute la durée de vie du service.",
  },
  {
    q: "Les mises à jour sont-elles incluses ?",
    text: "Oui. Les améliorations et nouvelles fonctionnalités arrivent automatiquement dans ton espace, sans paiement supplémentaire.",
    a: "Oui. Les améliorations et nouvelles fonctionnalités arrivent automatiquement dans ton espace, sans paiement supplémentaire.",
  },
  {
    q: "Puis-je payer en plusieurs fois ?",
    text: "Oui, avec Klarna lorsque ce moyen de paiement est disponible dans ton pays. Les conditions de Klarna s'appliquent.",
    a: "Oui, avec Klarna lorsque ce moyen de paiement est disponible dans ton pays. Les conditions de Klarna s'appliquent.",
  },
  {
    q: "Puis-je demander un remboursement ?",
    text: "L'accès étant fourni immédiatement après le paiement, tu renonces expressément au droit de rétractation lors de la commande : aucun remboursement commercial n'est prévu. Les garanties légales restent applicables et toute demande est examinée. Les conditions exactes figurent dans les CGV.",
    a: (
      <>
        L'accès étant fourni immédiatement après le paiement, tu renonces
        expressément au droit de rétractation lors de la commande : aucun
        remboursement commercial n'est prévu. Les garanties légales restent
        applicables et toute demande est examinée. Les conditions exactes
        figurent dans{" "}
        <Link to="/cgv" className="underline hover:text-primary">
          les CGV
        </Link>
        .
      </>
    ),
  },
  {
    q: "Puis-je supprimer mes données ?",
    text: "Oui. Tu peux supprimer tes contenus à tout moment et demander la suppression de ton compte et des données associées depuis ton profil.",
    a: "Oui. Tu peux supprimer tes contenus à tout moment et demander la suppression de ton compte et des données associées depuis ton profil.",
  },
  {
    q: "Puis-je partager certaines informations avec un proche ?",
    text: "Oui. Tu peux inviter un proche et choisir ce que tu partages, pour que plusieurs adultes puissent suivre le quotidien. Ton journal personnel reste privé.",
    a: "Oui. Tu peux inviter un proche et choisir ce que tu partages, pour que plusieurs adultes puissent suivre le quotidien. Ton journal personnel reste privé.",
  },
  {
    q: "Éclosia fonctionne-t-elle pour une famille sans enfant neuroatypique ?",
    text: "Oui. L'agenda, les documents, la santé, les courses et l'organisation familiale servent à toutes les familles. Les outils d'accompagnement sont là si tu en as besoin, sans être imposés.",
    a: "Oui. L'agenda, les documents, la santé, les courses et l'organisation familiale servent à toutes les familles. Les outils d'accompagnement sont là si tu en as besoin, sans être imposés.",
  },
];

const FAQV3 = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ITEMS.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.text },
    })),
  };

  return (
    <Section id="faq" className="bg-card">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl">
        <div className="text-center">
          <Eyebrow>Questions</Eyebrow>
          <SectionTitle>
            Tout ce qu'on
            <br />
            <span className="italic text-primary-dark">nous demande.</span>
          </SectionTitle>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-7 w-full"
          onValueChange={(v) => v && track("faq_open", { question: v })}
        >
          {ITEMS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="py-3 text-left text-[14.5px] font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-[14px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Section>
  );
};

export default FAQV3;
