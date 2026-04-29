import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import QuickBackLinks from "@/components/QuickBackLinks";
import SpeakButton from "@/components/SpeakButton";
import SpeakableText from "@/components/SpeakableText";
import { motion } from "framer-motion";
import { Lock, Wind, Hand, Sparkles, Activity, ArrowRight, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  ActionStyle,
  getActionStyle,
  setActionStyle,
  recordLastUsedStyle,
} from "@/lib/actionStyle";
import {
  getStyleVariant,
  hasStyleVariants,
  EMOTION_STYLE_VARIANTS,
  type Step,
} from "@/data/emotionStyleVariants";
import { writeLastVisited } from "@/lib/lastVisited";
import {
  resolveAutoStyleFromToday,
  type ResolvedStyle,
} from "@/lib/autoStyle";

const STYLE_OPTIONS: {
  value: ActionStyle;
  label: string;
  Icon: typeof Wind;
}[] = [
  { value: "breathing", label: "Respiration", Icon: Wind },
  { value: "sensory", label: "Sensoriel", Icon: Hand },
  { value: "any", label: "Au choix (alterné)", Icon: Sparkles },
];

const RESOLVED_LABEL: Record<ResolvedStyle, string> = {
  breathing: "Respiration",
  sensory: "Sensoriel",
};

const EmotionDetail = () => {
  const { emotion } = useParams<{ emotion: string }>();
  const { t, i18n } = useTranslation();
  const key = emotion || "";

  const [style, setStyle] = useState<ActionStyle>(() => getActionStyle());
  const [autoResolved, setAutoResolved] = useState<ResolvedStyle | null>(null);
  const [activationBefore, setActivationBefore] = useState<number>(7);
  const [activationAfter, setActivationAfter] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ActionStyle>).detail;
      if (detail) setStyle(detail);
    };
    window.addEventListener("calm-action-style-change", handler as EventListener);
    return () =>
      window.removeEventListener(
        "calm-action-style-change",
        handler as EventListener,
      );
  }, []);

  // Resolve "any" → breathing/sensory based on today's mood.
  useEffect(() => {
    if (style !== "any") {
      setAutoResolved(null);
      return;
    }
    let cancelled = false;
    resolveAutoStyleFromToday().then((r) => {
      if (!cancelled) setAutoResolved(r);
    });
    return () => {
      cancelled = true;
    };
  }, [style]);

  // Validate the emotion key against known translations.
  const titleKey = `emotion_detail.data.${key}.title`;
  const exists = i18n.exists(titleKey);

  if (!exists) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t("emotion_detail.not_found")}</p>
      </div>
    );
  }

  const title = t(titleKey);
  const validation = t(`emotion_detail.data.${key}.validation`);

  const i18nFreeRaw = t(`emotion_detail.data.${key}.free`, {
    returnObjects: true,
  }) as string[];
  const i18nLockedRaw = t(`emotion_detail.data.${key}.locked`, {
    returnObjects: true,
  }) as string[];

  const toSteps = (arr: string[]): Step[] => arr.map((text) => ({ text }));

  // Tag steps with the style they belong to (breathing or sensory) so each
  // card knows what it represents — needed for "any" alternation.
  type TaggedStep = Step & { stepStyle?: "breathing" | "sensory" };
  const tag = (steps: Step[], stepStyle: "breathing" | "sensory"): TaggedStep[] =>
    steps.map((s) => ({ ...s, stepStyle }));

  /**
   * Build the alternating list when style === "any":
   * starts with the dominant style (auto-resolved from today's mood) then
   * zips the other one — so each card flips between breathing and sensory.
   */
  const buildAlternating = (
    breathing: Step[],
    sensory: Step[],
    dominant: "breathing" | "sensory",
  ): TaggedStep[] => {
    const first = dominant === "breathing" ? tag(breathing, "breathing") : tag(sensory, "sensory");
    const second = dominant === "breathing" ? tag(sensory, "sensory") : tag(breathing, "breathing");
    const max = Math.max(first.length, second.length);
    const out: TaggedStep[] = [];
    for (let i = 0; i < max; i++) {
      if (first[i]) out.push(first[i]);
      if (second[i]) out.push(second[i]);
    }
    return out;
  };

  const supportsVariants = hasStyleVariants(key);
  const variants = supportsVariants ? EMOTION_STYLE_VARIANTS[key] : null;

  // Effective style for header/recording: when "any", we pick the dominant
  // (auto-resolved) one but actual cards may alternate.
  const effectiveStyle: ActionStyle =
    style === "any" ? (autoResolved ?? "any") : style;

  let freeSteps: TaggedStep[];
  let lockedSteps: TaggedStep[];

  if (variants && style === "any" && autoResolved) {
    freeSteps = buildAlternating(variants.breathing.free, variants.sensory.free, autoResolved);
    lockedSteps = buildAlternating(variants.breathing.locked, variants.sensory.locked, autoResolved);
  } else {
    const variant = getStyleVariant(key, effectiveStyle);
    freeSteps = variant ? tag(variant.free, effectiveStyle as "breathing" | "sensory") : toSteps(i18nFreeRaw);
    lockedSteps = variant ? tag(variant.locked, effectiveStyle as "breathing" | "sensory") : toSteps(i18nLockedRaw);
  }

  // Record the resolved style as the last one used (only when it's a real
  // variant page so we know which side won).
  useEffect(() => {
    if (!supportsVariants) return;
    if (effectiveStyle === "breathing" || effectiveStyle === "sensory") {
      recordLastUsedStyle(effectiveStyle, key);
    }
  }, [effectiveStyle, supportsVariants, key]);

  const handleStyleChange = (value: ActionStyle) => {
    setStyle(value);
    setActionStyle(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <QuickBackLinks />
      <SectionBlock variant="blue">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 text-center"
        >
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-lg font-medium text-primary">{validation}</p>
          <p className="text-muted-foreground">{t("emotion_detail.intro1")}</p>
          <p className="text-sm text-muted-foreground">{t("emotion_detail.intro2")}</p>
          <p className="text-sm font-medium text-primary">{t("emotion_detail.intro3")}</p>
          <p className="text-sm text-muted-foreground">{t("emotion_detail.intro4")}</p>
          <p className="font-semibold">{t("emotion_detail.intro5")}</p>
        </motion.div>
      </SectionBlock>

      <SectionBlock>
        <h2 className="mb-4 text-lg font-bold">
          {t("emotion_detail.do_with_me")}{" "}
          <span className="text-muted-foreground font-normal">{t("emotion_detail.duration_30s")}</span>
        </h2>

        {supportsVariants && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Style d'exercice
            </p>
            <div
              role="radiogroup"
              aria-label="Style d'exercice"
              className="flex flex-wrap gap-2"
            >
              {STYLE_OPTIONS.map(({ value, label, Icon }) => {
                const active = style === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleStyleChange(value)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
            {style === "any" && autoResolved && (
              <p className="mt-2 text-xs text-muted-foreground">
                Adapté à ton humeur du jour : <span className="font-semibold text-foreground">{RESOLVED_LABEL[autoResolved]}</span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {freeSteps.map((step, i) => (
            <motion.div
              key={`${style}-${step.text}`}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-sm"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <SpeakableText
                      text={step.text}
                      textClassName="pt-0.5"
                    />
                    {step.hint && (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        {step.hint}
                      </p>
                    )}
                  </div>
                  {style === "any" && step.stepStyle && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        step.stepStyle === "breathing"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {step.stepStyle === "breathing" ? (
                        <Wind className="h-3 w-3" />
                      ) : (
                        <Hand className="h-3 w-3" />
                      )}
                      {step.stepStyle === "breathing" ? "Souffle" : "Sens"}
                    </span>
                  )}
                </div>
              </div>
              {supportsVariants && (
                <div
                  role="radiogroup"
                  aria-label="Style d'exercice"
                  className="flex shrink-0 gap-1"
                >
                  {STYLE_OPTIONS.map(({ value, label, Icon }) => {
                    const active = style === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        onClick={() => handleStyleChange(value)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-3 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 rounded-xl" />
          {lockedSteps.map((step) => (
            <div
              key={`${style}-${step.text}`}
              className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-sm opacity-40 blur-[2px]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p>{step.text}</p>
                {step.hint && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {step.hint}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* Check de sortie 30 sec : mesurer la baisse d'activation */}
      <SectionBlock>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold">Check de sortie · 30 sec</h3>
              <p className="text-xs text-muted-foreground">
                Mesure si ton activation a baissé après l'exercice.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {/* AVANT */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Avant l'exercice
                </span>
                <span className="font-bold text-foreground">{activationBefore}/10</span>
              </div>
              <Slider
                value={[activationBefore]}
                min={0}
                max={10}
                step={1}
                onValueChange={(v) => setActivationBefore(v[0])}
                disabled={activationAfter !== null}
                aria-label="Niveau d'activation avant"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Calme</span>
                <span>En alerte</span>
              </div>
            </div>

            {/* APRÈS */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Maintenant
                </span>
                <span className="font-bold text-foreground">
                  {activationAfter ?? "—"}/10
                </span>
              </div>
              <Slider
                value={[activationAfter ?? activationBefore]}
                min={0}
                max={10}
                step={1}
                onValueChange={(v) => setActivationAfter(v[0])}
                aria-label="Niveau d'activation maintenant"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Calme</span>
                <span>En alerte</span>
              </div>
            </div>
          </div>

          {/* Résultat + suggestion */}
          {activationAfter !== null && (() => {
            const delta = activationBefore - activationAfter;
            let icon = <Check className="h-4 w-4" />;
            let title = "";
            let suggestion = "";
            let nextLabel = "";
            let nextTo = "/post-flow";
            let tone = "bg-primary/10 text-primary";

            if (delta >= 2) {
              title = `Activation -${delta} points`;
              suggestion = "Belle baisse. Tu peux clore en douceur ou ancrer ce calme.";
              nextLabel = "Ancrer le calme";
              nextTo = "/post-flow";
            } else if (delta >= 0) {
              title = delta === 0 ? "Stable" : `Activation -${delta} point`;
              suggestion = "Refais une étape sensorielle ou respiration courte.";
              nextLabel = "Refaire une étape";
              nextTo = `/emotion/${key}`;
              tone = "bg-accent text-accent-foreground";
            } else {
              title = `Activation +${Math.abs(delta)} points`;
              suggestion =
                "Ton corps est encore en alerte. Va vers une action plus contenante.";
              nextLabel = "Voir Calme en clair";
              nextTo = "/calme";
              tone = "bg-destructive/10 text-destructive";
              icon = <Activity className="h-4 w-4" />;
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 space-y-3"
              >
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${tone}`}>
                  {icon}
                  {title}
                </div>
                <p className="text-sm text-muted-foreground">{suggestion}</p>
                <CTAButton to={nextTo}>
                  <span className="inline-flex items-center gap-1.5">
                    {nextLabel}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </CTAButton>
              </motion.div>
            );
          })()}
        </div>
      </SectionBlock>

      <SectionBlock variant="blue">
        <div className="space-y-3 text-center">
          <p className="text-xl font-bold">{t("emotion_detail.after_title")}</p>
          <p className="text-muted-foreground">{t("emotion_detail.after_p1")}</p>
          <p className="text-primary font-semibold">{t("emotion_detail.after_p2")}</p>
        </div>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-4 text-center">
          <CTAButton to="/post-flow">{t("emotion_detail.next")}</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
