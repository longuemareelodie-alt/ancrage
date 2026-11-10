import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import KlarnaPayButton from "@/components/KlarnaPayButton";
import { FOUNDING_TIERS, getFoundingTier } from "@/lib/foundingFamilies";
import { formatEurAmount } from "@/lib/premiumOffer";
import { track, useSectionView } from "@/lib/landingAnalytics";
import famille from "@/assets/famille/IMG_2117.jpg.asset.json";
import fondatriceVideo from "@/assets/video/eclosia-fondatrice-son5.mp4.asset.json";
import { priceLabel, useFoundingOffer } from "../v4/kit";
import { Phone, ScreenBusiness, ScreenChild, ScreenDump, ScreenToday, ScreenTodayKO } from "./Phone";

type CTA = { onCTA: (promoCode?: string) => void; loading: boolean };

/* ---------- Bouton pilule avec le prix collé (signature de la page) ---------- */
export const PillCTA = ({
  onCTA,
  loading,
  from,
  label = "Je commence",
}: CTA & { from: string; label?: string }) => {
  const price = priceLabel(useFoundingOffer());
  return (
    <button
      onClick={() => {
        track("founder_cta_click", { from });
        track("checkout_start", { from });
        onCTA();
      }}
      disabled={loading}
      className="group inline-flex items-center gap-3 rounded-full bg-night-foreground p-1.5 pl-6 text-night shadow-[0_18px_50px_-18px_hsl(var(--primary)/0.6)] transition-transform hover:-translate-y-[1px] disabled:opacity-60"
    >
      <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
      <span className="rounded-full bg-night px-4 py-2.5 text-[14px] font-semibold text-night-foreground">
        {price ? (
          <>
            {price} <span className="text-[12px] font-normal opacity-75">/ à vie</span>
          </>
        ) : (
          "Accès à vie"
        )}
      </span>
    </button>
  );
};

/* ---------- Hero ---------- */
export const Hero = (p: CTA) => (
  <section className="relative px-5 pt-28 md:pt-36">
    <div className="mx-auto max-w-[1200px] text-center">
      <h1 className="font-wide text-[clamp(1.9rem,7.6vw,4.1rem)] font-bold uppercase leading-[0.98] tracking-[-0.01em]">
        <span className="block text-night-foreground">Ta tête est pleine.</span>
        <span className="block text-primary">Éclosia fait le tri.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-night-foreground/75 md:text-[18px]">
        Ta famille, tes enfants, tes rendez-vous, ton business.{" "}
        <strong className="font-semibold text-night-foreground">Une seule prochaine action</strong>, au bon moment.
      </p>
      <div className="mt-8 flex flex-col items-center gap-2.5">
        <PillCTA {...p} from="hero" />
        <p className="text-[13px] text-night-foreground/60">Paiement unique · Sans abonnement</p>
      </div>
    </div>

    <div className="relative mx-auto mt-12 flex h-[430px] max-w-[900px] items-start justify-center overflow-hidden pt-4 [mask-image:linear-gradient(to_bottom,black_75%,transparent)] sm:h-[480px] md:mt-16 md:h-[520px]">
      <Phone className="-mr-16 hidden translate-y-10 -rotate-[8deg] opacity-90 sm:block md:-mr-8">
        <ScreenChild />
      </Phone>
      <Phone className="z-10 translate-y-0">
        <ScreenToday />
      </Phone>
      <Phone className="-ml-16 hidden translate-y-10 rotate-[8deg] opacity-90 sm:block md:-ml-8">
        <ScreenDump />
      </Phone>
    </div>
  </section>
);

/* ---------- Blocs numérotés ---------- */
const FEATURES = [
  {
    n: "01",
    label: "Aujourd'hui",
    title: "Une seule chose à faire.",
    text: "Tu dis comment va ta tête. Éclosia sort une seule prochaine action, à ta mesure. Le reste attend sans te peser.",
    chips: ["GO · Moyen · Saturé · KO", "Reporter", "M'apaiser", "Dictée"],
    screen: <ScreenTodayKO />,
  },
  {
    n: "02",
    label: "Tes enfants",
    title: "L'appli s'adapte à ton enfant.",
    text: "Pictogrammes, photos à lui, questions une par une, lecture à voix haute. Chaque enfant a son profil, ses situations, son évolution.",
    chips: ["Pictogrammes", "Ses photos", "Situations", "Évolution"],
    screen: <ScreenChild />,
  },
  {
    n: "03",
    label: "Vider ma tête",
    title: "Tu déposes. Elle range.",
    text: "Écris ou dicte tout en vrac. Éclosia trie : rendez-vous, tâches, relances, observations sur tes enfants.",
    chips: ["Écrire ou dicter", "Tri en un geste", "M'aide maintenant"],
    screen: <ScreenDump />,
  },
  {
    n: "04",
    label: "Business",
    title: "Ton activité, sans charge mentale.",
    text: "Contacts, relances, clientes, équipe. Les relances du jour remontent toutes seules dans ta prochaine action.",
    chips: ["Pipeline", "Relances", "Clientes", "Équipe"],
    screen: <ScreenBusiness />,
  },
];

const Chip = ({ children }: { children: React.ReactNode }) => (
  <li className="rounded-full border border-night-foreground/20 px-3 py-1 text-[12.5px] text-night-foreground/85">
    {children}
  </li>
);

export const Features = () => (
  <section id="fonctionnalites" className="px-5 pt-24 md:pt-36">
    <div className="mx-auto max-w-[1050px] space-y-20 md:space-y-28">
      {FEATURES.map((f, i) => (
        <article
          key={f.n}
          className={`flex flex-col items-center gap-8 md:flex-row md:gap-16 ${i % 2 ? "md:flex-row-reverse" : ""}`}
        >
          <div className="flex-1 text-center md:text-left">
            <p className="font-wide text-[12px] font-bold uppercase tracking-[0.2em] text-primary">
              {f.n}
              <span className="ml-3 text-night-foreground/60">{f.label}</span>
            </p>
            <h2 className="mt-3 font-wide text-[clamp(1.7rem,4.6vw,3rem)] font-bold uppercase leading-[1.02]">
              {f.title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-night-foreground/75 md:mx-0">
              {f.text}
            </p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {f.chips.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </ul>
          </div>
          <Phone>{f.screen}</Phone>
        </article>
      ))}

      <div className="rounded-[2rem] border border-night-foreground/15 px-6 py-8 text-center">
        <p className="font-wide text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Et aussi</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            "Santé de toute la famille",
            "Fiche d'urgence par QR",
            "Budget mois par mois",
            "Documents rangés",
            "Habitudes",
            "Objectifs",
            "Routines visuelles",
            "Six compagnons",
          ].map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

/* ---------- Mon histoire ---------- */
export const Histoire = () => {
  const [open, setOpen] = useState(false);
  return (
    <section id="fondatrice" className="px-5 pt-24 md:pt-36">
      <div className="mx-auto grid max-w-[1050px] items-center gap-8 md:grid-cols-[1fr_0.85fr] md:gap-14">
        <div className="text-center md:text-left">
          <p className="font-wide text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Mon histoire</p>
          <h2 className="mt-3 font-wide text-[clamp(1.7rem,4.6vw,3rem)] font-bold uppercase leading-[1.02]">
            Pourquoi j'ai créé Éclosia.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-night-foreground/80 md:mx-0">
            Je ne voulais pas créer une application de plus. Je voulais créer
            l'endroit que j'aurais aimé avoir quand tout devenait trop lourd à gérer.
          </p>
          <p className="mt-2 text-[14px] text-night-foreground/55">Élodie — fondatrice d'Éclosia</p>
          {open && (
            <div className="mx-auto mt-4 max-w-md space-y-3 text-[15px] leading-relaxed text-night-foreground/75 md:mx-0">
              <p>
                Je suis maman de trois enfants, et nous sommes cinq enfants à la
                maison. Mes deux grands vivent avec un trouble du spectre
                autistique, une dyspraxie et une ataxie. Ma dernière est
                asthmatique, et une suspicion de trouble du neurodéveloppement
                est en cours.
              </p>
              <p>
                Vous ne verrez pas les visages de mes enfants, et c'est voulu :
                ce sont mes enfants avant d'être une histoire à raconter.
                Éclosia est née de ce réflexe-là — protéger ce qui compte, et
                tout garder au même endroit.
              </p>
            </div>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-4 text-[14px] font-medium text-primary underline underline-offset-4"
          >
            {open ? "Replier" : "Lire mon histoire →"}
          </button>
        </div>
        <div>
          <div className="overflow-hidden rounded-[1.6rem] bg-night-foreground/10 p-1.5 ring-1 ring-night-foreground/15">
            <video
              src={fondatriceVideo.url}
              poster={famille.url}
              controls
              playsInline
              preload="none"
              className="w-full rounded-[1.2rem]"
            />
          </div>
          <p className="mt-2 text-center text-[12.5px] text-night-foreground/55">
            Une minute et demie, avec le son.
          </p>
        </div>
      </div>
    </section>
  );
};

/* ---------- Tarif ---------- */
const AVANTAGES = [
  "Toutes les fonctionnalités",
  "Toutes les mises à jour",
  "Badge Famille Fondatrice",
  "Accès anticipé à certaines nouveautés",
];

export const Prix = ({ onCTA, loading }: CTA) => {
  const [promo, setPromo] = useState("");
  const promoOk = promo.trim().toUpperCase() === "ELO19";
  const offer = useFoundingOffer();
  const price = priceLabel(offer);
  const tier = getFoundingTier(offer?.tierKey);
  const viewRef = useSectionView("pricing_view");

  return (
    <section id="tarif" className="px-5 pt-24 md:pt-36">
      <div ref={viewRef} className="mx-auto max-w-[1050px]">
        <div className="text-center">
          <h2 className="font-wide text-[clamp(1.7rem,4.6vw,3rem)] font-bold uppercase leading-[1.02]">
            Tu paies une fois. <span className="text-primary">C'est tout.</span>
          </h2>
          <ul className="mx-auto mt-6 max-w-lg space-y-2 text-[16px] text-night-foreground/80">
            <li><strong className="text-night-foreground">Un seul paiement :</strong> {price ?? "le tarif fondateur"}</li>
            <li><strong className="text-night-foreground">Accès à vie :</strong> l'appli et ses mises à jour</li>
            <li><strong className="text-night-foreground">Aucun abonnement,</strong> aucune surprise</li>
          </ul>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-[2rem] bg-background p-6 text-center text-foreground shadow-[0_40px_90px_-40px_hsl(var(--primary)/0.55)] md:p-8">
          <p className="font-wide text-[11px] font-bold uppercase tracking-[0.2em] text-primary-dark">
            {tier.emoji} {tier.label}
          </p>
          <p className="mt-3 font-wide text-[clamp(2.6rem,9vw,3.6rem)] font-bold leading-none text-night">
            {promoOk ? "4,50\u00A0€" : price ?? "Accès à vie"}
          </p>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Un seul paiement. Accès à vie.</p>

          <ul className="mx-auto mt-5 grid gap-1.5 text-left">
            {AVANTAGES.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[14.5px] text-foreground/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[12.5px] text-muted-foreground">
            Tarif fondateur évolutif :{" "}
            {FOUNDING_TIERS.map((t) => formatEurAmount(t.priceCents / 100)).join(" → ")}
          </p>

          <label className="mx-auto mt-4 block max-w-xs text-left">
            <span className="text-[12px] text-muted-foreground">Code promo</span>
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Ton code"
              autoComplete="off"
              className="mt-1 w-full rounded-full border border-border bg-card px-4 py-2.5 text-center text-sm uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <button
            onClick={() => {
              track("founder_cta_click", { from: "offre" });
              track("checkout_start", { from: "offre" });
              onCTA(promo.trim() || undefined);
            }}
            disabled={loading}
            className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-night px-6 text-[15px] font-semibold text-night-foreground transition-transform hover:-translate-y-[1px] disabled:opacity-60"
          >
            Je rejoins Éclosia{promoOk ? " — 4,50\u00A0€" : price ? ` — ${price}` : ""}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="mt-3 text-[12px] text-muted-foreground">Paiement sécurisé · Accès immédiat</p>
          <KlarnaPayButton className="mt-3 w-full" />
        </div>
      </div>
    </section>
  );
};

/* ---------- Questions ---------- */
type Item = { q: string; text: string; a?: React.ReactNode };
const ITEMS: Item[] = [
  { q: "C'est pour qui ?", text: "Pour les mamans dont la tête est pleine : famille, rendez-vous, enfants, activité. Particulièrement utile quand un enfant a des besoins spécifiques." },
  { q: "C'est compliqué ?", text: "Non. Quelques questions au début, une par écran, et Éclosia ne te montre que les espaces dont tu as besoin." },
  { q: "Que se passe-t-il après l'achat ?", text: "Tu reçois un e-mail pour créer ton mot de passe, puis tu entres tout de suite dans Éclosia, sur téléphone, tablette ou ordinateur." },
  { q: "« À vie », ça veut dire quoi ?", text: "Tu paies une seule fois, sans abonnement, et tu gardes l'accès et les mises à jour incluses tant que le service existe. Klarna permet de payer en plusieurs fois si c'est disponible pour toi." },
  {
    q: "Mes données sont protégées ?",
    text: "Tes données sont rattachées à ton compte, chiffrées pendant les échanges, et jamais vendues. Aucun système n'est infaillible : la politique de confidentialité détaille les mesures.",
    a: (
      <>
        Tes données sont rattachées à ton compte, chiffrées pendant les échanges,
        et jamais vendues. Aucun système n'est infaillible :{" "}
        <Link to="/confidentialite" className="underline">la politique de confidentialité</Link> détaille les mesures.
      </>
    ),
  },
  { q: "C'est une application médicale ?", text: "Non. Éclosia ne remplace ni un médecin ni un professionnel de santé. Elle t'aide à organiser et à retrouver les informations." },
  {
    q: "Et le droit de rétractation ?",
    text: "Éclosia est accessible immédiatement après le paiement. En validant ta commande, tu renonces expressément à ton droit de rétractation : aucun remboursement commercial n'est prévu. Les garanties légales restent dues.",
    a: (
      <>
        Éclosia est accessible immédiatement après le paiement. En validant ta
        commande, tu renonces expressément à ton droit de rétractation : aucun
        remboursement commercial n'est prévu. Les garanties légales restent dues —{" "}
        <Link to="/cgv" className="underline">voir les conditions de vente</Link>.
      </>
    ),
  },
];

export const Questions = () => (
  <section id="faq" className="px-5 pt-24 md:pt-36">
    <div className="mx-auto max-w-2xl">
      <h2 className="text-center font-wide text-[clamp(1.7rem,4.6vw,3rem)] font-bold uppercase leading-[1.02]">
        Tes questions.
      </h2>
      <Accordion type="single" collapsible className="mt-8">
        {ITEMS.map((i) => (
          <AccordionItem key={i.q} value={i.q} className="border-night-foreground/15">
            <AccordionTrigger
              onClick={() => track("faq_open", { q: i.q })}
              className="faq-trigger gap-3 py-4 font-sans text-[16px] font-medium text-night-foreground hover:no-underline [&>svg]:shrink-0 [&>svg]:text-night-foreground/60"
            >
              <span className="block flex-1">{i.q}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-[15px] leading-relaxed text-night-foreground/70">
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
  </section>
);

/* ---------- Final ---------- */
export const Final = (p: CTA) => (
  <section id="rejoindre" className="px-5 pb-24 pt-24 text-center md:pb-32 md:pt-36">
    <h2 className="font-wide text-[clamp(2rem,7vw,4.6rem)] font-bold uppercase leading-[0.98]">
      Ton Éclosia <span className="block text-primary">t'attend.</span>
    </h2>
    <div className="mt-8 flex flex-col items-center gap-3">
      <PillCTA {...p} from="final" />
      <p className="text-[14px] text-night-foreground/60">
        Déjà membre ?{" "}
        <Link to="/connexion" className="font-medium text-night-foreground underline underline-offset-4">
          Connexion
        </Link>
      </p>
    </div>
  </section>
);
