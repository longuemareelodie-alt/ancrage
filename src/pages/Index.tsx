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
  const recognizeScenes = [
    { emoji: t("home.recognize.s1_emoji"), text: t("home.recognize.s1") },
    { emoji: t("home.recognize.s2_emoji"), text: t("home.recognize.s2") },
    { emoji: t("home.recognize.s3_emoji"), text: t("home.recognize.s3") },
    { emoji: t("home.recognize.s4_emoji"), text: t("home.recognize.s4") },
  ];
  const beforeItems = t("home.before_after.before", { returnObjects: true }) as string[];
  const afterItems = t("home.before_after.after", { returnObjects: true }) as string[];
  const identityPoints = [
    t("home.identity.p1"),
    t("home.identity.p2"),
    t("home.identity.p3"),
  ];
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
          <div className="pt-2">
            <CTAButton to="/emotions">{t("home.hero.cta")}</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* Recognize — "Tu te reconnais ?" : douleur incarnée */}
      <SectionBlock>
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.recognize.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.recognize.subtitle")}</p>
          </div>
          <div className="space-y-3">
            {recognizeScenes.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="text-2xl leading-none shrink-0" aria-hidden>{s.emoji}</span>
                <p className="text-sm leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-primary pt-2">
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

      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">{t("home.social.p1")}</p>
          <p className="font-semibold">{t("home.social.p2")}</p>
          <p className="text-sm text-muted-foreground italic">{t("home.social.p3")}</p>
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

          <div className="mt-4">
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
          <div className="mt-4">
            <CTAButton to="/emotions">{t("home.final.cta")}</CTAButton>
          </div>
        </div>
      </SectionBlock>

      <Footer />
    </div>
  );
};

export default Index;
