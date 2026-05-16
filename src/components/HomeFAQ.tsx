import SectionBlock from "@/components/SectionBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

const ITEM_KEYS = [
  "free",
  "what_is",
  "price",
  "subscription",
  "medical",
  "privacy",
  "duration",
  "devices",
  "refund",
] as const;

const HomeFAQ = () => {
  const { t } = useTranslation();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ITEM_KEYS.map((k) => ({
      "@type": "Question",
      name: t(`faq.items.${k}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.items.${k}.a`),
      },
    })),
  };

  return (
    <SectionBlock>
      <div id="faq" className="space-y-6 scroll-mt-20">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold md:text-2xl">{t("faq.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("faq.intro")}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {ITEM_KEYS.map((k, i) => (
            <AccordionItem key={k} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold md:text-base">
                {t(`faq.items.${k}.q`)}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
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
