import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import QuickBackLinks from "@/components/QuickBackLinks";
import { motion } from "framer-motion";
import { Lock, Wind, Hand, Sparkles } from "lucide-react";
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
  { value: "any", label: "Au choix (auto)", Icon: Sparkles },
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
                <p className="pt-0.5">{step.text}</p>
                {step.hint && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    {step.hint}
                  </p>
                )}
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
