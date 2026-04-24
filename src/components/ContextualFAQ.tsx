import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EmotionKey = "panique" | "hypervigilance" | "rumination" | "explosion" | "vide" | "epuisee" | "calme" | "apaisee" | "fiere" | "default";

type FAQItem = { q: string; a: string };

const FAQ_BY_EMOTION: Record<EmotionKey, { title: string; intro: string; items: FAQItem[] }> = {
  panique: {
    title: "Avant de commencer — panique",
    intro: "Ces questions reviennent souvent quand le corps s'emballe. Lis-en une si tu en as besoin, sinon passe directement à l'outil.",
    items: [
      { q: "Est-ce que je fais une crise grave ?", a: "Non. Une crise de panique est intense mais sans danger. Ton corps réagit comme s'il y avait un danger, mais il n'y en a pas. Ça va redescendre." },
      { q: "Combien de temps ça va durer ?", a: "Le pic dure généralement 5 à 20 minutes. L'outil va t'aider à raccourcir cette durée en réactivant ton système de calme." },
      { q: "Est-ce que je dois bouger ou rester assise ?", a: "Pose-toi quelque part de stable. L'outil te guide ensuite avec une respiration adaptée." },
    ],
  },
  hypervigilance: {
    title: "Avant de commencer — hypervigilance",
    intro: "Ton système est resté en alerte. Voici ce que les femmes nous demandent le plus souvent.",
    items: [
      { q: "Pourquoi je sursaute pour rien ?", a: "Ton système nerveux est en mode 'veille armée'. Il scanne en permanence. Ce n'est pas toi, c'est une adaptation." },
      { q: "Est-ce que ça veut dire que je suis en danger ?", a: "Non. L'hypervigilance peut persister même quand le danger est passé. L'outil aide ton corps à comprendre que c'est fini." },
      { q: "Pourquoi je n'arrive pas à me détendre seule ?", a: "Parce que la détente ne se décide pas, elle se déclenche. C'est exactement ce que fait le rituel." },
    ],
  },
  rumination: {
    title: "Avant de commencer — rumination",
    intro: "Ton cerveau cherche une sortie en boucle. Voici ce qu'il faut savoir.",
    items: [
      { q: "Pourquoi je n'arrive pas à arrêter de penser ?", a: "La rumination est une tentative de contrôle. Plus tu luttes, plus elle persiste. L'outil t'aide à sortir de la boucle par le corps, pas par la pensée." },
      { q: "Est-ce que je dois 'comprendre' avant d'agir ?", a: "Non. Comprendre vient après. D'abord, on calme le système nerveux." },
      { q: "Et si je rumine encore après l'outil ?", a: "C'est normal. L'objectif n'est pas zéro pensée, c'est créer un espace entre toi et la boucle." },
    ],
  },
  explosion: {
    title: "Avant de commencer — explosion",
    intro: "La pression est trop forte. Pas de jugement ici.",
    items: [
      { q: "Est-ce que je suis une mauvaise personne ?", a: "Non. Tu es une personne saturée. L'explosion est un signal, pas une preuve." },
      { q: "Comment éviter de m'en vouloir après ?", a: "L'outil propose un retour au calme + un repère pour réparer si besoin, sans culpabilisation." },
      { q: "Et si ça remonte tout de suite après ?", a: "Tu peux refaire le rituel autant de fois qu'il faut. C'est gratuit et illimité." },
    ],
  },
  vide: {
    title: "Avant de commencer — sensation de vide",
    intro: "Ton système s'est coupé pour tenir. Quelques repères avant l'outil.",
    items: [
      { q: "Pourquoi je ne ressens plus rien ?", a: "C'est une protection appelée 'figement'. Ton corps a baissé le volume des émotions pour ne pas être submergé." },
      { q: "Est-ce que c'est de la dépression ?", a: "Pas forcément. Si ça dure plus de deux semaines, parle-en à un·e professionnel·le. L'outil ne remplace pas un suivi." },
    ],
  },
  epuisee: {
    title: "Avant de commencer — épuisement",
    intro: "Tu as trop donné. Voici ce qui peut t'aider à te poser.",
    items: [
      { q: "Je n'ai même pas l'énergie pour l'outil, je fais quoi ?", a: "Le rituel dure 1 minute et se fait allongée si besoin. C'est l'option la plus douce." },
      { q: "Pourquoi je suis épuisée alors que je n'ai 'rien fait' ?", a: "La charge mentale et émotionnelle consomme autant que la charge physique. Ton épuisement est réel." },
    ],
  },
  calme: {
    title: "Avant de commencer — calme",
    intro: "Profite de ce moment. L'outil va t'aider à l'ancrer.",
    items: [
      { q: "Pourquoi enregistrer un état calme ?", a: "Pour que ton système nerveux se rappelle qu'il sait y revenir. C'est un repère pour les moments difficiles." },
    ],
  },
  apaisee: {
    title: "Avant de commencer — apaisement",
    intro: "Garde ce moment en toi.",
    items: [
      { q: "Comment prolonger cette sensation ?", a: "L'outil propose un mini-rituel pour ancrer l'apaisement dans le corps." },
    ],
  },
  fiere: {
    title: "Avant de commencer — fierté",
    intro: "Tu mérites de le ressentir pleinement.",
    items: [
      { q: "Pourquoi je n'arrive pas à savourer ?", a: "Beaucoup de femmes ont appris à minimiser. L'outil aide à laisser la fierté s'installer dans le corps." },
    ],
  },
  default: {
    title: "Avant de commencer",
    intro: "Quelques questions fréquentes avant d'accéder à l'outil.",
    items: [
      { q: "Combien de temps prend l'outil ?", a: "1 à 3 minutes selon le rituel." },
      { q: "Est-ce que mes données sont privées ?", a: "Oui, totalement. Tu peux exporter ou supprimer tes notes à tout moment depuis ton profil." },
    ],
  },
};

interface ContextualFAQProps {
  emotion: EmotionKey;
  onContinue: () => void;
  onClose: () => void;
}

const ContextualFAQ = ({ emotion, onContinue, onClose }: ContextualFAQProps) => {
  const data = FAQ_BY_EMOTION[emotion] ?? FAQ_BY_EMOTION.default;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contextual-faq-title"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="contextual-faq-title" className="text-lg font-semibold">
          {data.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.intro}</p>

        <ul className="mt-5 space-y-2">
          {data.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className="rounded-lg border border-border bg-background/60">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-3 text-sm text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="sm:w-auto">
            {t("contextual_faq.back")}
          </Button>
          <Button onClick={onContinue} className="sm:w-auto">
            {t("contextual_faq.continue")}
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContextualFAQ;
