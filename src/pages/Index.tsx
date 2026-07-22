import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X, Heart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG, PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import KlarnaPayButton from "@/components/KlarnaPayButton";
import heroPhoto from "@/assets/hero-fondatrice.png.asset.json";
import journalShot from "@/assets/showcase/journal.jpg.asset.json";
import portraitShot from "@/assets/showcase/portrait.jpg.asset.json";
import friseShot from "@/assets/showcase/frise.jpg.asset.json";
import dashboardShot from "@/assets/showcase/dashboard.jpg.asset.json";

const showcaseShots = [
  { src: journalShot.url, caption: "Ton journal, avec l'IA qui se souvient de toi" },
  { src: portraitShot.url, caption: "Ton Portrait de Transformation, généré chaque mois" },
  { src: friseShot.url, caption: "Ta Frise d'Évolution, pour voir le chemin parcouru" },
  { src: dashboardShot.url, caption: "Ton tableau de bord, simple et apaisant" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`px-6 py-16 md:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-[1200px]">{children}</div>
  </section>
);

const HandHeart = ({ className = "h-5 w-5 text-primary" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.22"
    />
  </svg>
);

const HandUnderline = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 12"
    className={`absolute -bottom-1.5 left-0 h-2.5 w-full ${className}`}
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M2 7 C 40 2, 80 11, 120 6 S 195 4, 198 7"
      stroke="hsl(41 86% 62%)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Index = () => {
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePay = () => startPayment();
  const CTA_LABEL = `Je reprends mon souffle — ${PREMIUM_PRICE_LONG}`;

  const navLinks = [
    { href: "#pour-toi", label: "Pour toi" },
    { href: "#quotidien", label: "Le quotidien" },
    { href: "#familles", label: "Liés autrement" },
    { href: "#offre", label: "Tarif" },
    { href: "#faq", label: "FAQ" },
    { href: "/emotions", label: "L'outil" },
  ];

  const problems = [
    { e: "🌀", t: "Je porte tout", d: "Charge mentale permanente." },
    { e: "🔥", t: "Je déborde", d: "Stress, fatigue, émotions difficiles." },
    { e: "🩷", t: "Mon enfant déborde", d: "Crises, transitions, hypersensibilités." },
    { e: "🧠", t: "J'oublie tout", d: "Organisation impossible." },
    { e: "💔", t: "Je culpabilise", d: "J'ai l'impression de ne jamais en faire assez." },
    { e: "🌙", t: "Je suis épuisée", d: "Je tiens, mais à quel prix ?" },
  ];

  const familles = [
    { e: "🧩", t: "TSA" },
    { e: "🧠", t: "TDAH" },
    { e: "📚", t: "DYS" },
    { e: "🤟", t: "Surdité" },
    { e: "❤️", t: "Handicap" },
    { e: "🌱", t: "Besoins spécifiques" },
  ];

  const timeline = [
    { d: "Jour 1", t: "Je souffle.", icon: "🌱" },
    { d: "Jour 7", t: "Je comprends mieux ce qui me déborde.", icon: "☀️" },
    { d: "Jour 21", t: "Je retrouve des repères.", icon: "⚓" },
    { d: "Jour 30", t: "Je me sens plus solide.", icon: "🩷" },
  ];

  const CTAButton = ({
    label = CTA_LABEL,
    variant = "gold",
  }: {
    label?: string;
    variant?: "gold" | "rose" | "night";
  }) => {
    const styles =
      variant === "night"
        ? "bg-night text-night-foreground hover:bg-night/90"
        : variant === "rose"
        ? "bg-primary text-primary-foreground hover:brightness-[1.03]"
        : "bg-accent text-accent-foreground hover:brightness-[1.04]";
    return (
      <button
        type="button"
        onClick={handlePay}
        disabled={paymentLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 ${styles}`}
      >
        <Heart className="h-4 w-4 fill-current" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-tight text-night">
              Eclosia <HandHeart className="inline h-4 w-4 -translate-y-1 text-primary" />
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Ton parcours de reconstruction
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-foreground/75 transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/auth"
              className="rounded-full bg-night px-5 py-2.5 text-xs font-semibold text-night-foreground transition-colors hover:bg-night/90"
            >
              Se connecter
            </Link>
            <button
              type="button"
              onClick={handlePay}
              disabled={paymentLoading}
              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-[1.04] disabled:opacity-60"
            >
              Je commence
            </button>
          </div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full border border-border bg-card p-2 md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-6 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-foreground/80 hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handlePay();
                }}
                disabled={paymentLoading}
                className="mt-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                Je commence
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <Section className="pt-8 md:pt-12">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div {...fadeUp}>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
              <HandHeart className="h-4 w-4" />
              Pour les femmes qui ont traversé une tempête
            </p>
            <h1 className="mt-6 font-serif text-[clamp(2.5rem,6.5vw,4.5rem)] font-normal leading-[1.02] tracking-tight text-night">
              La vie t'a transformée.
              <br />
              <span className="relative inline-block text-primary">
                Eclosia t'aide à découvrir qui tu es devenue.
                <HandUnderline />
              </span>
            </h1>
            <div className="mt-7 space-y-2 text-base leading-relaxed text-foreground/80">
              <p>
                Tu as survécu. Maintenant tu veux vivre.
              </p>
            </div>
            <div className="mt-9">
              <div className="flex flex-col items-start gap-3">
                <CTAButton />
                <KlarnaPayButton className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-background px-6 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5" />
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>🔒 Paiement unique</span>
                <span aria-hidden>·</span>
                <span>∞ Accès à vie</span>
                <span aria-hidden>·</span>
                <span>📱 Mobile & ordinateur</span>
              </p>
            </div>
          </motion.div>

        </div>
      </Section>

      {/* Sous-hero */}
      <Section className="py-10">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-foreground/80 md:text-xl">
            Eclosia t’accompagne au quotidien avec un journal intelligent, un portrait mensuel de ta transformation et des missions pour avancer — pas pour revenir en arrière, mais pour devenir celle que la tempête t’a révélée.
          </p>
        </motion.div>
      </Section>

      {/* IDENTIFICATION */}
      <Section id="pour-toi">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
            Identification
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight text-night">
            Tu te reconnais{" "}
            <span className="relative inline-block">
              ici&nbsp;?
              <HandUnderline />
            </span>
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {problems.map((p) => (
            <motion.div
              {...fadeUp}
              key={p.t}
              className="rounded-[2rem] bg-[hsl(353_45%_96%)] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="text-2xl">{p.e}</div>
              <h3 className="mt-4 font-serif text-xl text-night">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FONDATRICE — photo + récit (remontée juste après identification) */}
      <Section>
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <motion.div {...fadeUp} className="order-2 md:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
              Pourquoi Eclosia existe ?
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-tight text-night">
              L'outil que j'aurais aimé{" "}
              <span className="relative inline-block">
                avoir.
                <HandUnderline />
              </span>
            </h2>
            <div className="mt-7 space-y-4 text-base leading-relaxed text-foreground/85">
              <p>Je suis maman.</p>
              <p>
                Pendant longtemps, j'ai cru qu'il fallait simplement tenir.
              </p>
              <p>
                Tenir encore une journée.
                <br />
                Puis une autre.
              </p>
              <p>
                Gérer les rendez-vous, la charge mentale, la fatigue, les émotions qui débordent et cette impression constante de devoir être forte pour tout le monde.
              </p>
              <p>J'avais besoin d'un endroit simple pour souffler.</p>
              <p className="font-serif text-lg italic text-night">
                Alors j'ai créé l'outil que j'aurais aimé avoir.
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="order-1 md:order-2">
            <div className="overflow-hidden rounded-[2.5rem] shadow-[0_40px_100px_-30px_rgba(30,43,82,0.35)]">
              <img
                src={heroPhoto.url}
                alt="La fondatrice d'Eclosia chez elle"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CITATION — Tu n'as pas besoin */}
      <Section className="pt-0 pb-12 md:pb-20">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2rem] bg-secondary/60 p-10 md:p-20"
        >
          <HandHeart className="absolute left-8 top-8 h-8 w-8 text-primary" />
          <div className="mx-auto max-w-2xl space-y-6 text-center font-serif text-2xl italic leading-relaxed text-night md:text-3xl">
            <p>Tu n'as pas besoin d'aller mieux pour commencer.</p>
            <p>Tu n'as pas besoin d'être parfaitement organisée.</p>
            <p>Tu n'as pas besoin d'avoir plus de temps.</p>
            <p className="not-italic pt-4 text-lg text-primary-dark md:text-xl">
              Tu as simplement besoin d'un point d'appui.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* POURQUOI ÇA FONCTIONNE */}
      <Section className="!py-10 md:!py-16">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight text-night">
            Pourquoi ça fonctionne
          </h2>
          <p className="mt-6 text-base leading-[1.8] text-foreground/80 md:text-lg">
            Quand on est épuisée, on cherche souvent une solution compliquée. Eclosia fait l’inverse. Quelques minutes par jour suffisent pour retrouver des repères, comprendre ce que tu traverses, et avancer avec plus de calme.
          </p>
        </motion.div>
      </Section>

      {/* COMMENT ÇA MARCHE */}
      <Section className="pt-12 md:pt-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
            Comment ça marche
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight text-night">
            Trois gestes simples,{" "}
            <span className="relative inline-block">
              chaque jour.
              <HandUnderline />
            </span>
          </h2>
        </motion.div>
        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {[
            { n: "01", t: "Ressentir", d: "Check-in émotionnel en moins de 30 secondes.", e: "🧠" },
            { n: "02", t: "Réguler", d: "Des exercices simples quand tout déborde.", e: "🌸" },
            { n: "03", t: "Observer", d: "Comprendre ce qui revient et ce qui t'aide.", e: "🔎" },
          ].map((s, i, arr) => (
            <Fragment key={s.n}>
              <motion.div {...fadeUp} className="flex flex-col rounded-[2rem] bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night text-sm font-semibold text-night-foreground">
                    {s.n}
                  </span>
                  <span className="text-2xl">{s.e}</span>
                </div>
                <h3 className="mt-6 font-serif text-2xl text-night">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">{s.d}</p>
              </motion.div>
              {i < arr.length - 1 && (
                <div className="hidden items-center justify-center md:flex">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </Section>

      {/* FAMILLES ATYPIQUES — fond bleu nuit pleine largeur */}
      <section id="familles" className="bg-night px-6 py-24 text-night-foreground md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fadeUp} className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Familles atypiques
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight">
              Pensé pour les familles qui{" "}
              <span className="relative inline-block text-primary">
                avancent autrement.
                <HandUnderline />
              </span>
            </h2>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-6 sm:grid-cols-6"
          >
            {familles.map((f) => (
              <div
                key={f.t}
                className="flex flex-col items-center rounded-2xl border border-night-foreground/10 bg-night-foreground/5 px-3 py-5 text-center transition-colors hover:bg-night-foreground/10"
              >
                <span className="text-2xl">{f.e}</span>
                <span className="mt-3 text-[11px] font-medium uppercase tracking-wider text-night-foreground/85">
                  {f.t}
                </span>
              </div>
            ))}
          </motion.div>
          <motion.div
            {...fadeUp}
            className="mx-auto mt-10 max-w-2xl space-y-4 text-center font-serif text-xl italic leading-relaxed text-night-foreground/90 md:text-2xl"
          >
            <p>Chaque famille avance à son rythme.</p>
            <p>TSA, TDAH, DYS, hypersensibilité, handicap ou besoins spécifiques.</p>
            <p>Ici, il n'y a rien à réparer.</p>
            <p>Seulement des ressources pour avancer avec plus de calme et de repères.</p>
          </motion.div>
        </div>
      </section>


      {/* TIMELINE TRANSFORMATION — verticale, élégante */}
      <Section id="quotidien" className="!pb-12 md:!pb-20">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
            Ta transformation
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight text-night">
            Quelques jours suffisent à sentir la{" "}
            <span className="relative inline-block">
              différence.
              <HandUnderline />
            </span>
          </h2>
        </motion.div>
        <div className="relative mx-auto mt-12 max-w-xl">
          {/* Ligne verticale */}
          <div
            aria-hidden
            className="absolute left-8 top-2 bottom-2 w-px bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20"
          />
          <ol className="space-y-7">
            {timeline.map((s) => (
              <motion.li
                {...fadeUp}
                key={s.d}
                className="relative flex items-start gap-5 pl-0"
              >
                <span className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-secondary text-2xl ring-4 ring-background">
                  {s.icon}
                </span>
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {s.d}
                  </p>
                  <p className="mt-1.5 font-serif text-xl leading-snug text-night md:text-2xl">
                    {s.t}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </Section>

      {/* L'IA QUI SE SOUVIENT */}
      <Section className="!pb-8 md:!pb-12">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
            Intelligence bienveillante
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight text-night">
            L'IA qui se souvient de ton parcours
          </h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/80 md:text-lg">
            Eclosia retient ton histoire, tes peurs, tes progrès, tes victoires. Et te montre ce que toi-même tu ne vois plus.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-soft md:p-8">
            <p className="font-serif text-lg italic leading-relaxed text-night md:text-xl">
              « Jour 1 tu écrivais que tu étais perdue. Aujourd'hui tu parles de projets. Voici ce qui a changé. »
            </p>
          </div>
        </motion.div>
      </Section>

      {/* PORTRAIT DE TRANSFORMATION */}
      <Section className="!pt-8 !pb-12 md:!pt-12 md:!pb-20">
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary/60 via-secondary/40 to-sage/30 p-10 md:p-16"
        >
          <div className="text-center">
            <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight text-night">
              Ton Portrait de Transformation <span aria-hidden>🌸</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-foreground/85 md:text-lg">
              Chaque mois, Eclosia relit ton parcours et te montre ce que tu ne voyais plus. Tes progrès. Tes nouvelles forces. Les schémas qui reviennent. Le chemin que tu as parcouru.
            </p>
            <p className="mt-5 font-serif text-lg italic text-primary-dark md:text-xl">
              Ce n’est pas un simple résumé. C’est le miroir de qui tu es en train de devenir.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* LES 9 ESPACES D'ECLOSIA */}
      <Section id="modules" className="!pt-12 md:!pt-20 !pb-4">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
            Ton espace complet
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,3rem)] leading-tight text-night">
            9 espaces pensés pour{" "}
            <span className="relative inline-block">
              te soulager.
              <HandUnderline />
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            Une seule app pour tout ce que tu portes. Plus besoin de jongler entre 10 outils, carnets, tableurs et post-it.
          </p>
        </motion.div>
        <motion.div
          {...fadeUp}
          className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { e: "🌱", t: "Ancrage émotionnel", d: "Check-ins, régulation, séances quand tout déborde." },
            { e: "📖", t: "Journal intelligent", d: "L'IA se souvient de toi et te renvoie ce que tu ne vois plus." },
            { e: "🌸", t: "Portrait mensuel", d: "Ton reflet écrit chaque mois. Le chemin devient visible." },
            { e: "🕰️", t: "Frise d'Évolution", d: "Avant. Tempête. Aujourd'hui. Ton parcours en un regard." },
            { e: "📕", t: "Livre de Reconstruction", d: "Ton histoire compilée mois par mois. Exportable en PDF." },
            { e: "💰", t: "Budget complet", d: "Revenus, dépenses, factures, reste à vivre, alertes." },
            { e: "🔐", t: "Coffre-fort", d: "Documents, IBAN, contrats, notes sensibles chiffrées." },
            { e: "🗓️", t: "Organisation", d: "Agenda, to-do, courses, notes — avec rappels intelligents." },
            { e: "❤️‍🩹", t: "Santé & Famille", d: "Carnets médicaux, ordonnances, rappels, fiche d'urgence." },
          ].map((m) => (
            <div
              key={m.t}
              className="rounded-[1.75rem] border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="text-2xl">{m.e}</div>
              <h3 className="mt-4 font-serif text-lg text-night">{m.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{m.d}</p>
            </div>
          ))}
        </motion.div>
        <motion.p
          {...fadeUp}
          className="mx-auto mt-10 max-w-2xl text-center text-sm italic leading-relaxed text-foreground/70 md:text-base"
        >
          + Ressources TSA/TDAH/DYS, activités adaptées, initiation LSF, communauté, mises à jour à vie et présence humaine si besoin.
        </motion.p>
      </Section>

      {/* C'EST FAIT POUR TOI SI */}
      <Section className="!pt-8 !pb-4 md:!pt-12">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-primary/20 bg-secondary/40 p-8 md:p-12">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
              C'est fait pour toi si
            </p>
            <h2 className="mt-4 text-center font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight text-night">
              Tu vas te reconnaître ligne après ligne.
            </h2>
            <ul className="mx-auto mt-8 max-w-2xl space-y-3.5">
              {[
                "Tu as traversé quelque chose que peu de gens comprennent, et tu ne sais plus qui tu es devenue.",
                "Tu portes la charge mentale, les papiers, la santé, le budget, l'agenda — pour tout le monde, seule.",
                "Tu oublies parce que c'est trop, et tu culpabilises d'oublier.",
                "Ton cerveau tourne à 23h et t'empêche de dormir.",
                "Tu as testé 10 apps, 3 carnets, des tableurs — rien ne tient dans le temps.",
                "Tu veux un seul endroit calme où déposer ta vie, sans abonnement qui tombe chaque mois.",
                "Tu veux voir noir sur blanc le chemin que tu parcours, pas juste tenir.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-[15px] leading-relaxed text-foreground/85">
                  <span className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center font-serif text-lg italic text-primary-dark md:text-xl">
              Si tu as coché ne serait-ce que 3 lignes — Eclosia est fait pour toi.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* APERÇU INTÉRIEUR */}
      <Section className="!pt-8 !pb-12 md:!pt-12 md:!pb-16">
        <motion.div {...fadeUp} className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight text-night">
              Découvre l'intérieur d'Eclosia <span aria-hidden>🌱</span>
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              Voici concrètement ce qui t'attend à l'intérieur.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
            {showcaseShots.map(({ src, caption }) => (
              <li key={caption} className="flex flex-col">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  <div className="aspect-[3/5] w-full bg-secondary/40">
                    <img
                      src={src}
                      alt={caption}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>
                <p className="mt-3 text-center text-xs leading-snug text-muted-foreground md:text-sm">
                  {caption}
                </p>
              </li>
            ))}
          </ul>
        </motion.div>
      </Section>

      {/* VALEUR */}

      <Section className="!pt-8 !pb-12 md:!pb-20">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-3xl rounded-[2rem] bg-secondary/40 p-10 md:p-14"
        >
          <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight text-night">
            Pourquoi Eclosia vaut bien plus que son prix&nbsp;?
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/85">
            <p>Une seule consultation spécialisée coûte souvent entre 50&nbsp;€ et 100&nbsp;€.</p>
            <p>Les ressources adaptées aux familles atypiques sont souvent dispersées sur plusieurs plateformes.</p>
            <p>Les outils d'organisation, de gestion émotionnelle et les ressources spécialisées sont généralement vendus séparément.</p>
            <p>Eclosia rassemble tout cela dans un seul espace conçu pour les mamans qui portent déjà beaucoup trop.</p>
            <p className="font-serif text-xl italic text-night">Tu n'achètes pas un outil.</p>
            <p>Tu rejoins un espace ressource pensé pour te faire gagner du temps, de l'énergie et des repères.</p>
          </div>
        </motion.div>
      </Section>

      {/* OFFRE — carte tarif */}
      <Section id="offre" className="!pt-4 md:!pt-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-2xl italic leading-relaxed text-night md:text-3xl">
            Tu n'as pas besoin de tout porter seule.
            <br />
            <span className="text-primary">Eclosia a été créé pour ça.</span>
          </p>
        </motion.div>
        <motion.div {...fadeUp} className="mx-auto mt-12 max-w-md">
          <div className="relative rounded-[2rem] bg-secondary/60 p-10 text-center shadow-[0_40px_100px_-40px_rgba(30,43,82,0.25)]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-night px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-night-foreground shadow-soft-lg">
              ✨ Accès à vie
            </span>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-dark">
              Eclosia Premium
            </p>
            <p className="mt-6 font-serif text-[clamp(3.5rem,6vw,4.5rem)] leading-none text-night">
              {PREMIUM_PRICE_SHORT}
            </p>
            <p className="mt-3 text-sm text-foreground/75">
              ou <span className="font-semibold text-night">3 fois 32,33&nbsp;€</span> avec Klarna
            </p>
            <p className="mt-4 text-sm italic leading-relaxed text-foreground/70">
              Prends soin de toi aujourd'hui.
              <br />
              Choisis le paiement qui te convient le mieux.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3">
              <CTAButton />
              <KlarnaPayButton className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-background px-6 py-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5" />
            </div>
            <ul className="mx-auto mt-8 space-y-2.5 text-left text-sm text-foreground/85">
              {[
                { e: "🌿", t: "Accès immédiat" },
                { e: "🔒", t: "Paiement sécurisé CB, PayPal ou Klarna" },
                { e: "💳", t: "Paiement possible en 3 fois avec Klarna" },
                { e: "💌", t: "Je reste disponible si tu as besoin d'aide" },
                { e: "♾️", t: "Accès à vie et futures améliorations incluses" },
              ].map((f) => (
                <li key={f.t} className="flex items-start gap-3">
                  <span className="mt-0.5 text-base leading-none" aria-hidden>{f.e}</span>
                  <span>{f.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </Section>

      {/* FAQ */}
      <div id="faq" className="bg-secondary/40">
        <HomeFAQ />
      </div>

      {/* CTA FINAL */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2rem] bg-night px-8 py-16 text-night-foreground md:grid md:grid-cols-[1.2fr_1fr] md:gap-10 md:px-14 md:py-20"
          >
            <HandHeart className="absolute right-8 top-8 h-8 w-8 text-primary" />
            <div>
              <h2 className="font-serif text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1]">
                Tu n'as pas besoin d'être{" "}
                <span className="relative inline-block">
                  parfaite.
                  <HandUnderline />
                </span>
                <br />
                <span className="text-primary">
                  Tu as juste besoin d'un endroit où revenir
                </span>{" "}
                quand tout devient trop.
              </h2>
            </div>
            <div className="mt-10 flex flex-col items-start gap-4 md:mt-0 md:items-end md:justify-center md:text-right">
              <div className="flex flex-col items-start md:items-end gap-1.5">
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paymentLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-soft-lg transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.04] active:scale-[0.98] disabled:opacity-60"
                >
                  <span className="text-base leading-none">💛</span>
                  Je reprends mon souffle
                </button>
                <span className="text-[11px] uppercase tracking-[0.18em] text-night-foreground/75">
                  {PREMIUM_PRICE_LONG}
                </span>
                <KlarnaPayButton className="inline-flex items-center justify-center rounded-full border border-night-foreground/40 bg-transparent px-6 py-3 text-xs font-semibold text-night-foreground transition-colors hover:bg-night-foreground/10" />
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-night-foreground/75">
                <span>⚡ Accès immédiat</span>
                <span aria-hidden>·</span>
                <span>🔒 Paiement unique</span>
                <span aria-hidden>·</span>
                <span>∞ Accès à vie</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
