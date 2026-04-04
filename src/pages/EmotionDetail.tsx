import { useParams } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const MOLLIE_LINK = "https://payment-links.mollie.com/payment/Uqs26mrjXBFeWj5oK8hkr";

interface EmotionData {
  title: string;
  validation: string;
  subtext: string;
  steps: string[];
  script: string[];
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
  },
  rumination: {
    title: "Ton mental tourne en boucle",
    validation: "Ton cerveau cherche une sortie.",
    subtext: "Tu n'es pas faible.",
    steps: ["Regarde un point fixe", "Respire lentement", 'Dis "stop" intérieurement'],
    script: ["Tu peux laisser passer", "sans résoudre maintenant"],
  },
  explosion: {
    title: "La pression est trop forte",
    validation: "La pression est trop forte.",
    subtext: "Ton système est saturé.",
    steps: ["Serre tes poings", "Relâche", "Appuie tes pieds", "Respire profondément"],
    script: ["Tu peux relâcher sans exploser"],
  },
  vide: {
    title: "Tu te sens vide",
    validation: "Ton système s'est coupé pour tenir.",
    subtext: "Ton corps s'est coupé pour te protéger.",
    steps: ["Bouge tes mains", "Touche une surface", "Bois de l'eau", "Respire"],
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

      {/* Closing — new version */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu viens de commencer à faire redescendre ton corps</p>
          <p className="text-sm text-muted-foreground">👉 même légèrement</p>
          <p className="font-medium mt-4">Mais ce n'est que le début</p>
          <p className="text-sm text-muted-foreground">
            Parce que ton système ne redescend pas en une seule fois
          </p>
        </div>
      </SectionBlock>

      {/* Warning */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="font-bold">Et si tu t'arrêtes là…</p>
          <div className="space-y-2 text-muted-foreground">
            <p>👉 ton corps va remonter</p>
            <p>👉 tes pensées vont revenir</p>
            <p>👉 et tu vas repartir dans la boucle</p>
          </div>
        </div>
      </SectionBlock>

      {/* Projection */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-bold">En quelques minutes encore…</p>
          <p className="text-sm text-muted-foreground">tu peux sentir :</p>
          <ul className="space-y-3 text-left">
            {[
              "ton corps se relâcher davantage",
              "ton mental ralentir",
              "une sensation de sécurité revenir",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-primary font-medium">
            👉 pour la première fois depuis longtemps
          </p>
        </div>
      </SectionBlock>

      {/* Porte */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="font-bold">Ce que tu viens de faire, c'est une porte</p>
          <p className="text-muted-foreground">Mais pour vraiment sortir…</p>
          <p className="text-primary font-semibold">👉 tu as besoin d'un cadre</p>
        </div>
      </SectionBlock>

      {/* Social proof */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">La plupart des femmes s'arrêtent ici</p>
          <p className="font-bold">Et restent bloquées</p>
          <p className="text-muted-foreground">Celles qui avancent vraiment…</p>
          <p className="text-primary font-semibold">👉 vont jusqu'au bout</p>
        </div>
        <div className="mt-8">
          <CTAButton to={MOLLIE_LINK}>Je veux arrêter cette boucle maintenant</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default EmotionDetail;
