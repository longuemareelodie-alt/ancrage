import { motion, useReducedMotion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SectionBlockProps {
  variant?: "light" | "blue";
  children: ReactNode;
  className?: string;
}

const SectionBlock = ({ variant = "light", children, className = "" }: SectionBlockProps) => {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // `null` = not yet decided. `true` = visible at mount → skip animation.
  const [initiallyVisible, setInitiallyVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!ref.current) {
      setInitiallyVisible(false);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Consider visible if any part of the section is already in viewport on first paint.
    setInitiallyVisible(rect.top < vh && rect.bottom > 0);
  }, []);

  // Wait one paint before deciding to avoid a flash of hidden content.
  if (initiallyVisible === null) {
    return (
      <section
        ref={ref}
        className={`px-6 py-12 md:py-16 ${className}`}
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <div className="mx-auto max-w-lg">{children}</div>
      </section>
    );
  }

  // Sections already on screen at load OR reduced-motion users → render without animation.
  if (initiallyVisible || prefersReducedMotion) {
    return (
      <section className={`px-6 py-12 md:py-16 ${className}`}>
        <div className="mx-auto max-w-lg">{children}</div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      // Promote to its own GPU layer so the transform animation doesn't repaint siblings.
      style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
      className={`px-6 py-12 md:py-16 ${className}`}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </motion.section>
  );
};

export default SectionBlock;
