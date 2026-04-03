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
    validation: "Ton corps essaie de te protéger.",
    subtext: "Ce que tu ressens est réel.\n👉 Tu n'es pas en danger immédiat.",
    steps: [
      "Regarde autour de toi",
      "Nomme 5 objets",
      "Pose une main sur ton cœur",
      "Inspire lentement",
      "Expire plus longtemps",
    ],
    script: ["Tu es ici", "maintenant", "le danger n'est pas là", "ton corps peut redescendre"],
    closing:
      "Tu viens de faire redescendre ton corps.\nMême légèrement.\n\n👉 Et ça, c'est déjà énorme.\n\nTon corps n'est pas bloqué.\n👉 Il peut redescendre.\n\nImagine quand tu sauras le faire plus vite…\net surtout… sans attendre d'être au bout.",
  },
  hypervigilance: {
    title: "Ton corps est en hypervigilance",
    validation: "Ton système est resté en alerte.",
    subtext: "Il essaie encore de te protéger.",
    steps: [
      "Regarde 3 choses",
      "Écoute 2 sons",
      "Touche un objet",
      "Relâche tes épaules",
      "Respire lentement",
    ],
    script: ["Tu peux baisser la garde", "tu es en sécurité ici"],
    closing:
      "Tu viens de faire redescendre ton corps.\nMême légèrement.\n\n👉 Et ça, c'est déjà énorme.\n\nTon corps n'est pas bloqué.\n👉 Il peut redescendre.",
  },
  rumination: {
    title: "Ton mental tourne en boucle",
    validation: "Ton cerveau cherche une sortie.",
    subtext: "Tu n'es pas faible.",
    steps: ["Regarde un point fixe", "Respire lentement", 'Dis "stop" intérieurement'],
    script: ["Tu peux laisser passer", "sans résoudre maintenant"],
    closing:
      "Tu viens de faire redescendre ton corps.\nMême légèrement.\n\n👉 Et ça, c'est déjà énorme.",
  },
  explosion: {
    title: "La pression est trop forte",
    validation: "La pression est trop forte.",
    subtext: "Ton système est saturé.",
    steps: ["Serre tes poings", "Relâche", "Appuie tes pieds", "Respire profondément"],
    script: ["Tu peux relâcher sans exploser"],
    closing:
      "Tu viens de faire redescendre ton corps.\nMême légèrement.\n\n👉 Ça va redescendre.",
  },
  vide: {
    title: "Tu te sens vide",
    validation: "Ton système s'est coupé pour tenir.",
    subtext: "Ton corps s'est coupé pour te protéger.",
    steps: ["Bouge tes mains", "Touche une surface", "Bois de l'eau", "Respire"],
    script: ["Tu peux revenir doucement"],
    closing:
      "Tu viens de faire redescendre ton corps.\nMême légèrement.\n\n👉 Même un léger retour suffit.",
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
        <h2 className="mb-6 text-lg font-bold">
          Fais ça maintenant{" "}
          <span className="text-muted-foreground font-normal">(2 minutes)</span>
        </h2>
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
        <p className="mt-4 text-xs text-muted-foreground text-center">👉 Tu peux arrêter quand tu veux</p>
      </SectionBlock>

      {/* Script */}
      <SectionBlock variant="blue">
        <div className="space-y-3 text-center text-lg">
          {data.script.map((line) => (
            <p key={line} className="font-medium">
              {line}
            </p>
          ))}
        </div>
      </SectionBlock>

      {/* Closing */}
      <SectionBlock>
        <p className="whitespace-pre-line text-center text-muted-foreground">{data.closing}</p>
        <div className="mt-8 space-y-3">
          <CTAButton to="/aller-plus-loin">Aller plus loin maintenant</CTAButton>
          <CTAButton to="/" variant="secondary">
            Revenir à l'accueil
          </CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
