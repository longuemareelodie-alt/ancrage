import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const emotions = [
  { emoji: "😰", label: "Je panique", path: "/emotion/panique", hook: "Ton corps essaie de te protéger" },
  { emoji: "⚡", label: "Hypervigilance", path: "/emotion/hypervigilance", hook: "Ton système est resté en alerte" },
  { emoji: "💭", label: "Rumination", path: "/emotion/rumination", hook: "Ton cerveau cherche une sortie" },
  { emoji: "😡", label: "Explosion", path: "/emotion/explosion", hook: "La pression est trop forte" },
  { emoji: "😶", label: "Vide", path: "/emotion/vide", hook: "Ton système s'est coupé pour tenir" },
];

const Emotions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8 text-center"
      >
        <div>
          <h1 className="text-2xl font-bold">Comment tu te sens là maintenant ?</h1>
          <p className="mt-2 text-muted-foreground">Choisis sans réfléchir</p>
        </div>

        <div className="space-y-3">
          {emotions.map((emotion, i) => (
            <motion.button
              key={emotion.path}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(emotion.path)}
              className="flex w-full items-center gap-4 rounded-xl bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-2xl">{emotion.emoji}</span>
              <div>
                <span className="font-medium">{emotion.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{emotion.hook}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Emotions;
