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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`px-6 py-12 md:py-16 ${className}`}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </motion.section>
  );
};

export default SectionBlock;
