import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getRandomReward } from "@/data/microRewards";

interface Props {
  show: boolean;
  onDone: () => void;
}

const MicroRewardPopup = ({ show, onDone }: Props) => {
  const [reward, setReward] = useState(getRandomReward());

  useEffect(() => {
    if (show) {
      setReward(getRandomReward());
      const timer = setTimeout(onDone, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed inset-x-4 bottom-8 z-50 mx-auto max-w-sm rounded-2xl bg-card p-5 shadow-xl border border-primary/20 text-center"
          onClick={onDone}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 0.4 }}
            className="text-3xl block mb-2"
          >
            {reward.emoji}
          </motion.span>
          <p className="text-sm font-medium">{reward.text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MicroRewardPopup;
