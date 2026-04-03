import { useParams } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion } from "framer-motion";

interface EmotionData {
  title: string;
  validation: string;
  subtext: string;
  steps: string[];
  script: string[];
  closing: string;
}

const emotionData: Record<string, EmotionData> = {
  panique: {
    title: "Tu paniques",
    validation: "Ton corps est en alerte.",
    subtext: "Ce que tu ressens est réel.\n👉 Tu n'es pas en danger immédiat.",
    steps: [
      "Regarde autour de toi",
      "Nomme 5 objets",
      "Pose une main sur ton cœur",
      "Inspire lentement",
      "Expire plus longtemps",
    ],
    script: ["Tu es ici", "maintenant", "le danger n'est pas là", "ton corps peut redescendre"],
    closing: "Si ça baisse même un peu,\n👉 c'est déjà un signal.",
  },
  hypervigilance: {
    title: "Ton corps est en hypervigilance",
    validation: "Ton système essaie de te protéger.",
    subtext: "Il est resté en alerte.",
    steps: [
      "Regarde 3 choses",
      "Écoute 2 sons",
      "Touche un objet",
      "Relâche tes épaules",
      "Respire lentement",
    ],
    script: ["Tu peux baisser la garde", "tu es en sécurité ici"],
    closing: "Même un léger relâchement compte.",
  },
  rumination: {
    title: "Ton mental tourne en boucle",
    validation: "Ton cerveau cherche à comprendre.",
    subtext: "Tu n'es pas faible.",
    steps: ["Regarde un point fixe", "Respire lentement", 'Dis "stop" intérieurement'],
    script: ["Tu peux laisser passer", "sans résoudre maintenant"],
    closing: "Même 10 secondes comptent.",
  },
  explosion: {
    title: "La pression est trop haute",
    validation: "Ton système est saturé.",
    subtext: "",
    steps: ["Serre tes poings", "Relâche", "Appuie tes pieds", "Respire profondément"],
    script: ["Tu peux relâcher sans exploser"],
    closing: "Ça va redescendre.",
  },
  vide: {
    title: "Tu te sens vide",
    validation: "Ton corps s'est coupé pour te protéger.",
    subtext: "",
    steps: ["Bouge tes mains", "Touche une surface", "Bois de l'eau", "Respire"],
    script: ["Tu peux revenir doucement"],
    closing: "Même un léger retour suffit.",
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

      {/* Steps */}
      <SectionBlock>
        <h2 className="mb-6 text-lg font-bold">Fais ça maintenant <span className="text-muted-foreground font-normal">(2 minutes)</span></h2>
        <div className="space-y-3">
          {data.steps.map((step, i) => (
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
      </SectionBlock>

      {/* Script */}
      <SectionBlock variant="blue">
        <div className="space-y-3 text-center text-lg">
          {data.script.map((line) => (
            <p key={line} className="font-medium">{line}</p>
          ))}
        </div>
      </SectionBlock>

      {/* Closing */}
      <SectionBlock>
        <p className="whitespace-pre-line text-center text-muted-foreground">{data.closing}</p>
        <div className="mt-8 space-y-3">
          <CTAButton to="/" variant="secondary">Revenir à l'accueil</CTAButton>
          <CTAButton to="/aller-plus-loin">Aller plus loin</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
