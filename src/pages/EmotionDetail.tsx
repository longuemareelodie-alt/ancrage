import { useParams } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";

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
  epuisee: {
    title: "Tu es épuisée",
    validation: "Ton système nerveux a trop donné.",
    subtext: "C'est un signal, pas une faiblesse.",
    freeSteps: ["Pose ta main sur ton cœur", "Sens ta respiration"],
    lockedSteps: ["Ferme les yeux", "Relâche chaque muscle", "Reste 1 minute"],
    script: ["Tu as le droit de t'arrêter"],
  },
  calme: {
    title: "Tu te sens plus calme",
    validation: "Ton système nerveux redescend.",
    subtext: "Ce calme t'appartient. Tu l'as créé.",
    freeSteps: ["Ferme les yeux", "Respire 3 fois lentement"],
    lockedSteps: ["Souris légèrement", "Savoure ce moment"],
    script: ["Tu peux garder ce calme"],
  },
  apaisee: {
    title: "Tu te sens apaisée",
    validation: "Ton corps a trouvé un espace de sécurité.",
    subtext: "Tu mérites ce répit.",
    freeSteps: ["Inspire profondément", "Pense à une chose positive"],
    lockedSteps: ["Expire avec gratitude", "Reste dans ce moment"],
    script: ["L'apaisement est en toi"],
  },
  fiere: {
    title: "Tu es fière de toi",
    validation: "Ton système reconnaît que tu as fait quelque chose de difficile.",
    subtext: "Tu as le droit d'être fière. Vraiment.",
    freeSteps: ["Souris", "Pose ta main sur ton cœur"],
    lockedSteps: ["Dis « bravo »", "Célèbre en silence"],
    script: ["Tu mérites cette fierté"],
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
          <p className="text-lg font-medium text-primary">{data.validation}</p>
          <p className="text-muted-foreground">Ton cerveau essaie de te protéger</p>
          <p className="text-sm text-muted-foreground">Mais là… il s'emballe</p>
          <p className="text-sm font-medium text-primary">👉 Ce que tu ressens est normal</p>
          <p className="text-sm text-muted-foreground">Tu n'es pas en danger là maintenant</p>
          <p className="font-semibold">On va juste le faire redescendre</p>
        </motion.div>
      </SectionBlock>

      {/* Free Steps */}
      <SectionBlock>
        <h2 className="mb-6 text-lg font-bold">
          Fais ça avec moi maintenant{" "}
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
          {data.lockedSteps.map((step) => (
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

      {/* Post-exercise: redirect to post-flow */}
      <SectionBlock variant="blue">
        <div className="space-y-3 text-center">
          <p className="text-xl font-bold">Tu viens de faire redescendre ton corps</p>
          <p className="text-muted-foreground">Même un peu → c'est déjà un changement</p>
          <p className="text-primary font-semibold">👉 et ça change déjà tout</p>
        </div>
      </SectionBlock>

      {/* CTA vers post-flow */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <CTAButton to="/post-flow">Et maintenant ?</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
