import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { motion } from "framer-motion";
import { Check, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import logo from "@/assets/logo-ancrage.png";
import avatarCamille from "@/assets/avatar-camille.jpg";
import avatarInes from "@/assets/avatar-ines.jpg";
import avatarLea from "@/assets/avatar-lea.jpg";

const TESTIMONIAL_AVATARS: Record<string, string> = {
  Camille: avatarCamille,
  Inès: avatarInes,
  Léa: avatarLea,
};

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/&action=pay";
      return;
    }
    startPayment();
  };

  const steps = [
    { num: "1", text: t("home.how.step1") },
    { num: "2", text: t("home.how.step2") },
    { num: "3", text: t("home.how.step3") },
  ];
  const projection = [t("home.projection.i1"), t("home.projection.i2"), t("home.projection.i3")];
  type RecognizeScene = { tag: string; emoji: string; body: string; punch: string };
  const recognizeMainScenes = t("home.recognize.scenes", { returnObjects: true }) as RecognizeScene[];
  const recognizeExtras = [
    { emoji: t("home.recognize.s1_emoji"), text: t("home.recognize.s1") },
    { emoji: t("home.recognize.s2_emoji"), text: t("home.recognize.s2") },
  ];
  const beforeItems = t("home.before_after.before", { returnObjects: true }) as string[];
  const afterItems = t("home.before_after.after", { returnObjects: true }) as string[];
  type IdentityPillar = {
    icon: string;
    identity: string;
    concrete: string;
    proof: string;
    metric_label: string;
    metric_baseline: string;
    forecast_7d: string;
    forecast_30d: string;
  };
  const identityPillars = t("home.identity.pillars", { returnObjects: true }) as IdentityPillar[];
  type TestimonialMetric = { label: string; before: string; after: string };
  type Testimonial = {
    name: string;
    context: string;
    delay: string;
    before: string;
    result: string;
    metrics: TestimonialMetric[];
  };
  const testimonials = t("home.testimonials.items", { returnObjects: true }) as Testimonial[];
  type TimelineStep = { label: string; text: string };
  const timelineSteps = t("home.timeline.steps", { returnObjects: true }) as TimelineStep[];
  const features = [
    t("paywall.features.ritual"),
    t("paywall.features.emergency"),
    t("paywall.features.health"),
    t("paywall.features.resources"),
    t("paywall.features.notes"),
    t("paywall.features.badges"),
    t("paywall.features.journey"),
    t("paywall.features.lifetime"),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background">
      <div className="flex items-center justify-between px-4 py-3">
        <div />
        <Link to="/" className="flex flex-col items-center">
          <img src={logo} alt="Ancrage" className="h-12 w-auto" />
        </Link>
        <Link
          to={user ? "/profil" : "/auth"}
          className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
        >
          <User className="h-3.5 w-3.5" />
          {user ? t("nav.my_space") : t("nav.login")}
        </Link>
      </div>

      <SectionBlock variant="blue">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 text-center"
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            {t("home.hero.line1")}
            <br />
            {t("home.hero.line2")}
            <br />
            <span className="text-primary">{t("home.hero.line3")}</span>
          </h1>
          <div className="space-y-2 pt-2">
            <p className="font-semibold">{t("home.hero.rea1")}</p>
            <p className="text-sm text-primary font-medium">{t("home.hero.rea2")}</p>
          </div>
          <div className="pt-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              🤍 {t("home.hero.reassurance")}
            </p>
            <CTAButton to="/emotions">{t("home.hero.cta")}</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* Recognize — ouverture par la douleur incarnée (3 micro-scènes : soir / corps / tête) */}
      <SectionBlock>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.recognize.title")}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("home.recognize.subtitle")}
            </p>
          </div>

          {/* 3 scènes principales — corps / tête / soir */}
          <div className="space-y-4">
            {recognizeMainScenes.map((s, i) => (
              <article
                key={i}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none" aria-hidden>{s.emoji}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {s.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {s.body}
                </p>
                <p className="border-l-2 border-primary/40 pl-3 text-sm font-semibold italic leading-snug">
                  {s.punch}
                </p>
              </article>
            ))}
          </div>

          {/* Scènes bonus — reconnaissance élargie */}
          <div className="space-y-3 pt-2">
            <p className="text-center text-xs text-muted-foreground italic">
              {t("home.recognize.extra_intro")}
            </p>
            {recognizeExtras.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3 shadow-sm"
              >
                <span className="text-lg leading-none shrink-0" aria-hidden>{s.emoji}</span>
                <p className="text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          {/* Outro — pont vers la solution */}
          <p className="text-center text-sm font-semibold text-primary leading-relaxed pt-2 max-w-md mx-auto">
            {t("home.recognize.outro")}
          </p>
        </div>
      </SectionBlock>

      {/* Enemy — "Ce n'est pas toi le problème" */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold md:text-2xl">{t("home.enemy.title")}</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>{t("home.enemy.p1")}</p>
            <p>{t("home.enemy.p2")}</p>
            <p>{t("home.enemy.p3")}</p>
          </div>
          <p className="rounded-xl bg-primary/10 border border-primary/20 p-4 font-semibold text-primary">
            {t("home.enemy.highlight")}
          </p>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">{t("home.mechanism.title")}</p>
          <p className="text-primary font-medium">{t("home.mechanism.subtitle")}</p>
          <div className="space-y-2 text-muted-foreground">
            <p>{t("home.mechanism.p1")}</p>
            <p>{t("home.mechanism.p2")}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock variant="blue">
        <h2 className="mb-2 text-xl font-bold text-center">{t("home.how.title")}</h2>
        <p className="mb-6 text-sm text-primary font-medium text-center">{t("home.how.subtitle")}</p>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.num}
              </span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">{t("home.urgency.title")}</p>
          <p className="font-semibold text-primary">{t("home.urgency.subtitle")}</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t("home.urgency.p1")}</p>
            <p>{t("home.urgency.p2")}</p>
          </div>
          <p className="font-medium">{t("home.urgency.p3")}</p>
        </div>
      </SectionBlock>

      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">{t("home.projection.title")}</p>
          <ul className="space-y-3">
            {projection.map((item) => (
              <li key={item} className="flex items-center justify-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionBlock>

      {/* Before / After — récit transformationnel */}
      <SectionBlock>
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.before_after.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.before_after.subtitle")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                {t("home.before_after.before_label")}
              </p>
              <ul className="space-y-2.5 text-sm leading-relaxed">
                {beforeItems.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {t("home.before_after.after_label")}
              </p>
              <ul className="space-y-2.5 text-sm leading-relaxed">
                {afterItems.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Identity — promesse d'identité reliée à preuves & bénéfices concrets */}
      <SectionBlock variant="blue">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.identity.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.identity.subtitle")}</p>
          </div>

          {/* Promesse centrale */}
          <div className="rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 p-6 text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
              La version de toi qui t'attend
            </p>
            <p className="font-serif text-3xl font-semibold text-primary">
              {t("home.identity.promise")}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed pt-1 max-w-md mx-auto">
              {t("home.identity.definition")}
            </p>
          </div>

          {/* 3 piliers : identité → concret → preuve */}
          <div className="space-y-4">
            {identityPillars.map((p, i) => (
              <article
                key={i}
                className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none shrink-0" aria-hidden>{p.icon}</span>
                  <p className="font-serif text-base font-semibold leading-snug">
                    « {p.identity} »
                  </p>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {p.concrete}
                </p>
                <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                  <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    <span className="font-semibold text-primary">Concrètement dans Ancrage : </span>
                    {p.proof}
                  </p>
                </div>

                {/* Indicateur mesurable + mini prévision réaliste */}
                <div className="rounded-xl border border-border bg-background/60 p-3 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                    📊 {p.metric_label}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 text-xs leading-relaxed">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground/70">Aujourd'hui : </span>
                      {p.metric_baseline}
                    </p>
                    <p className="text-foreground/85">
                      <span className="font-semibold text-primary">À J+7 : </span>
                      {p.forecast_7d}
                    </p>
                    <p className="text-foreground/85">
                      <span className="font-semibold text-primary">À J+30 : </span>
                      {p.forecast_30d}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Caveat : pas de promesse universelle */}
          <p className="text-center text-[11px] text-muted-foreground italic leading-relaxed max-w-md mx-auto pt-1">
            {t("home.identity.metric_caveat")}
          </p>

          {/* Pont émotionnel */}
          <p className="text-center text-sm font-medium text-foreground/90 italic max-w-md mx-auto pt-1">
            {t("home.identity.bridge")}
          </p>
        </div>
      </SectionBlock>

      {/* Preuve sociale enrichie */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold text-primary">{t("home.social.p1")}</p>
          <blockquote className="rounded-2xl bg-card border border-border p-5 text-sm italic leading-relaxed shadow-sm text-start">
            {t("home.social.p2")}
          </blockquote>
          <p className="text-sm text-muted-foreground italic">{t("home.social.p3")}</p>
        </div>
      </SectionBlock>

      {/* Témoignages nommés avec délais et résultats mesurables */}
      <SectionBlock variant="blue">
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.testimonials.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.testimonials.subtitle")}</p>
          </div>
          <div className="space-y-4">
            {testimonials.map((tst, i) => (
              <article
                key={i}
                className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {TESTIMONIAL_AVATARS[tst.name] && (
                      <img
                        src={TESTIMONIAL_AVATARS[tst.name]}
                        alt={`Portrait illustré de ${tst.name}`}
                        loading="lazy"
                        width={56}
                        height={56}
                        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/15 shadow-sm"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{tst.name}</p>
                      <p className="text-xs text-muted-foreground">{tst.context}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                    {tst.delay}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Avant : {tst.before}
                </p>
                <blockquote className="text-sm leading-relaxed border-l-2 border-primary/40 pl-3">
                  {tst.result}
                </blockquote>
                <ul className="space-y-2 pt-1">
                  {tst.metrics.map((m, mi) => (
                    <li
                      key={mi}
                      className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2"
                    >
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                          {m.label}
                        </p>
                        <p className="text-xs text-foreground/85 leading-snug mt-0.5">
                          <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                            {m.before}
                          </span>
                          <span className="mx-1.5 text-primary font-bold" aria-hidden>→</span>
                          <span className="font-semibold text-primary">{m.after}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="text-center text-[11px] text-muted-foreground italic pt-1">
            {t("home.testimonials.disclaimer")}
          </p>

          {/* CTA témoignages : transition émotionnelle → bouton → réassurance */}
          <div className="rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 p-5 mt-2 space-y-3 text-center">
            <p className="font-serif text-lg font-semibold text-primary leading-snug">
              {t("home.testimonials.cta_lead")}
            </p>
            <p className="text-sm text-foreground/85 leading-relaxed max-w-md mx-auto">
              {t("home.testimonials.cta_sub")}
            </p>
            <div className="pt-1">
              <CTAButton to="/emotions">{t("home.testimonials.cta")}</CTAButton>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t("home.testimonials.cta_justify")}
            </p>
            <div className="pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground mb-2">
                Pas encore prête à t'engager ?
              </p>
              <a
                href="/initiation-7-jours"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Commencer mes 7 jours d'ancrage — gratuit →
              </a>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Timeline globale — ce qui change semaine après semaine */}
      <SectionBlock>
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.timeline.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.timeline.subtitle")}</p>
          </div>
          <ol className="relative border-l-2 border-primary/20 pl-5 space-y-5">
            {timelineSteps.map((step, i) => (
              <li key={i} className="relative">
                <span
                  className="absolute -left-[27px] flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background"
                  aria-hidden
                />
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {step.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="text-center text-[11px] text-muted-foreground italic">
            {t("home.timeline.footnote")}
          </p>
        </div>
      </SectionBlock>

      <HomeFAQ />

      <SectionBlock variant="blue">
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t("home.price.access")}</p>
          <p className="mt-1 text-2xl font-bold text-primary">ANCRAGE</p>

          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            <p className="text-3xl font-bold">{t("home.price.amount")}</p>
            <p className="text-xs text-muted-foreground">{t("home.price.subtitle")}</p>
            <div className="space-y-1 text-sm text-muted-foreground text-start pt-2">
              {features.map((f) => (
                <p key={f}>✔ {f}</p>
              ))}
            </div>
          </div>

          <p className="mt-4 mb-2 text-xs text-muted-foreground italic px-2">
            🤍 {t("home.price.reassurance")}
          </p>
          <div>
            <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>
              {t("home.price.cta")}
            </CTAButton>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">{t("home.price.note")}</p>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>{t("home.price.secure")}</span>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">{t("home.final.title")}</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{t("home.final.p1")}</p>
            <p>{t("home.final.p2")}</p>
            <p>{t("home.final.p3")}</p>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">
              🤍 {t("home.final.reassurance")}
            </p>
            <CTAButton to="/emotions">{t("home.final.cta")}</CTAButton>
          </div>
        </div>
      </SectionBlock>

      <Footer />
    </div>
  );
};

export default Index;
