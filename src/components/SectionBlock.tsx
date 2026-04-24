import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionBlockProps {
  variant?: "light" | "blue";
  children: ReactNode;
  className?: string;
}

const SectionBlock = ({ variant = "light", children, className = "" }: SectionBlockProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`px-6 py-12 md:py-16 ${className}`}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </motion.section>
  );
};

export default SectionBlock;
