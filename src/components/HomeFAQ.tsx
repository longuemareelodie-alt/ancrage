import SectionBlock from "@/components/SectionBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

const ITEM_KEYS = ["who", "medical", "privacy", "refund"] as const;

const EXTRAS = [
  {
    q: "Un accès à vie ?",
    a: "Oui. Tu paies une seule fois, Éclosia reste à toi.",
  },
  {
    q: "Le tarif fondateur ?",
    a: "Il monte par paliers, de 29 € à 97 €. Les places restantes sont affichées en direct.",
  },
  {
    q: "Payer en plusieurs fois ?",
    a: "Oui, avec Klarna quand c'est disponible dans ton pays.",
  },
];

const HomeFAQ = () => {
  const { t } = useTranslation();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ...ITEM_KEYS.map((k) => ({
        "@type": "Question",
        name: t(`faq.items.${k}.q`),
        acceptedAnswer: { "@type": "Answer", text: t(`faq.items.${k}.a`) },
      })),
      ...EXTRAS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ],
  };

  return (
    <SectionBlock>
      <div id="faq" className="mx-auto max-w-2xl space-y-3 scroll-mt-20">
        <h2 className="text-center text-xl font-bold md:text-2xl">{t("faq.title")}</h2>

        <Accordion type="single" collapsible className="w-full">
          {ITEM_KEYS.map((k, i) => (
            <AccordionItem key={k} value={`item-${i}`}>
              <AccordionTrigger className="py-2.5 text-left text-sm font-semibold">
                {t(`faq.items.${k}.q`)}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-muted-foreground">
                {k === "privacy" ? (
                  <Trans
                    i18nKey="faq.items.privacy.a"
                    components={{
                      lnk: <Link to="/confidentialite" className="underline hover:text-primary" />,
                    }}
                  />
                ) : k === "refund" ? (
                  <Trans
                    i18nKey="faq.items.refund.a"
                    components={{
                      lnk: <Link to="/cgv" className="underline hover:text-primary" />,
                    }}
                  />
                ) : (
                  t(`faq.items.${k}.a`)
                )}
              </AccordionContent>
            </AccordionItem>
          ))}

          {EXTRAS.map((item, i) => (
            <AccordionItem key={item.q} value={`extra-${i}`}>
              <AccordionTrigger className="py-2.5 text-left text-sm font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-3 text-sm leading-relaxed text-muted-foreground">
                {item.a}
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

export default HomeFAQ;
