import { ArrowRight } from "lucide-react";

/**
 * Primitives partagées de la page de vente.
 * Mêmes couleurs, mêmes typographies, mêmes rythmes que l'existant :
 * on n'invente pas une nouvelle identité, on prolonge celle qui existe.
 */

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

export const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`px-6 py-24 md:py-36 ${className}`}>
    <div className="mx-auto w-full max-w-[1180px]">{children}</div>
  </section>
);

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-dark/80">
    {children}
  </p>
);

export const SectionTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2
    className={`mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night ${className}`}
  >
    {children}
  </h2>
);

export const NightCTA = ({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-3.5 text-sm font-medium text-night-foreground shadow-[0_10px_40px_-15px_hsl(var(--night)/0.5)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_15px_50px_-15px_hsl(var(--night)/0.6)] active:translate-y-0 disabled:opacity-60 ${className}`}
  >
    {children}
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
  </button>
);
