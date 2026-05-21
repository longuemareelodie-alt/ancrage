import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { motion } from "framer-motion";
import { User, Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { PREMIUM_PRICE_LONG, PREMIUM_PRICE_SHORT } from "@/lib/premiumOffer";
import avatarCamille from "@/assets/avatar-camille.jpg";
import avatarInes from "@/assets/avatar-ines.jpg";
import avatarLea from "@/assets/avatar-lea.jpg";

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
  <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-[1200px]">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
    {children}
  </p>
);

// --- Phone mockup (Hero) ----------------------------------------------------
const PhoneMockup = () => (
  <div className="relative mx-auto w-[260px] md:w-[300px]">
    <div className="rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)]">
      <div className="overflow-hidden rounded-[2rem] bg-background">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <span className="h-1.5 w-10 rounded-full bg-foreground/20" />
        </div>
        {/* header */}
        <div className="px-5 pt-2 pb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ancrage</p>
          <p className="mt-1 font-serif text-xl leading-tight">Bonjour Camille</p>
        </div>
        {/* check-in card */}
        <div className="mx-5 rounded-2xl border border-border bg-secondary p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Check-in</p>
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
        {/* deborde button */}
        <div className="mx-5 mt-3">
          <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-sm font-medium">Ça déborde</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
        {/* dashboard tiles */}
        <div className="mx-5 mt-3 mb-5 grid grid-cols-2 gap-2">
          {[
            { l: "Jour", v: "12" },
            { l: "Calme", v: "+38%" },
          ].map((t) => (
            <div key={t.l} className="rounded-xl border border-border bg-card p-3">
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{t.l}</p>
              <p className="mt-0.5 font-serif text-lg">{t.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Faux app screen (carousel) ---------------------------------------------
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
    <div className="rounded-[2rem] border border-border bg-card p-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]">
      <div className="aspect-[9/16] overflow-hidden rounded-[1.6rem] bg-background p-4">
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{kicker}</p>
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
  const { user } = useAuth();
  const { t } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePay = () => startPayment();

  const featuresFor = [
    "Check-ins émotionnels",
    "Parcours guidé",
    "Journal",
    "Progression",
    "Exercices",
  ];
  const featuresChild = [
    "Crises guidées",
    "Comprendre ses émotions",
    "Activités",
    "Outils adaptés",
    "LSF",
  ];
  const featuresDaily = ["RDV", "Médicaments", "Fiche urgence", "Ressources", "Rappels"];

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
      changed: "On a un langage commun. On respire ensemble.",
    },
    {
      name: "Léa",
      avatar: avatarLea,
      before: "Je portais tout, sans repère.",
      used: "Journal + parcours 21 jours.",
      changed: "Je me retrouve. Le calme revient plus vite.",
    },
  ];

  const CTA = ({ label = `Je récupère mon calme — ${PREMIUM_PRICE_LONG}` }: { label?: string }) => (
    <button
      type="button"
      onClick={handlePay}
      disabled={paymentLoading}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-tight">
            Ancrage
          </Link>
          <Link
            to={user ? "/profil" : "/auth"}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:bg-secondary"
          >
            <User className="h-3.5 w-3.5" />
            {user ? t("nav.my_space") : t("nav.login")}
          </Link>
        </div>
      </header>

      {/* PAGE 1 — HERO */}
      <Section className="pt-6 md:pt-10">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
          <motion.div {...fadeUp}>
            <Eyebrow>Ancrage</Eyebrow>
            <h1 className="mt-5 font-serif text-[clamp(2.4rem,6vw,3.75rem)] font-normal leading-[1.05] tracking-tight">
              Tu n'achètes pas un outil.
              <br />
              <span className="italic text-primary">Tu retrouves un repère.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-foreground/75">
              Ancrage t'aide à redescendre quand tout déborde — pour toi, ton enfant et votre
              quotidien.
            </p>
            <div className="mt-9">
              <CTA />
              <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Paiement unique · Accès à vie · Mobile + ordinateur
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <PhoneMockup />
          </motion.div>
        </div>
      </Section>

      <div className="mx-auto h-px w-16 bg-foreground/10" />

      {/* PAGE 2 — COMMENT ÇA MARCHE */}
      <Section>
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Comment ça marche</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            30 secondes. Une fois par jour.
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
              className="rounded-2xl border border-border bg-card p-7"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {s.n}
              </p>
              <h3 className="mt-4 font-serif text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-foreground/70">{s.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/comparaison" className="text-sm text-foreground/70 underline-offset-4 hover:underline">
            Voir tout ce qui est inclus →
          </Link>
        </div>
      </Section>

      {/* PAGE 3 — CE QU'IL Y A DANS ANCRAGE */}
      <Section className="bg-secondary/40">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Dans Ancrage</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Ce qu'il y a dans Ancrage
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { i: "🌿", t: "Pour toi", l: featuresFor },
            { i: "🤝", t: "Pour ton enfant", l: featuresChild },
            { i: "🩺", t: "Pour le quotidien", l: featuresDaily },
          ].map((col) => (
            <motion.div
              {...fadeUp}
              key={col.t}
              className="rounded-2xl border border-border bg-card p-7"
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
            </motion.div>
          ))}
        </div>
      </Section>

      {/* PAGE 4 — LIÉS AUTREMENT */}
      <Section>
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <motion.div {...fadeUp}>
            <Eyebrow>Liés autrement</Eyebrow>
            <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
              Et si ton enfant <span className="italic text-primary">avance autrement</span> ?
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/75">
              Pensé pour les familles TSA, TDAH, DYS, sourdes ou en questionnement.
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
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="text-xl">{c.e}</div>
                <p className="mt-3 text-sm leading-snug text-foreground/85">{c.t}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* PAGE 5 — DANS L'APPLICATION */}
      <Section className="bg-secondary/40">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Dans l'application</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Conçue pour être ouverte, pas explorée.
          </h2>
        </motion.div>
        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-6">
          <AppScreen kicker="Écran 1" title="Dashboard">
            <Pill>☀️ Matin · fait</Pill>
            <Pill>🌙 Soir · à faire</Pill>
            <Pill>Calme +38%</Pill>
          </AppScreen>
          <AppScreen kicker="Écran 2" title="Check-in">
            <Pill>Comment tu te sens ?</Pill>
            <Pill>😌 😐 😣 😶 🌧</Pill>
            <Pill>30 sec</Pill>
          </AppScreen>
          <AppScreen kicker="Écran 3" title="Urgence">
            <Pill>Ça déborde</Pill>
            <Pill>Respiration guidée</Pill>
            <Pill>Fiche d'aide</Pill>
          </AppScreen>
          <AppScreen kicker="Écran 4" title="Émotions enfant">
            <Pill>Mettre des mots</Pill>
            <Pill>Cartes adaptées</Pill>
            <Pill>Anticiper</Pill>
          </AppScreen>
          <AppScreen kicker="Écran 5" title="Suivi santé">
            <Pill>Rendez-vous</Pill>
            <Pill>Médicaments</Pill>
            <Pill>Fiche urgence</Pill>
          </AppScreen>
        </div>
      </Section>

      {/* PAGE 6 — CE QUI CHANGE */}
      <Section>
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Ce qui change</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Quelques jours suffisent à <span className="italic text-primary">sentir la différence</span>.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {timeline.map((s, i) => (
            <motion.div {...fadeUp} key={s.d} className="relative">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
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

      {/* PAGE 7 — TÉMOIGNAGES */}
      <Section className="bg-secondary/40">
        <motion.div {...fadeUp} className="text-center">
          <Eyebrow>Témoignages</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-tight">
            Ce qu'elles racontent, après.
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((m) => (
            <motion.div
              {...fadeUp}
              key={m.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-7"
            >
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <p className="font-serif text-lg">{m.name}</p>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Avant</p>
                  <p className="mt-1 text-foreground/80">{m.before}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Ce qu'elle a utilisé
                  </p>
                  <p className="mt-1 text-foreground/80">{m.used}</p>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Ce qui a changé
                  </p>
                  <p className="mt-1 italic text-primary">{m.changed}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* PAGE 8 — TARIF */}
      <Section>
        <motion.div {...fadeUp} className="mx-auto max-w-md">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)]">
            <Eyebrow>Ancrage</Eyebrow>
            <p className="mt-5 font-serif text-[clamp(3rem,6vw,4rem)] leading-none">
              {PREMIUM_PRICE_SHORT}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Paiement unique
            </p>
            <ul className="mx-auto mt-8 max-w-xs space-y-2.5 text-left text-sm">
              {["Accès à vie", "Mises à jour", "Aucun abonnement", "Mobile", "Ordinateur"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-foreground/80">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-9">
              <CTA label="Je récupère mon calme" />
            </div>
          </div>
        </motion.div>
      </Section>

      {/* PAGE 9 — FAQ */}
      <div className="bg-secondary/40">
        <HomeFAQ />
      </div>

      {/* PAGE 10 — FOOTER CTA */}
      <Section>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] leading-tight">
            Tu n'as pas besoin d'aller mieux
            <br />
            <span className="italic text-primary">pour commencer.</span>
          </h2>
          <div className="mt-10">
            <CTA label="Commencer maintenant" />
          </div>
        </motion.div>
      </Section>

      <Footer />
    </div>
  );
};

export default Index;
