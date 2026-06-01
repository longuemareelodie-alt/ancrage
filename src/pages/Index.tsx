import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG, PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
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
  <section id={id} className={`px-6 py-16 md:py-24 ${className}`}>
    <div className="mx-auto w-full max-w-[1200px]">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
    {children}
  </p>
);

// Petit cœur dessiné main (SVG)
const HandHeart = ({ className = "h-5 w-5 text-primary" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.18"
    />
  </svg>
);

// Trait manuscrit (souligné jaune sous un mot)
const HandUnderline = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 12"
    className={`absolute -bottom-1.5 left-0 h-2.5 w-full ${className}`}
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M2 7 C 40 2, 80 11, 120 6 S 195 4, 198 7"
      stroke="hsl(41 100% 67%)"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Phone mockup (Hero)
const PhoneMockup = () => (
  <div className="relative mx-auto w-[260px] md:w-[300px]">
    {/* taches organiques décoratives */}
    <div className="pointer-events-none absolute -left-12 top-16 -z-10 h-48 w-48 rounded-full bg-primary/30 blur-2xl" />
    <div className="pointer-events-none absolute -right-10 bottom-10 -z-10 h-40 w-40 rounded-full bg-night/15 blur-2xl" />

    <div className="rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_40px_100px_-30px_rgba(24,33,52,0.25)]">
      <div className="overflow-hidden rounded-[2rem] bg-background">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <span className="h-1.5 w-10 rounded-full bg-foreground/15" />
        </div>
        <div className="px-5 pt-2 pb-4">
          <p className="font-serif text-xl leading-tight">
            Bonjour Camille <HandHeart className="inline h-4 w-4 text-primary" />
          </p>
        </div>
        <div className="mx-5 rounded-2xl border border-border bg-secondary p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Check-in émotionnel
          </p>
          <p className="mt-1 font-serif text-base">Comment tu te sens ?</p>
          <div className="mt-3 flex gap-1.5">
            {["😌", "😐", "😣", "😶", "🌧"].map((e) => (
              <span
                key={e}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <div className="mx-5 mt-3">
          <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-sm font-medium">Ça déborde</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mx-5 mt-3 mb-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Aujourd'hui
            </p>
            <p className="mt-0.5 font-serif text-base text-primary">Calme +38 %</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Ma semaine
            </p>
            <p className="mt-0.5 font-serif text-base">7 check-ins</p>
          </div>
        </div>
      </div>
    </div>
  </div>
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
    { href: "#pour-enfant", label: "Pour ton enfant" },
    { href: "#quotidien", label: "Pour le quotidien" },
    { href: "#familles", label: "Liés autrement" },
    { href: "#offre", label: "Tarifs" },
  ];

  const problems = [
    { e: "🌀", t: "Je porte tout", d: "Charge mentale permanente." },
    { e: "🔥", t: "Je déborde", d: "Stress, fatigue, émotions difficiles." },
    { e: "💗", t: "Mon enfant déborde", d: "Crises, transitions compliquées, hypersensibilités." },
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
    { d: "Jour 30", t: "Je me sens plus solide.", icon: "💗" },
  ];

  // Bouton CTA jaune lumière (Maman Atypique signature)
  const CTAButton = ({
    label = CTA_LABEL,
    variant = "yellow",
  }: {
    label?: string;
    variant?: "yellow" | "night";
  }) => (
    <button
      type="button"
      onClick={handlePay}
      disabled={paymentLoading}
      className={
        variant === "night"
          ? "inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-4 text-sm font-semibold text-night-foreground shadow-soft-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
          : "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-soft-lg transition-all hover:-translate-y-0.5 hover:brightness-[1.03] active:scale-[0.98] disabled:opacity-60"
      }
    >
      <Heart className="h-4 w-4 fill-current" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-tight text-night">
              Ancrage <HandHeart className="inline h-4 w-4 -translate-y-1 text-primary" />
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Bien-être émotionnel · parents & enfants
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
              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition-all hover:brightness-[1.03] disabled:opacity-60"
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
      <Section className="pt-6 md:pt-10">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
          <motion.div {...fadeUp}>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <HandHeart className="h-4 w-4" />
              Pour les mamans qui portent trop
            </p>
            <h1 className="mt-5 font-serif text-[clamp(2.4rem,6.5vw,4.25rem)] font-normal leading-[1.02] tracking-tight text-night">
              Quand tout déborde,
              <br />
              <span className="relative inline-block text-primary">
                commence par toi.
                <HandUnderline />
              </span>
            </h1>
            <ul className="mt-7 space-y-3 text-base leading-relaxed text-foreground/85">
              <li className="flex gap-3">
                <HandHeart className="mt-1 h-4 w-4 shrink-0 text-primary" />
                Rendez-vous, papiers, crises, nuits trop courtes…
              </li>
              <li className="flex gap-3">
                <HandHeart className="mt-1 h-4 w-4 shrink-0 text-primary" />
                Charge mentale, culpabilité, émotions à fleur de peau…
              </li>
              <li className="flex gap-3">
                <HandHeart className="mt-1 h-4 w-4 shrink-0 text-primary" />
                Ancrage t'aide à <span className="text-primary">retrouver un peu de calme</span>{" "}
                quand ton cerveau te dit qu'il ne{" "}
                <span className="relative inline-block">
                  tiendra
                  <HandUnderline />
                </span>{" "}
                plus.
              </li>
            </ul>
            <div className="mt-9">
              <CTAButton />
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>🔒 Paiement unique</span>
                <span aria-hidden>·</span>
                <span>∞ Accès à vie</span>
                <span aria-hidden>·</span>
                <span>📱 Mobile & ordinateur</span>
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <PhoneMockup />
          </motion.div>
        </div>
      </Section>

      {/* IDENTIFICATION */}
      <Section>
        <motion.div {...fadeUp} className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-night">
            Maman, est-ce que tu te reconnais ?
            <HandHeart className="h-4 w-4 text-primary" />
          </p>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <motion.div
              {...fadeUp}
              key={p.t}
              className="rounded-[1.75rem] bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="text-2xl">{p.e}</div>
              <h3 className="mt-4 font-serif text-xl text-night">{p.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* TRANSITION douce */}
      <Section className="pt-0">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[1.75rem] bg-card p-8 md:p-12"
        >
          <HandHeart className="absolute left-6 top-6 h-8 w-8 text-primary/70" />
          <div className="mx-auto max-w-2xl space-y-3 text-center font-serif text-xl italic leading-relaxed text-night md:text-2xl">
            <p>Tu n'as pas besoin d'aller mieux pour commencer.</p>
            <p>Tu n'as pas besoin d'être parfaitement organisée.</p>
            <p>Tu n'as pas besoin d'avoir plus de temps.</p>
            <p className="not-italic font-sans text-base text-foreground/75 md:text-lg">
              Tu as simplement besoin d'un point d'appui.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* COMMENT ÇA MARCHE */}
      <Section id="pour-toi">
        <motion.div {...fadeUp} className="text-center">
          <p className="inline-block font-semibold uppercase tracking-[0.24em] text-[11px] text-night">
            Comment ça{" "}
            <span className="relative inline-block">
              marche
              <HandUnderline />
            </span>
          </p>
        </motion.div>
        <div className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {[
            { n: "01", t: "Ressentir", d: "Check-in émotionnel en moins de 30 secondes.", e: "🧠" },
            { n: "02", t: "Réguler", d: "Des exercices simples quand tout déborde.", e: "🌸" },
            { n: "03", t: "Observer", d: "Comprendre ce qui revient et ce qui t'aide.", e: "🔍" },
          ].map((s, i, arr) => (
            <>
              <motion.div
                {...fadeUp}
                key={s.n}
                className="flex flex-col rounded-[1.75rem] bg-card p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-night text-sm font-semibold text-night-foreground">
                    {s.n}
                  </span>
                  <span className="text-2xl">{s.e}</span>
                </div>
                <h3 className="mt-5 font-serif text-xl text-night">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{s.d}</p>
              </motion.div>
              {i < arr.length - 1 && (
                <div key={`${s.n}-arr`} className="hidden items-center justify-center md:flex">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              )}
            </>
          ))}
        </div>
      </Section>

      {/* FAMILLES ATYPIQUES + HISTOIRE FONDATRICE */}
      <Section id="familles">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bloc bleu nuit — familles atypiques */}
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] bg-night p-8 text-night-foreground md:p-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
              Pensé pour les familles
            </p>
            <h2 className="mt-2 font-serif text-2xl leading-tight md:text-3xl">
              <span className="relative inline-block text-primary">
                qui avancent autrement.
                <HandUnderline />
              </span>
            </h2>
            <div className="mt-7 grid grid-cols-3 gap-4 sm:grid-cols-6 md:grid-cols-3 lg:grid-cols-6">
              {familles.map((f) => (
                <div key={f.t} className="flex flex-col items-center text-center">
                  <span className="text-2xl">{f.e}</span>
                  <span className="mt-2 text-[11px] font-medium uppercase tracking-wider text-night-foreground/85">
                    {f.t}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-1 text-sm leading-relaxed text-night-foreground/85">
              <p>Chaque famille avance à son rythme.</p>
              <p className="font-semibold text-night-foreground">Ancrage respecte ce rythme.</p>
            </div>
            <HandHeart className="mt-4 h-5 w-5 text-primary" />
          </motion.div>

          {/* Histoire fondatrice */}
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] bg-card p-8 md:p-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Pourquoi Ancrage existe ?
            </p>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/85">
              <p>
                Je m'appelle <span className="font-semibold text-night">Élodie</span>. Je suis maman,
                belle-maman, maman d'enfants atypiques.
              </p>
              <p>
                Comme beaucoup de parents, j'ai connu les rendez-vous qui s'enchaînent.{" "}
                <span className="font-semibold text-night">La charge mentale.</span> La peur.
                L'épuisement. Les moments où tout semble trop lourd.
              </p>
              <p className="text-primary">
                J'avais besoin d'un endroit simple pour souffler, me recentrer et retrouver des
                repères.
              </p>
              <p>
                Alors j'ai créé l'outil que j'aurais aimé avoir dans les périodes les plus
                difficiles.
              </p>
              <p className="font-serif text-base italic text-night">
                Ancrage est né de la vraie vie. Pas d'une théorie.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* TRANSFORMATION TIMELINE */}
      <Section id="quotidien">
        <motion.div {...fadeUp} className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-night">
            Quelques jours suffisent à sentir la différence
            <HandHeart className="h-4 w-4 text-primary" />
          </p>
        </motion.div>
        <div className="mt-12 grid items-start gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {timeline.map((s, i, arr) => (
            <>
              <motion.div {...fadeUp} key={s.d} className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card text-2xl">
                  {s.icon}
                </span>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-night">
                  {s.d}
                </p>
                <p className="mt-1.5 text-sm leading-snug text-foreground/75">{s.t}</p>
              </motion.div>
              {i < arr.length - 1 && (
                <div key={`${s.d}-arr`} className="hidden items-center justify-center pt-5 md:flex">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
              )}
            </>
          ))}
        </div>
      </Section>

      {/* OFFRE — carte tarif */}
      <Section id="offre">
        <motion.div {...fadeUp} className="mx-auto max-w-md">
          <div className="rounded-[1.75rem] bg-card p-10 text-center shadow-[0_40px_100px_-40px_rgba(24,33,52,0.22)]">
            <Eyebrow>Ancrage</Eyebrow>
            <p className="mt-5 font-serif text-[clamp(3rem,6vw,4rem)] leading-none text-night">
              {PREMIUM_PRICE_SHORT}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Paiement unique · Accès à vie
            </p>
            <ul className="mx-auto mt-8 max-w-xs space-y-2.5 text-left text-sm">
              {[
                "Accès immédiat",
                "Sans abonnement",
                "Mises à jour incluses",
                "Mobile & ordinateur",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground/85">
                  <HandHeart className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CTAButton />
            </div>
          </div>
        </motion.div>
      </Section>

      {/* FAQ */}
      <div className="bg-secondary/60">
        <HomeFAQ />
      </div>

      {/* CTA FINAL — bleu nuit avec bouton jaune */}
      <section id="pour-enfant" className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[1.75rem] bg-night px-8 py-16 text-night-foreground md:grid md:grid-cols-[1.2fr_1fr] md:gap-10 md:px-14 md:py-20"
          >
            <HandHeart className="absolute right-8 top-8 h-8 w-8 text-primary/70" />
            <div>
              <h2 className="font-serif text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.1] text-night-foreground">
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
              <CTAButton />
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
