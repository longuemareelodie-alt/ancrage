import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import KlarnaPayButton from "@/components/KlarnaPayButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Heart,
  Stethoscope,
  FolderLock,
  Sparkles,
  Users,
  ShieldAlert,
  Check,
  Infinity as InfinityIcon,
  Lock,
  BadgeCheck,
  HeartHandshake,
  Menu,
  X,
  CalendarDays,
  ListChecks,
  ShoppingCart,
  NotebookPen,
  Bell,
  BookHeart,
  BookOpen,
  BarChart3,
  RefreshCw,
  Star,
  Quote,
  Wallet,
  Stars,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import heroPhoto from "@/assets/hero-fondatrice.png.asset.json";
import journalShot from "@/assets/showcase/journal.jpg.asset.json";
import portraitShot from "@/assets/showcase/portrait.jpg.asset.json";
import friseShot from "@/assets/showcase/frise.jpg.asset.json";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
};

/* -------------------------- Reusable primitives -------------------------- */

const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`px-6 py-24 md:py-36 ${className}`}>
    <div className="mx-auto w-full max-w-[1180px]">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-dark/80">
    {children}
  </p>
);

const PrimaryCTA = ({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-3.5 text-sm font-medium text-night-foreground shadow-[0_10px_40px_-15px_hsl(var(--night)/0.5)] transition-all duration-300 hover:shadow-[0_15px_50px_-15px_hsl(var(--night)/0.6)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 ${className}`}
  >
    {children}
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
  </button>
);

const GhostCTA = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur-md transition-all duration-300 hover:bg-card hover:border-border"
  >
    {children}
  </a>
);

/* -------------------------------- Nav ---------------------------------- */

const Nav = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#quotidien", label: "Le quotidien" },
    { href: "#eclosia", label: "Eclosia" },
    { href: "#modules", label: "Ce que ça change" },
    { href: "#fondatrice", label: "Fondatrice" },
    { href: "#tarif", label: "Tarif" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Link to="/" className="font-serif text-lg tracking-tight text-night">
          Eclosia
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={onCTA}
            disabled={loading}
            className="rounded-full bg-night px-5 py-2 text-[13px] font-medium text-night-foreground transition-all duration-300 hover:bg-night/90"
          >
            Découvrir Eclosia
          </button>
        </div>

        <button
          className="md:hidden rounded-full p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-foreground hover:bg-card"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onCTA();
              }}
              className="mt-2 rounded-full bg-night px-5 py-3 text-sm font-medium text-night-foreground"
            >
              Découvrir Eclosia
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

/* -------------------------------- Hero --------------------------------- */

const Hero = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => (
  <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
    {/* Ambient gradient */}
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-40 left-[-10%] h-[480px] w-[480px] rounded-full bg-secondary/40 blur-3xl" />
    </div>

    <div className="mx-auto flex max-w-[980px] flex-col items-center px-6 text-center">
      <motion.div {...fadeIn}>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Pour les familles neuroatypiques
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp}
        className="mt-8 font-serif text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.02em] text-night"
      >
        Tu n'as pas besoin d'être
        <br />
        <span className="italic text-primary-dark">une maman parfaite.</span>
      </motion.h1>

      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="mt-6 max-w-2xl text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-foreground/80"
      >
        Tu as besoin d'un endroit qui porte une partie de ta charge mentale.
      </motion.p>

      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground"
      >
        Eclosia rassemble toute l'organisation, la santé, les émotions, les
        documents importants et les ressources de ta famille dans un seul
        espace pensé pour les parents d'enfants neuroatypiques.
      </motion.p>

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.25 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <PrimaryCTA onClick={onCTA} disabled={loading}>
          Découvrir Eclosia
        </PrimaryCTA>
        <GhostCTA href="#eclosia">Voir comment ça fonctionne</GhostCTA>
      </motion.div>

      <motion.p
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.35 }}
        className="mt-6 text-xs text-muted-foreground"
      >
        Paiement unique · Accès à vie · Sans abonnement
      </motion.p>
    </div>

    {/* Hero mockup */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 w-full max-w-[420px] px-6"
    >
      <div className="relative">
        <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
        <div className="rounded-[2.5rem] border border-border/60 bg-card p-2 shadow-[0_50px_120px_-40px_hsl(var(--night)/0.35)]">
          <img
            src={dashboardShot.url}
            alt="Aperçu du tableau de bord Eclosia"
            className="w-full rounded-[2rem]"
          />
        </div>
      </div>
    </motion.div>
  </section>
);

/* ---------------------------- Quotidien -------------------------------- */

const Quotidien = () => {
  const pensees = [
    "Les rendez-vous.",
    "Les traitements.",
    "Les dossiers.",
    "Les papiers.",
    "Les émotions.",
    "Les listes.",
    "Les crises.",
    "Les courses.",
    "Les démarches.",
  ];

  return (
    <Section id="quotidien" className="bg-card">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Le quotidien</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Si tu es arrivée ici…
          <br />
          <span className="italic text-primary-dark">
            ce n'est probablement pas par hasard.
          </span>
        </h2>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
          Tu penses à tout. Tout le temps. Pour tout le monde.
        </p>
      </motion.div>

      <motion.ul
        {...fadeUp}
        className="mx-auto mt-14 flex max-w-3xl flex-wrap justify-center gap-2"
      >
        {pensees.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-full border border-border/60 bg-background px-4 py-2 text-sm text-foreground/80"
          >
            {p}
          </motion.li>
        ))}
      </motion.ul>

      <motion.div {...fadeUp} className="mx-auto mt-16 max-w-xl text-center">
        <p className="font-serif text-2xl italic leading-relaxed text-night md:text-3xl">
          Et pendant ce temps…
          <br />
          qui pense à toi ?
        </p>
        <div className="mx-auto mt-10 h-px w-16 bg-border" />
        <p className="mt-10 text-[15px] leading-relaxed text-foreground/80">
          Tu n'as pas besoin d'en faire plus.
          <br />
          <span className="font-medium text-night">
            Tu as besoin d'être mieux accompagnée.
          </span>
        </p>
      </motion.div>
    </Section>
  );
};

/* ---------------------- Présentation Eclosia --------------------------- */

const Presentation = () => {
  const pillars = [
    "l'organisation",
    "la santé",
    "les émotions",
    "les documents",
    "les ressources",
    "la communauté",
  ];

  return (
    <Section id="eclosia">
      <div className="grid items-center gap-16 md:grid-cols-2 md:gap-20">
        <motion.div {...fadeUp}>
          <Eyebrow>Voici Eclosia</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-tight text-night">
            Un compagnon
            <br />
            <span className="italic text-primary-dark">du quotidien.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-foreground/80">
            Eclosia est une application créée pour les familles qui vivent
            autrement. Elle rassemble enfin, dans un seul endroit, tout ce qui
            pèse chaque jour :
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3">
            {pillars.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
            Tout est pensé pour simplifier le quotidien et permettre aux
            parents de retrouver un peu de sérénité.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/25 via-secondary/40 to-accent/10 blur-2xl" />
          <div className="rounded-[2rem] border border-border/60 bg-card p-2 shadow-[0_40px_100px_-40px_hsl(var(--night)/0.3)]">
            <img
              src={journalShot.url}
              alt="Interface Eclosia"
              className="w-full rounded-[1.5rem]"
            />
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

/* ---------------------------- Transformations -------------------------- */

const Transformations = () => {
  const cards = [
    {
      icon: Heart,
      emoji: "❤️",
      title: "Retrouver de la sérénité",
      desc: "Tu centralises enfin ce qui compte, au même endroit.",
    },
    {
      icon: Stethoscope,
      emoji: "🩺",
      title: "Ne plus oublier l'essentiel",
      desc: "Rendez-vous, traitements, suivis médicaux — tout est là.",
    },
    {
      icon: FolderLock,
      emoji: "📂",
      title: "Tout retrouver immédiatement",
      desc: "Tes documents importants, sécurisés et accessibles en un geste.",
    },
    {
      icon: Sparkles,
      emoji: "🌱",
      title: "Comprendre ton enfant",
      desc: "Ressources, guides, activités et outils adaptés à son profil.",
    },
    {
      icon: Users,
      emoji: "🤝",
      title: "Ne plus avancer seule",
      desc: "Une communauté bienveillante qui comprend ton quotidien.",
    },
    {
      icon: ShieldAlert,
      emoji: "🚨",
      title: "Être prête quand tout déborde",
      desc: "Gestion de crise, protocoles, informations essentielles à portée.",
    },
  ];

  return (
    <Section id="modules" className="bg-card">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Ce que ça change</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Six transformations,
          <br />
          <span className="italic text-primary-dark">
            un même soulagement.
          </span>
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ icon: Icon, emoji, title, desc }, i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-background p-7 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_30px_80px_-40px_hsl(var(--night)/0.25)]"
          >
            <div className="absolute inset-x-0 -top-24 h-40 bg-gradient-to-b from-primary/15 to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15">
              <Icon className="h-5 w-5 text-primary-dark" />
            </div>
            <h3 className="relative mt-6 font-serif text-xl leading-tight text-night">
              <span aria-hidden className="mr-2">
                {emoji}
              </span>
              {title}
            </h3>
            <p className="relative mt-3 text-[14px] leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
};

/* --------------------- Découvrir l'application ------------------------ */

const PhoneMockup = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => (
  <div className="relative mx-auto w-[260px]">
    <div className="rounded-[2.25rem] border border-border/60 bg-night/95 p-2 shadow-[0_40px_100px_-40px_hsl(var(--night)/0.4)]">
      <div className="overflow-hidden rounded-[1.8rem] bg-card">
        <img src={src} alt={alt} className="w-full" />
      </div>
    </div>
  </div>
);

const Immersive = () => {
  const shots = [
    {
      src: dashboardShot.url,
      label: "Organisation",
      caption: "Tout ton foyer, dans un seul tableau de bord apaisant.",
    },
    {
      src: journalShot.url,
      label: "Émotions",
      caption: "Un espace pour poser ce que tu ne dis à personne.",
    },
    {
      src: portraitShot.url,
      label: "Transformation",
      caption: "Voir, chaque mois, le chemin que tu es en train de faire.",
    },
    {
      src: friseShot.url,
      label: "Parcours",
      caption: "Ta frise d'évolution, pour se souvenir d'où tu viens.",
    },
  ];

  return (
    <Section>
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Découvrir l'application</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Chaque écran est pensé pour
          <br />
          <span className="italic text-primary-dark">te soulager.</span>
        </h2>
      </motion.div>

      <div className="mt-20 space-y-24 md:space-y-32">
        {shots.map((s, i) => (
          <motion.div
            key={s.label}
            {...fadeUp}
            className={`grid items-center gap-12 md:grid-cols-2 md:gap-20 ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <PhoneMockup src={s.src} alt={s.label} />
            <div className="text-center md:text-left">
              <Eyebrow>{s.label}</Eyebrow>
              <p className="mt-4 font-serif text-2xl leading-snug text-night md:text-3xl">
                {s.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* ------------------------------ Fondatrice ----------------------------- */

const Fondatrice = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => (
  <Section id="fondatrice" className="bg-card">
    <div className="grid items-center gap-16 md:grid-cols-2 md:gap-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 to-accent/10 blur-2xl" />
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-background">
          <img
            src={heroPhoto.url}
            alt="La fondatrice d'Eclosia"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </motion.div>

      <motion.div {...fadeUp}>
        <Eyebrow>La fondatrice</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Pourquoi j'ai créé
          <br />
          <span className="italic text-primary-dark">Eclosia.</span>
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/80">
          <p>
            Il y a eu un moment où j'ai réalisé que ma tête était devenue un
            deuxième agenda.
          </p>
          <p>
            Les rendez-vous. Les dossiers. Les traitements. Les documents. Les
            émotions. Les listes. Les démarches. Tout était dans ma tête.
          </p>
          <p>
            Et plus j'essayais de tout retenir, plus j'avais l'impression de
            porter seule toute la charge mentale de notre famille.
          </p>
          <p>
            Je ne cherchais pas une nouvelle application. Je cherchais
            simplement un endroit où enfin déposer tout ce que je portais
            chaque jour. Un endroit où retrouver facilement les informations
            importantes. Un endroit qui m'aiderait à respirer un peu.
          </p>
          <p>Cet endroit n'existait pas. Alors je l'ai créé.</p>
          <p className="font-medium text-night">
            Eclosia n'est pas née d'une idée marketing. Elle est née d'un
            besoin réel. Celui d'une maman qui voulait arrêter de tout porter
            seule.
          </p>
        </div>
        <div className="mt-8">
          <PrimaryCTA onClick={onCTA} disabled={loading}>
            Découvrir Eclosia
          </PrimaryCTA>
        </div>

      </motion.div>
    </div>
  </Section>
);


/* ---------------------- Ce qui est inclus dans Eclosia ---------------- */

const Inclus = () => {
  const groups = [
    {
      icon: CalendarDays,
      title: "Organisation familiale",
      items: ["Agenda", "Tâches", "Liste de courses", "Notes", "Rappels"],
    },
    {
      icon: Heart,
      title: "Suivi des émotions",
      items: ["Journal privé", "Portrait mensuel", "Frise d'évolution"],
    },
    {
      icon: Stethoscope,
      title: "Santé",
      items: ["Traitements", "Rendez-vous", "Documents médicaux"],
    },
    {
      icon: FolderLock,
      title: "Coffre-fort sécurisé",
      items: ["Documents importants", "Papiers officiels", "Accès rapide"],
    },
    {
      icon: Wallet,
      title: "Budget",
      items: ["Suivi des dépenses", "Catégories familiales", "Factures"],
    },
    {
      icon: BookHeart,
      title: "Ressources neuroatypie",
      items: ["Guides de crise", "Activités", "LSF"],
    },
    {
      icon: Users,
      title: "Communauté",
      items: ["Échanges bienveillants", "Retours d'expérience"],
    },
    {
      icon: BarChart3,
      title: "Statistiques",
      items: ["Progression", "Habitudes", "Repères doux"],
    },
    {
      icon: RefreshCw,
      title: "Mises à jour incluses",
      items: ["Nouvelles fonctionnalités", "Améliorations continues"],
    },
    {
      icon: InfinityIcon,
      title: "Accès à vie",
      items: ["Un seul paiement", "Aucun abonnement"],
    },
  ];

  return (
    <Section id="inclus">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Ce que contient vraiment Eclosia</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Tout ce qui est inclus
          <br />
          <span className="italic text-primary-dark">dans Eclosia.</span>
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ icon: Icon, title, items }, i) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="rounded-[1.5rem] border border-border/60 bg-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_hsl(var(--night)/0.2)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
              <Icon className="h-5 w-5 text-primary-dark" />
            </div>
            <h3 className="mt-5 font-serif text-lg leading-tight text-night">
              {title}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {items.map((it) => (
                <li
                  key={it}
                  className="flex items-start gap-2 text-[13.5px] leading-relaxed text-muted-foreground"
                >
                  <Check className="mt-[3px] h-3.5 w-3.5 flex-shrink-0 text-primary-dark/80" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>

      <motion.p
        {...fadeUp}
        className="mx-auto mt-14 max-w-xl text-center font-serif text-xl italic leading-relaxed text-night md:text-2xl"
      >
        Un seul espace pour retrouver ce qui compte vraiment.
      </motion.p>
    </Section>
  );
};

/* ----------------------------- Témoignages ---------------------------- */

const Temoignages = () => {
  const cards = [1, 2, 3];
  return (
    <Section id="temoignages" className="bg-card">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center gap-1 text-primary-dark">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Les premiers retours
          <br />
          <span className="italic text-primary-dark">arriveront bientôt.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Les premières familles découvrent actuellement Eclosia. Les premiers
          témoignages arriveront très bientôt. Je préfère partager de vrais
          retours d'expérience plutôt que d'en inventer.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {cards.map((n, i) => (
          <motion.article
            key={n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="relative rounded-[1.75rem] border border-dashed border-border/70 bg-background p-7"
          >
            <Quote className="h-6 w-6 text-primary/40" />
            <p className="mt-5 min-h-[7rem] font-serif text-[15px] italic leading-relaxed text-muted-foreground/70">
              Un vrai témoignage prendra bientôt sa place ici.
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
              <div className="h-9 w-9 rounded-full bg-primary/15" />
              <div className="h-2 w-24 rounded-full bg-border/70" />
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
};


/* -------------------------- Réassurance -------------------------------- */

const Unique = () => {
  const items = [
    {
      icon: InfinityIcon,
      title: "Accès à vie",
      desc: "Un paiement unique. Eclosia t'accompagne pour toutes les années à venir.",
    },
    {
      icon: BadgeCheck,
      title: "Aucune publicité",
      desc: "Un espace calme, sans distractions, entièrement dédié à ta famille.",
    },
    {
      icon: Wallet,
      title: "Paiement unique",
      desc: "97 € une seule fois. Aucun abonnement, aucun renouvellement.",
    },
    {
      icon: Lock,
      title: "Données confidentielles",
      desc: "Tes informations restent les tiennes, protégées et chiffrées.",
    },
    {
      icon: RefreshCw,
      title: "Mises à jour incluses",
      desc: "Chaque nouvelle fonctionnalité arrive automatiquement dans ton espace.",
    },
    {
      icon: Heart,
      title: "Support humain",
      desc: "Une vraie personne te répond quand tu en as besoin.",
    },
    {
      icon: HeartHandshake,
      title: "Pensée pour les familles neuroatypiques",
      desc: "TSA, TDAH, DYS, hypersensibilité — nos outils s'y adaptent avec douceur.",
    },
    {
      icon: FolderLock,
      title: "Tout au même endroit",
      desc: "Santé, budget, émotions, documents. Fini de chercher partout.",
    },
  ];

  return (
    <Section id="reassurance">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <Eyebrow>Réassurance</Eyebrow>
        <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
          Pourquoi tant de familles
          <br />
          <span className="italic text-primary-dark">choisissent Eclosia.</span>
        </h2>
      </motion.div>

      <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Icon className="h-4 w-4 text-primary-dark" />
            </div>
            <p className="text-sm font-medium text-night leading-snug">
              {title}
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* --------------------------- Bridge before price ---------------------- */

const PreTarif = () => (
  <section className="px-6 py-24 md:py-32">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Stars className="mx-auto h-6 w-6 text-primary-dark/70" />
      <h2 className="mt-6 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
        Tu n'achètes pas simplement
        <br />
        <span className="italic text-primary-dark">une application.</span>
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
        Tu investis dans un outil qui t'accompagnera pendant des années et qui
        évoluera avec ta famille.
      </p>
    </motion.div>
  </section>
);

/* ------------------------------- Tarif -------------------------------- */

const Tarif = ({ onCTA, loading }: { onCTA: () => void; loading: boolean }) => (
  <Section id="tarif">
    <motion.div
      {...fadeUp}
      className="relative mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] border border-border/60 bg-card p-10 text-center md:p-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <Eyebrow>Tarif</Eyebrow>
      <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
        Un seul achat.
        <br />
        <span className="italic text-primary-dark">
          Pour des années de sérénité.
        </span>
      </h2>
      <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        Eclosia t'accompagne chaque jour. Pas seulement aujourd'hui. L'accès
        est valable à vie.
      </p>

      <div className="mt-10 flex items-baseline justify-center gap-2">
        <span className="font-serif text-[clamp(3rem,7vw,5rem)] leading-none text-night">
          {PREMIUM_PRICE_SHORT}
        </span>
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Paiement unique · Aucun abonnement
      </p>
      <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        Paiement unique. Aucun abonnement. Toutes les futures mises à jour sont
        incluses.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3">
        <PrimaryCTA onClick={onCTA} disabled={loading}>
          Découvrir Eclosia
        </PrimaryCTA>
        <div className="w-full max-w-xs">
          <KlarnaPayButton className="w-full rounded-full border border-primary/30 bg-background px-6 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-primary/5" />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Ou paie en plusieurs fois avec Klarna
        </p>
      </div>


      <ul className="mx-auto mt-10 grid max-w-lg gap-2.5 sm:grid-cols-2">
        {[
          "Accès immédiat",
          "Mises à jour incluses",
          "Support humain",
          "Paiement sécurisé",
        ].map((b) => (
          <li
            key={b}
            className="flex items-center gap-2.5 rounded-2xl border border-border/50 bg-background/60 px-4 py-2.5 text-left text-sm text-foreground/90"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Check className="h-3.5 w-3.5 text-primary-dark" />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  </Section>
);


/* ------------------------------- Page --------------------------------- */

const Index = () => {
  const { startPayment, loading } = useMolliePayment();
  const onCTA = () => startPayment();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onCTA={onCTA} loading={loading} />
      <main>
        <Hero onCTA={onCTA} loading={loading} />
        <Quotidien />
        <Presentation />
        <Transformations />
        <Immersive />
        <Fondatrice onCTA={onCTA} loading={loading} />
        <Inclus />
        <Temoignages />
        <Unique />
        <PreTarif />
        <Tarif onCTA={onCTA} loading={loading} />
        <div id="faq">
          <HomeFAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
