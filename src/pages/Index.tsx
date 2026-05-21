import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ArrowRight, Menu, X, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG, PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import avatarCamille from "@/assets/avatar-camille.jpg";
import avatarInes from "@/assets/avatar-ines.jpg";
import avatarLea from "@/assets/avatar-lea.jpg";

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
  <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-[1200px]">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
    {children}
  </p>
);

// --- Phone mockup (Hero) ----------------------------------------------------
const PhoneMockup = () => (
  <div className="relative mx-auto w-[260px] md:w-[300px]">
    {/* floating cards */}
    <div className="pointer-events-none absolute -left-10 top-10 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-soft md:block">
      ❤️ Check-in
    </div>
    <div className="pointer-events-none absolute -right-12 top-32 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-soft md:block">
      🌿 Exercice
    </div>
    <div className="pointer-events-none absolute -left-14 bottom-16 hidden rounded-2xl border border-border bg-card px-3 py-2 text-xs shadow-soft md:block">
      📈 Calme +38%
    </div>

    <div className="rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_40px_100px_-30px_rgba(27,32,53,0.18)]">
      <div className="overflow-hidden rounded-[2rem] bg-background">
        <div className="flex items-center justify-between px-5 pt-4 pb-2 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <span className="h-1.5 w-10 rounded-full bg-foreground/15" />
        </div>
        <div className="px-5 pt-2 pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ancrage</p>
          <p className="mt-1 font-serif text-xl leading-tight">Bonjour Camille</p>
        </div>
        <div className="mx-5 rounded-2xl border border-border bg-secondary p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Check-in</p>
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
          {[
            { l: "Jour", v: "12" },
            { l: "Calme", v: "+38%" },
          ].map((t) => (
            <div key={t.l} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{t.l}</p>
              <p className="mt-0.5 font-serif text-lg">{t.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppScreen = ({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) => (
  <div className="w-[240px] shrink-0 snap-start">
    <div className="rounded-[2rem] border border-border bg-card p-2.5 shadow-[0_20px_50px_-20px_rgba(27,32,53,0.15)]">
      <div className="aspect-[9/16] overflow-hidden rounded-[1.6rem] bg-background p-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{kicker}</p>
        <p className="mt-1 font-serif text-base leading-tight">{title}</p>
        <div className="mt-3 space-y-2">{children}</div>
      </div>
    </div>
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-secondary px-3 py-2 text-[11px] text-foreground/80">
    {children}
  </div>
);

// ---------------------------------------------------------------------------

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

  const navLinks = [
    { href: "#dans-ancrage", label: "Fonctionnalités" },
    { href: "#lies-autrement", label: "Pour qui" },
    { href: "#temoignages", label: "Témoignages" },
    { href: "#faq", label: "FAQ" },
  ];

  const problems = [
    { e: "🌀", t: "Je porte tout", d: "Charge mentale." },
    { e: "🔥", t: "Je déborde", d: "Émotions difficiles." },
    { e: "🤝", t: "Mon enfant déborde", d: "Transitions, crises." },
    { e: "🧠", t: "J'oublie tout", d: "Organisation impossible." },
  ];

  const featuresFor = ["Check-ins émotionnels", "Parcours guidé", "Journal", "Progression", "Exercices"];
  const featuresChild = ["Crises guidées", "Comprendre ses émotions", "Activités", "Outils adaptés", "LSF"];
  const featuresDaily = ["Rendez-vous", "Médicaments", "Fiche urgence", "Ressources", "Rappels"];

  const liesCards = [
    { e: "🧩", t: "Comprendre son fonctionnement" },
    { e: "🧠", t: "Accompagner les émotions" },
    { e: "🖐️", t: "LSF" },
    { e: "🧸", t: "Activités adaptées" },
    { e: "🚨", t: "Gestion des crises" },
  ];

  const timeline = [
    { d: "Jour 1", t: "je remarque" },
    { d: "Jour 7", t: "je repère" },
    { d: "Jour 21", t: "je récupère" },
    { d: "Jour 30", t: "ça devient plus automatique" },
  ];

  const testimonials = [
    {
      name: "Camille",
      avatar: avatarCamille,
      before: "Je m'énervais sans comprendre pourquoi.",
      used: "Check-in du matin + bouton « Ça déborde ».",
      changed: "Je vois venir mes vagues avant qu'elles cassent.",
    },
    {
      name: "Inès",
      avatar: avatarInes,
      before: "Les crises de mon fils me submergeaient.",
      used: "Crise guidée + fiche d'urgence.",
      changed: "On a un langage commun.",
    },
    {
      name: "Léa",
      avatar: avatarLea,
      before: "Je portais tout, sans repère.",
      used: "Journal + parcours 21 jours.",
      changed: "Je me retrouve.",
    },
  ];

  const CTAButton = ({
    label = `Je récupère mon calme — ${PREMIUM_PRICE_LONG}`,
    variant = "primary",
  }: {
    label?: string;
    variant?: "primary" | "white";
  }) => (
    <button
      type="button"
      onClick={handlePay}
      disabled={paymentLoading}
      className={
        variant === "white"
          ? "inline-flex items-center justify-center gap-2 rounded-full bg-background px-7 py-4 text-sm font-semibold text-foreground shadow-soft-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
          : "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-[hsl(351_60%_60%)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
      }
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/" className="font-serif text-xl tracking-tight">
            Ancrage
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-foreground/75 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:block">
            <button
              type="button"
              onClick={handlePay}
              disabled={paymentLoading}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-[hsl(351_60%_60%)] disabled:opacity-60"
            >
              Je récupère mon calme — {PREMIUM_PRICE_SHORT}
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
                className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                Je récupère mon calme — {PREMIUM_PRICE_SHORT}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <Section className="pt-8 md:pt-12">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
          <motion.div {...fadeUp}>
            <Eyebrow>Bien-être émotionnel — parents & enfants</Eyebrow>
            <h1 className="mt-5 font-serif text-[clamp(2.4rem,6.5vw,4rem)] font-normal leading-[1.02] tracking-tight">
              Tu n'achètes pas un outil.
              <br />
              <span className="italic text-primary">Tu retrouves un repère.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/75 md:text-lg">
              Quand tout déborde, Ancrage t'aide à ralentir, retrouver du calme et remettre du repère
              dans ton quotidien — pour toi, ton enfant et votre famille.
            </p>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground/70">
              {["Paiement unique", "Accès à vie", "Mobile + ordinateur"].map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CTAButton />
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Sans abonnement</span>
                <span aria-hidden>·</span>
                <span>Accès immédiat</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Paiement sécurisé
                </span>
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <PhoneMockup />
          </motion.div>
        </div>
      </Section>

      {/* PROBLÈME */}
      <Section className="bg-secondary/50">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Tu te reconnais ?</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Quand tout devient <span className="italic text-primary">trop</span>…
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <motion.div
              {...fadeUp}
              key={p.t}
              className="rounded-[1.75rem] border border-border bg-card p-7 transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="text-2xl">{p.e}</div>
              <h3 className="mt-4 font-serif text-xl">{p.t}</h3>
              <p className="mt-1.5 text-sm text-foreground/65">{p.d}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-12 text-center font-serif text-xl italic text-foreground/80">
          Tu n'as pas besoin d'aller mieux pour commencer.
        </p>
      </Section>

      {/* COMMENT ÇA MARCHE */}
      <Section>
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Comment ça marche</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            30 secondes. <span className="italic text-primary">Une fois par jour.</span>
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Ressentir", d: "Check-in émotion rapide." },
            { n: "02", t: "Réguler", d: "Exercices adaptés." },
            { n: "03", t: "Observer", d: "Voir l'évolution." },
          ].map((s) => (
            <motion.div
              {...fadeUp}
              key={s.n}
              className="rounded-[1.75rem] border border-border bg-card p-8"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{s.n}</p>
              <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-foreground/70">{s.d}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm italic text-muted-foreground">
          Chaque famille avance à son rythme.
        </p>
      </Section>

      {/* DANS ANCRAGE */}
      <Section id="dans-ancrage" className="bg-secondary/50">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Contenu</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Ce qu'il y a dans Ancrage
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { i: "🌿", t: "Pour toi", l: featuresFor, link: "/comprendre" },
            { i: "🤝", t: "Pour ton enfant", l: featuresChild, link: "/lies-autrement" },
            { i: "🩺", t: "Pour le quotidien", l: featuresDaily, link: "/sante" },
          ].map((col) => (
            <motion.div
              {...fadeUp}
              key={col.t}
              className="flex flex-col rounded-[1.75rem] border border-border bg-card p-8"
            >
              <div className="text-2xl">{col.i}</div>
              <h3 className="mt-3 font-serif text-2xl">{col.t}</h3>
              <ul className="mt-5 space-y-2.5">
                {col.l.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={col.link}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                En savoir plus <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* LIÉS AUTREMENT */}
      <Section id="lies-autrement">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <motion.div {...fadeUp}>
            <Eyebrow>Liés autrement</Eyebrow>
            <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
              Et si ton enfant <span className="italic text-primary">avance autrement</span> ?
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75">
              Pensé pour les familles TSA, TDAH, DYS, enfants sourds ou en questionnement.
            </p>
            <Link
              to="/lies-autrement"
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Découvrir Liés autrement <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div {...fadeUp} className="grid grid-cols-2 gap-3">
            {liesCards.map((c) => (
              <div
                key={c.t}
                className="rounded-[1.75rem] border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="text-xl">{c.e}</div>
                <p className="mt-3 text-sm leading-snug text-foreground/85">{c.t}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* APPLICATION */}
      <Section className="bg-secondary/50">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Dans l'application</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Conçue pour être utilisée. <span className="italic text-primary">Pas explorée.</span>
          </h2>
        </motion.div>
        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-6">
          <AppScreen kicker="Écran" title="Dashboard">
            <Pill>☀️ Matin · fait</Pill>
            <Pill>🌙 Soir · à faire</Pill>
            <Pill>Calme +38%</Pill>
          </AppScreen>
          <AppScreen kicker="Écran" title="Check-in">
            <Pill>Comment tu te sens ?</Pill>
            <Pill>😌 😐 😣 😶 🌧</Pill>
            <Pill>30 sec</Pill>
          </AppScreen>
          <AppScreen kicker="Écran" title="Urgence">
            <Pill>Ça déborde</Pill>
            <Pill>Respiration guidée</Pill>
            <Pill>Fiche d'aide</Pill>
          </AppScreen>
          <AppScreen kicker="Écran" title="Journal">
            <Pill>Mettre des mots</Pill>
            <Pill>Cartes adaptées</Pill>
            <Pill>Anticiper</Pill>
          </AppScreen>
          <AppScreen kicker="Écran" title="Progression">
            <Pill>Jour 12</Pill>
            <Pill>Calme +38%</Pill>
            <Pill>Repère stable</Pill>
          </AppScreen>
        </div>
        <p className="mt-6 text-center font-serif text-lg italic text-foreground/75">
          Moins de clics. Plus de repères.
        </p>
      </Section>

      {/* RÉSULTATS */}
      <Section>
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Ce qui change</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Quelques jours suffisent à <span className="italic text-primary">sentir la différence</span>.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {timeline.map((s, i) => (
            <motion.div {...fadeUp} key={s.d}>
              <div className="rounded-[1.75rem] border border-border bg-card p-6">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Étape 0{i + 1}
                </p>
                <p className="mt-3 font-serif text-xl">{s.d}</p>
                <p className="mt-1 text-sm italic text-foreground/70">→ {s.t}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm italic text-muted-foreground">
          Chaque famille avance à son rythme.
        </p>
      </Section>

      {/* TÉMOIGNAGES */}
      <Section id="temoignages" className="bg-secondary/50">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Témoignages</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Ce qu'elles racontent, <span className="italic text-primary">après</span>.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((m) => (
            <motion.div
              {...fadeUp}
              key={m.name}
              className="flex flex-col rounded-[1.75rem] border border-border bg-card p-7"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <p className="font-serif text-lg">{m.name}</p>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Avant</p>
                  <p className="mt-1 text-foreground/80">{m.before}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Ce qu'elle a utilisé
                  </p>
                  <p className="mt-1 text-foreground/80">{m.used}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Ce qui a changé
                  </p>
                  <p className="mt-1 font-serif text-base italic text-primary">{m.changed}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* OFFRE */}
      <Section id="offre">
        <motion.div {...fadeUp} className="mx-auto max-w-md">
          <div className="rounded-[1.75rem] border border-border bg-card p-10 text-center shadow-[0_40px_100px_-40px_rgba(27,32,53,0.22)]">
            <Eyebrow>Ancrage</Eyebrow>
            <p className="mt-5 font-serif text-[clamp(3rem,6vw,4rem)] leading-none">
              {PREMIUM_PRICE_SHORT}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Paiement unique
            </p>
            <ul className="mx-auto mt-8 max-w-xs space-y-2.5 text-left text-sm">
              {[
                "Accès à vie",
                "Mises à jour",
                "Aucun abonnement",
                "Mobile",
                "Ordinateur",
                "Accès immédiat",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground/85">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CTAButton label="Je récupère mon calme" />
            </div>
            <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Paiement sécurisé SSL
            </p>
          </div>
        </motion.div>
      </Section>

      {/* FAQ */}
      <div className="bg-secondary/50">
        <HomeFAQ />
      </div>

      {/* CTA FINAL — gradient corail × rose premium */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1100px]">
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] bg-cta-gradient px-8 py-20 text-center text-primary-foreground shadow-[0_50px_120px_-40px_rgba(228,107,98,0.45)] md:px-16"
          >
            <h2 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">
              Tu n'as pas besoin
              <br />
              d'aller mieux
              <br />
              <span className="italic">pour commencer.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-md text-base text-primary-foreground/85">
              Commence petit. Commence aujourd'hui.
            </p>
            <div className="mt-10">
              <CTAButton variant="white" label={`Commencer maintenant — ${PREMIUM_PRICE_SHORT}`} />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
