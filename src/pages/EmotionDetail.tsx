import { useParams } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

const MOLLIE_LINK = "https://payment-links.mollie.com/payment/Uqs26mrjXBFeWj5oK8hkr";

interface EmotionData {
  title: string;
  validation: string;
  subtext: string;
  freeSteps: string[];
  lockedSteps: string[];
  script: string[];
}

const emotionData: Record<string, EmotionData> = {
  panique: {
    title: "Tu paniques",
    validation: "Ton corps essaie de te protéger.",
    subtext: "Ce que tu ressens est réel.\n👉 Tu n'es pas en danger immédiat.",
    freeSteps: [
      "Regarde autour de toi",
      "Nomme 5 objets",
    ],
    lockedSteps: [
      "Pose une main sur ton cœur",
      "Inspire lentement",
      "Expire plus longtemps",
    ],
    script: ["Tu es ici", "maintenant"],
  },
  hypervigilance: {
    title: "Ton corps est en hypervigilance",
    validation: "Ton système est resté en alerte.",
    subtext: "Il essaie encore de te protéger.",
    freeSteps: [
      "Regarde 3 choses",
      "Écoute 2 sons",
    ],
    lockedSteps: [
      "Touche un objet",
      "Relâche tes épaules",
      "Respire lentement",
    ],
    script: ["Tu peux baisser la garde"],
  },
  rumination: {
    title: "Ton mental tourne en boucle",
    validation: "Ton cerveau cherche une sortie.",
    subtext: "Tu n'es pas faible.",
    freeSteps: ["Regarde un point fixe", "Respire lentement"],
    lockedSteps: ['Dis "stop" intérieurement'],
    script: ["Tu peux laisser passer"],
  },
  explosion: {
    title: "La pression est trop forte",
    validation: "La pression est trop forte.",
    subtext: "Ton système est saturé.",
    freeSteps: ["Serre tes poings", "Relâche"],
    lockedSteps: ["Appuie tes pieds", "Respire profondément"],
    script: ["Tu peux relâcher sans exploser"],
  },
  vide: {
    title: "Tu te sens vide",
    validation: "Ton système s'est coupé pour tenir.",
    subtext: "Ton corps s'est coupé pour te protéger.",
    freeSteps: ["Bouge tes mains", "Touche une surface"],
    lockedSteps: ["Bois de l'eau", "Respire"],
    script: ["Tu peux revenir doucement"],
  },
};

const EmotionDetail = () => {
  const { emotion } = useParams<{ emotion: string }>();
  const data = emotionData[emotion || ""];

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Émotion non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Title + Validation */}
      <SectionBlock variant="blue">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 text-center"
        >
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-lg">{data.validation}</p>
          {data.subtext && (
            <p className="whitespace-pre-line text-muted-foreground">{data.subtext}</p>
          )}
        </motion.div>
      </SectionBlock>

      {/* Free Steps */}
      <SectionBlock>
        <h2 className="mb-6 text-lg font-bold">
          Fais ça maintenant{" "}
          <span className="text-muted-foreground font-normal">(30 secondes)</span>
        </h2>
        <div className="space-y-3">
          {data.freeSteps.map((step, i) => (
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

        {/* Locked Steps */}
        <div className="mt-4 space-y-3 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-10 rounded-xl" />
          {data.lockedSteps.map((step, i) => (
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
        <p className="mt-4 text-xs text-muted-foreground text-center">👉 La suite est dans ANCRAGE</p>
      </SectionBlock>

      {/* Script (minimal) */}
      <SectionBlock variant="blue">
        <div className="space-y-3 text-center text-lg">
          {data.script.map((line) => (
            <p key={line} className="font-medium">
              {line}
            </p>
          ))}
        </div>
      </SectionBlock>

      {/* Closing — tu viens de commencer */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu viens de commencer à faire redescendre ton corps</p>
          <p className="text-sm text-muted-foreground">👉 même légèrement</p>
        </div>
      </SectionBlock>

      {/* Moment de manque */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="font-bold">Tu sens que ça commence à bouger…</p>
          <p className="text-primary font-semibold">👉 mais ça ne tient pas</p>
          <div className="space-y-2 text-muted-foreground">
            <p>Parce que ton système ne redescend pas en une seule fois</p>
          </div>
          <p className="font-medium mt-2">Et sans cadre…</p>
          <div className="space-y-2 text-muted-foreground">
            <p>👉 ça remonte</p>
            <p>👉 ça revient</p>
            <p>👉 et tu repars dans la boucle</p>
          </div>
        </div>
      </SectionBlock>

      {/* Frustration intelligente */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-bold">Ce que tu viens de faire est un début</p>
          <p className="text-primary font-semibold">Mais ce n'est pas suffisant pour sortir de cet état durablement</p>
          <div className="space-y-2 text-muted-foreground">
            <p>👉 ton corps a besoin d'un enchaînement précis</p>
            <p>👉 pas juste d'un exercice</p>
          </div>
        </div>
      </SectionBlock>

      {/* Promesse contrôlée */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Avec ANCRAGE, tu vas :</p>
          <ul className="space-y-3 text-left">
            {[
              "enchaîner les bonnes actions",
              "faire redescendre ton système progressivement",
              "sortir réellement de la boucle",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            👉 même si aujourd'hui tu te sens bloquée
          </p>
        </div>
      </SectionBlock>

      {/* CTA */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu peux commencer maintenant</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>👉 sans te justifier</p>
            <p>👉 sans te forcer</p>
            <p>👉 à ton rythme</p>
          </div>
          <div className="mt-4">
            <CTAButton to={MOLLIE_LINK}>Je veux que ça s'arrête vraiment</CTAButton>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Lock className="h-3.5 w-3.5" />
            <span>Paiement 100% sécurisé via Mollie</span>
          </div>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
