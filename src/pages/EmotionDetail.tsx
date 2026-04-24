import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import QuickBackLinks from "@/components/QuickBackLinks";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

const EmotionDetail = () => {
  const { emotion } = useParams<{ emotion: string }>();
  const { t, i18n } = useTranslation();
  const key = emotion || "";

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
  const freeSteps = t(`emotion_detail.data.${key}.free`, { returnObjects: true }) as string[];
  const lockedSteps = t(`emotion_detail.data.${key}.locked`, { returnObjects: true }) as string[];

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
        <h2 className="mb-6 text-lg font-bold">
          {t("emotion_detail.do_with_me")}{" "}
          <span className="text-muted-foreground font-normal">{t("emotion_detail.duration_30s")}</span>
        </h2>
        <div className="space-y-3">
          {freeSteps.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-3 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 rounded-xl" />
          {lockedSteps.map((step) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm opacity-40 blur-[2px]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <span>{step}</span>
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
