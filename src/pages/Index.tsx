import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import Footer from "@/components/Footer";
import HomeFAQ from "@/components/HomeFAQ";
import { motion } from "framer-motion";
import { Check, User, Lock, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useRouteTransition } from "@/components/RouteTransition";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { useParentType } from "@/hooks/useParentType";
import { useSchoolContext, SCHOOL_CONTEXT_LABELS } from "@/lib/schoolContext";
import {
  forgetLastQuickState,
  rememberLastQuickState,
  useLastQuickState,
} from "@/lib/lastQuickState";
import {
  markSlotDone,
  pickNextSlot,
  useDailyProgress,
  type DailySlot,
} from "@/lib/morningEveningProgress";

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
  const { t, i18n } = useTranslation();
  const { startPayment, loading: paymentLoading } = useMolliePayment();
  const { navigateWithTransition } = useRouteTransition();
  const [parentType, setParentType] = useParentType();
  const [schoolContext, setSchoolContext] = useSchoolContext();
  const lastQuickState = useLastQuickState();

  const handlePayment = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/&action=pay";
      return;
    }
    startPayment();
  };

  // Note : l'offre "Initiation 7 jours" à 4,99 € a été fusionnée dans
  // l'offre Premium. Plus de CTA dédié — le contenu reste accessible aux
  // utilisateurs Premium via /initiation-7-jours.

  const steps = [
    { num: "1", text: t("home.how.step1") },
    { num: "2", text: t("home.how.step2") },
    { num: "3", text: t("home.how.step3") },
  ];
  const projection = [t("home.projection.i1"), t("home.projection.i2"), t("home.projection.i3")];
  type RecognizeScene = {
    tag: string;
    emoji: string;
    body: string;
    punch: string;
    state?: "panique" | "hypervigilance" | "rumination" | "explosion";
    stateLabel?: string;
    cta?: string;
  };
  const scenesKey = parentType === "papa" ? "home.recognize.scenes_papa" : "home.recognize.scenes";
  const baseScenes = (() => {
    const v = t(scenesKey, { returnObjects: true });
    if (Array.isArray(v)) return v as RecognizeScene[];
    // Parent-tailored array missing → fall back to neutral scenes.
    const fallback = t("home.recognize.scenes", { returnObjects: true });
    return Array.isArray(fallback) ? (fallback as RecognizeScene[]) : [];
  })();

  // Context overrides (holiday / work): merged on top of the base scenes by
  // index — only the matin / soir scenes are rewritten, the body / mind
  // scenes stay identical. Robust fallback chain:
  //   parent+context override → neutral context override → no override
  // and any individual partial override only patches fields it actually
  // provides (empty strings are ignored so we never blank out a scene).
  const readOverrides = (
    key: string,
  ): Record<string, Partial<RecognizeScene>> | null => {
    if (!i18n.exists(key)) return null;
    const v = t(key, { returnObjects: true });
    return v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, Partial<RecognizeScene>>)
      : null;
  };
  const contextOverrides: Record<string, Partial<RecognizeScene>> =
    schoolContext === "school"
      ? {}
      : (parentType === "papa"
          ? readOverrides(`home.recognize.scenes_papa_${schoolContext}_overrides`)
          : null) ??
        readOverrides(`home.recognize.scenes_${schoolContext}_overrides`) ??
        {};

  const mergeOverride = (
    scene: RecognizeScene,
    patch: Partial<RecognizeScene> | undefined,
  ): RecognizeScene => {
    if (!patch || typeof patch !== "object") return scene;
    const cleaned: Partial<RecognizeScene> = {};
    (Object.keys(patch) as (keyof RecognizeScene)[]).forEach((k) => {
      const val = patch[k];
      // Skip empty strings / null / undefined so partial overrides never
      // wipe out a working base value.
      if (val === undefined || val === null) return;
      if (typeof val === "string" && val.trim() === "") return;
      (cleaned as Record<string, unknown>)[k as string] = val;
    });
    return { ...scene, ...cleaned };
  };

  const recognizeMainScenes: RecognizeScene[] = baseScenes.map((scene, i) =>
    mergeOverride(scene, contextOverrides[String(i)]),
  );

  // Each "state" maps to the page that delivers its concrete action,
  // mirroring the destinations defined in src/data/emotionCTAs.ts.
  const STATE_ROUTES: Record<NonNullable<RecognizeScene["state"]>, string> = {
    panique: "/calme",
    hypervigilance: "/calme",
    rumination: "/post-flow",
    explosion: "/calme",
  };
  const sceneCtaHref = (scene: RecognizeScene): string => {
    if (!scene.state) return "/emotions";
    const target = STATE_ROUTES[scene.state];
    // /calme and /post-flow are gated; send anonymous visitors through auth
    // with a redirect back to the right page so the transition stays direct.
    return user ? target : `/auth?redirect=${encodeURIComponent(target)}`;
  };
  // Resolve a translation with an explicit fallback chain — i18next would
  // otherwise return the key itself when missing, which surfaces as raw
  // text in the UI.
  const tWithFallback = (...keys: string[]): string => {
    for (const k of keys) {
      if (i18n.exists(k)) {
        const v = t(k);
        if (typeof v === "string" && v.trim() !== "") return v;
      }
    }
    return "";
  };
  const extraText = (slot: "s1" | "s2"): string => {
    const parentSuffix = parentType === "papa" ? "_papa" : "";
    if (schoolContext !== "school") {
      return tWithFallback(
        `home.recognize.${slot}_${schoolContext}${parentSuffix}`,
        `home.recognize.${slot}_${schoolContext}`,
        `home.recognize.${slot}${parentSuffix}`,
        `home.recognize.${slot}`,
      );
    }
    return tWithFallback(
      `home.recognize.${slot}${parentSuffix}`,
      `home.recognize.${slot}`,
    );
  };
  const recognizeExtras = [
    { emoji: t("home.recognize.s1_emoji"), text: extraText("s1") },
    { emoji: t("home.recognize.s2_emoji"), text: extraText("s2") },
  ].filter((e) => e.text);

  type QuickState = {
    state: NonNullable<RecognizeScene["state"]>;
    emoji: string;
    label: string;
    hint: string;
  };
  const quickStates = t("home.recognize.quick_states", { returnObjects: true }) as QuickState[];
  const quickStateHref = (state: QuickState["state"]): string => {
    const target = STATE_ROUTES[state];
    return user ? target : `/auth?redirect=${encodeURIComponent(target)}`;
  };
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
            {t(parentType === "papa" ? "home.hero.line1_papa" : "home.hero.line1")}
            <br />
            {t(parentType === "papa" ? "home.hero.line2_papa" : "home.hero.line2")}
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
            <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>{t("home.hero.cta")}</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* Recognize — ouverture par la douleur incarnée (4 micro-scènes : matin / soir / corps / tête) */}
      <SectionBlock>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold md:text-2xl">{t("home.recognize.title")}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("home.recognize.subtitle")}
            </p>
          </div>

          {/* Toggle profil maman / papa — adapte le ton des micro-scènes */}
          <div
            role="group"
            aria-label={t("home.recognize.profile_toggle_label")}
            className="mx-auto flex max-w-xs flex-col items-center gap-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("home.recognize.profile_toggle_label")}
            </p>
            <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
              {(["maman", "papa"] as const).map((p) => {
                const active = parentType === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParentType(p)}
                    aria-pressed={active}
                    className={`min-w-[84px] rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {t(p === "maman" ? "home.recognize.profile_maman" : "home.recognize.profile_papa")}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] italic text-muted-foreground">
              {t("home.recognize.profile_toggle_hint")}
            </p>
          </div>

          {/* Toggle contexte — adapte le texte des scènes matin / soir */}
          <div
            role="group"
            aria-label={t("home.recognize.school_toggle_label")}
            className="mx-auto flex w-full max-w-md flex-col items-center gap-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("home.recognize.school_toggle_label")}
            </p>
            <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
              {(["school", "work", "holiday"] as const).map((c) => {
                const active = schoolContext === c;
                const labelKey =
                  c === "school"
                    ? "home.recognize.school_toggle_school"
                    : c === "work"
                      ? "home.recognize.school_toggle_work"
                      : "home.recognize.school_toggle_holiday";
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSchoolContext(c)}
                    aria-pressed={active}
                    className={`rounded-xl px-2 py-1.5 text-xs font-semibold leading-tight transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
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
                {s.state && s.cta && (
                  <button
                    type="button"
                    onClick={() => {
                      if (s.state) {
                        rememberLastQuickState({
                          state: s.state,
                          label: s.stateLabel ?? s.state,
                          emoji: s.emoji,
                          hint: s.cta ?? "",
                          href: sceneCtaHref(s),
                          source: "scene",
                        });
                      }
                      navigateWithTransition(sceneCtaHref(s));
                    }}
                    aria-label={`${s.stateLabel ?? s.state} — ${s.cta}`}
                    className="group mt-2 flex w-full items-center justify-between gap-3 rounded-xl bg-primary/10 hover:bg-primary/15 active:scale-[0.98] border border-primary/20 px-4 py-3 transition-all"
                  >
                    <span className="flex flex-col items-start text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
                        {s.stateLabel ?? s.state}
                      </span>
                      <span className="text-sm font-semibold text-primary leading-tight">
                        {s.cta}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="text-primary transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </button>
                )}
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

          {/* Options rapides — accès direct par état */}
          <div className="space-y-3 pt-2">
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t("home.recognize.quick_states_title")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("home.recognize.quick_states_hint")}
              </p>
            </div>

            {/* Rappel — propose le dernier raccourci sélectionné */}
            {lastQuickState && (
              <div className="relative rounded-2xl border border-primary/30 bg-primary/10 p-4 shadow-sm">
                <button
                  type="button"
                  onClick={forgetLastQuickState}
                  aria-label={t("home.recognize.last_state_dismiss")}
                  className="absolute right-2 top-2 rounded-full p-1 text-foreground/60 hover:bg-primary/15 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {t("home.recognize.last_state_title")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("home.recognize.last_state_hint")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    rememberLastQuickState({
                      state: lastQuickState.state,
                      label: lastQuickState.label,
                      emoji: lastQuickState.emoji,
                      hint: lastQuickState.hint,
                      href: lastQuickState.href,
                      source: lastQuickState.source,
                    });
                    navigateWithTransition(lastQuickState.href);
                  }}
                  className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] px-4 py-3 transition-all"
                  aria-label={`${t("home.recognize.last_state_cta")} — ${lastQuickState.label}`}
                >
                  <span className="flex items-center gap-2 text-left">
                    <span className="text-lg leading-none" aria-hidden>{lastQuickState.emoji}</span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold leading-tight">{lastQuickState.label}</span>
                      {lastQuickState.hint && (
                        <span className="text-[11px] opacity-90 leading-tight">{lastQuickState.hint}</span>
                      )}
                    </span>
                  </span>
                  <span className="text-xs font-semibold">
                    {t("home.recognize.last_state_cta")} →
                  </span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {quickStates.map((q) => (
                <button
                  key={q.state}
                  type="button"
                  onClick={() => {
                    rememberLastQuickState({
                      state: q.state,
                      label: q.label,
                      emoji: q.emoji,
                      hint: q.hint,
                      href: quickStateHref(q.state),
                      source: "quick",
                    });
                    navigateWithTransition(quickStateHref(q.state));
                  }}
                  aria-label={`${q.label} — ${q.hint}`}
                  className="group flex flex-col items-start gap-1 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-[0.98] px-3 py-3 text-left transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg leading-none" aria-hidden>{q.emoji}</span>
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {q.label}
                    </span>
                  </span>
                  <span className="flex w-full items-center justify-between text-[11px] font-medium text-primary">
                    <span>{q.hint}</span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </button>
              ))}
            </div>
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
              <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>{t("home.testimonials.cta")}</CTAButton>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {t("home.testimonials.cta_justify")}
            </p>
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
            <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>{t("home.final.cta")}</CTAButton>
          </div>
        </div>
      </SectionBlock>

      <Footer />
    </div>
  );
};

export default Index;
