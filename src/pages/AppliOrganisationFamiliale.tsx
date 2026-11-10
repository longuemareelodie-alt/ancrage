import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  ListChecks,
  NotebookPen,
  PiggyBank,
  ShoppingCart,
  Smile,
} from "lucide-react";

import Footer from "@/components/Footer";
import Nav from "@/components/landing/v5/Nav";
import MobileStickyCTA from "@/components/landing/v3/MobileStickyCTA";
import { Final, PillCTA, Prix } from "@/components/landing/v5/Sections";
import { Phone, ScreenDump, ScreenToday } from "@/components/landing/v5/Phone";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { track } from "@/lib/landingAnalytics";
import { usePageMeta } from "@/lib/usePageMeta";

/**
 * Page publique ciblant la recherche « appli organisation familiale ».
 * Ne décrit que des fonctions réellement présentes dans Éclosia.
 */

const TITLE = "Appli organisation familiale pour mamans — Éclosia";
const DESCRIPTION =
  "Éclosia, l'appli d'organisation familiale : agenda, tâches, courses, budget mois par mois, santé des enfants. Une seule prochaine action à la fois. Paiement unique.";
const PATH = "/appli-organisation-familiale";

const FAQ = [
  {
    q: "Qu'est-ce qu'une appli d'organisation familiale ?",
    a: "C'est une appli qui rassemble tout ce qui fait tourner la maison : agenda, choses à faire, courses, budget, rendez-vous des enfants. Avec Éclosia, tout est au même endroit et tu n'as qu'une seule chose à regarder : ta prochaine action.",
  },
  {
    q: "Éclosia est-elle un abonnement ?",
    a: "Non. Tu paies une seule fois et l'appli est à toi à vie. Pas de prélèvement chaque mois.",
  },
  {
    q: "Ça marche sur mon téléphone ?",
    a: "Oui. Éclosia s'ouvre dans ton navigateur et s'installe sur l'écran d'accueil de ton téléphone, comme une appli.",
  },
  {
    q: "Est-ce qu'il y a de l'intelligence artificielle ?",
    a: "Non. Éclosia trie avec des règles simples et prévisibles. C'est toi qui décides, toujours.",
  },
  {
    q: "Qui peut voir les informations de ma famille ?",
    a: "Toi seule. Chaque compte est séparé : personne d'autre n'a accès à tes listes, ton budget ou les fiches de tes enfants.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Éclosia", item: "https://digitalmamanlibre.com/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Appli organisation familiale",
          item: `https://digitalmamanlibre.com${PATH}`,
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "Éclosia",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web, iOS, Android",
      inLanguage: "fr",
      url: `https://digitalmamanlibre.com${PATH}`,
      description: DESCRIPTION,
    },
  ],
};

const OUTILS = [
  { icon: CalendarDays, title: "Agenda familial", text: "Les rendez-vous, l'école, les activités. Tout le monde au même endroit." },
  { icon: ListChecks, title: "Choses à faire", text: "Ce qui doit être fait, sans que ça tourne dans ta tête toute la journée." },
  { icon: ShoppingCart, title: "Liste de courses", text: "Tu ajoutes au fil de l'eau, tu coches au magasin." },
  { icon: PiggyBank, title: "Budget mois par mois", text: "Revenus, dépenses fixes, factures payées. Tu reprends le mois d'avant en un geste." },
  { icon: HeartPulse, title: "Santé de la famille", text: "Rendez-vous médicaux, traitements, fiche d'urgence par QR code." },
  { icon: Smile, title: "Une fiche par enfant", text: "Ses besoins, ses routines en pictogrammes, ses situations, son évolution." },
  { icon: NotebookPen, title: "Notes", text: "Les codes, les idées, les infos qu'on cherche toujours au mauvais moment." },
  { icon: ClipboardList, title: "Vider ma tête", text: "Tu écris ou tu dictes tout en vrac. Éclosia range dans le bon espace." },
];

const DIFF = [
  { title: "Une seule action à la fois", text: "Pas un tableau de 40 tâches. Tu dis comment va ta tête, Éclosia te montre une seule chose à faire, à ta mesure." },
  { title: "Paiement unique", text: "Pas d'abonnement qui s'ajoute aux autres. Tu paies une fois, c'est à toi." },
  { title: "Sans IA", text: "Des règles simples et claires. Rien n'est décidé à ta place." },
  { title: "Tes données restent chez toi", text: "Chaque compte est séparé. Ta famille reste ta famille." },
];

const Kicker = ({ children }: { children: React.ReactNode }) => (
  <p className="font-wide text-[12px] font-bold uppercase tracking-[0.2em] text-primary">{children}</p>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-3 font-wide text-[clamp(1.6rem,4.6vw,2.8rem)] font-bold uppercase leading-[1.02]">
    {children}
  </h2>
);

const AppliOrganisationFamiliale = () => {
  const { startPayment, loading } = useMolliePayment();
  const onCTA = (promoCode?: unknown) =>
    startPayment({ promoCode: typeof promoCode === "string" ? promoCode : null });

  usePageMeta({ title: TITLE, description: DESCRIPTION, path: PATH, jsonLd: JSON_LD });

  useEffect(() => {
    track("landing_view", { page: "organisation-familiale" });
  }, []);

  return (
    <div className="bg-landing min-h-screen overflow-x-clip text-night-foreground">
      <Nav onCTA={onCTA} loading={loading} />
      <main className="pb-14 md:pb-0">
        {/* En-tête */}
        <section className="px-5 pt-28 md:pt-36">
          <div className="mx-auto max-w-[1000px] text-center">
            <h1 className="font-wide text-[clamp(1.8rem,7vw,3.8rem)] font-bold uppercase leading-[0.98] tracking-[-0.01em]">
              <span className="mb-4 block font-sans text-[12px] font-semibold leading-normal tracking-[0.2em] text-night-foreground/70 md:text-[13px]">
                L'appli d'organisation familiale pour mamans
              </span>
              <span className="block">Toute la famille dans une appli.</span>
              <span className="block text-primary">Une seule chose à faire.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-night-foreground/75 md:text-[18px]">
              Agenda, courses, budget, rendez-vous des enfants : Éclosia range tout au même endroit et te montre{" "}
              <strong className="font-semibold text-night-foreground">seulement ta prochaine action</strong>.
            </p>
            <div className="mt-8 flex flex-col items-center gap-2.5">
              <PillCTA onCTA={onCTA} loading={loading} from="orga-hero" />
              <p className="text-[13px] text-night-foreground/60">Paiement unique · Sans abonnement</p>
            </div>
          </div>
          <div className="relative mx-auto mt-12 flex h-[420px] max-w-[700px] justify-center overflow-hidden pt-4 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
            <Phone>
              <ScreenToday />
            </Phone>
          </div>
        </section>

        {/* Pourquoi */}
        <section className="px-5 pt-20 md:pt-28">
          <div className="mx-auto max-w-[760px] text-center">
            <Kicker>Pourquoi</Kicker>
            <H2>Pourquoi une appli d'organisation familiale&nbsp;?</H2>
            <p className="mt-5 text-[16px] leading-relaxed text-night-foreground/75">
              Les rendez-vous sur un papier, les courses dans une autre appli, le budget dans un tableau, les infos des
              enfants dans ta tête. Le problème n'est pas de tout faire : c'est de tout retenir. Une appli d'organisation
              familiale met tout au même endroit pour que ta tête puisse enfin se poser.
            </p>
          </div>
        </section>

        {/* Outils */}
        <section className="px-5 pt-20 md:pt-28">
          <div className="mx-auto max-w-[1050px]">
            <div className="text-center">
              <Kicker>Dans Éclosia</Kicker>
              <H2>Toute l'organisation de la famille, au même endroit</H2>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OUTILS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-[1.5rem] border border-night-foreground/15 p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="faq-trigger mt-3 font-sans text-[16px] font-semibold tracking-normal">{title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-night-foreground/70">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Prochaine action */}
        <section className="px-5 pt-20 md:pt-28">
          <div className="mx-auto flex max-w-[1050px] flex-col items-center gap-8 md:flex-row md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <Kicker>La différence</Kicker>
              <H2>Pas une liste de plus. Une seule prochaine action.</H2>
              <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-night-foreground/75 md:mx-0">
                La plupart des applis d'organisation te montrent tout, tout le temps. Éclosia te demande comment va ta tête
                (GO, Moyen, Saturé, KO) et ne sort qu'une chose, à ta mesure. Le reste attend sans te peser.
              </p>
            </div>
            <Phone>
              <ScreenDump />
            </Phone>
          </div>
        </section>

        {/* Pourquoi Éclosia */}
        <section className="px-5 pt-20 md:pt-28">
          <div className="mx-auto max-w-[1050px]">
            <div className="text-center">
              <Kicker>Pour toi</Kicker>
              <H2>Ce qui change des autres applis familiales</H2>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {DIFF.map((d) => (
                <li key={d.title} className="rounded-[1.5rem] border border-night-foreground/15 p-6">
                  <h3 className="faq-trigger font-sans text-[17px] font-semibold tracking-normal">{d.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-night-foreground/70">{d.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Prix onCTA={onCTA} loading={loading} />

        {/* Questions */}
        <section className="px-5 pt-20 md:pt-28">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center font-wide text-[clamp(1.6rem,4.6vw,2.8rem)] font-bold uppercase leading-[1.02]">
              Questions sur l'appli d'organisation familiale
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQ.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`} className="border-night-foreground/15">
                  <AccordionTrigger className="faq-trigger gap-3 py-4 font-sans text-[16px] font-medium text-night-foreground hover:no-underline [&>svg]:shrink-0 [&>svg]:text-night-foreground/60">
                    <span className="block flex-1">{f.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[15px] leading-relaxed text-night-foreground/70">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-8 text-center text-[14px] text-night-foreground/60">
              Découvre aussi{" "}
              <Link to="/" className="font-medium text-night-foreground underline underline-offset-4">
                Éclosia, l'appli pour mamans
              </Link>
              .
            </p>
          </div>
        </section>

        <Final onCTA={onCTA} loading={loading} />
      </main>
      <div className="bg-background text-foreground">
        <Footer />
      </div>
      <MobileStickyCTA onCTA={onCTA} loading={loading} />
    </div>
  );
};

export default AppliOrganisationFamiliale;
