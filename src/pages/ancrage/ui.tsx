import { ReactNode } from "react";

export const Card = ({
  children,
  className = "",
  onClick,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: any;
}) => (
  <Tag
    onClick={onClick}
    className={`rounded-2xl p-5 transition-all ${onClick ? "active:scale-[0.98] cursor-pointer" : ""} ${className}`}
    style={{
      background: "var(--ancrage-surface)",
      border: "1px solid var(--ancrage-soft)",
      boxShadow: "0 1px 2px rgba(46,52,46,0.04), 0 8px 24px -16px rgba(46,52,46,0.12)",
    }}
  >
    {children}
  </Tag>
);

export const SectionTitle = ({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) => (
  <div className="mb-3 flex items-end justify-between px-1">
    <h2
      className="text-[15px] font-semibold tracking-tight"
      style={{ color: "var(--ancrage-ink)" }}
    >
      {children}
    </h2>
    {action}
  </div>
);

export const Pill = ({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "sand" | "blush" | "sky";
}) => {
  const map: Record<string, { bg: string; fg: string }> = {
    sage: { bg: "#E4EEDF", fg: "#4E6C49" },
    sand: { bg: "var(--ancrage-sand)", fg: "#7A6440" },
    blush: { bg: "var(--ancrage-blush)", fg: "#A75A48" },
    sky: { bg: "var(--ancrage-sky)", fg: "#3E6063" },
  };
  const c = map[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
};

export const SoftButton = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${className}`}
    style={
      variant === "primary"
        ? {
            background: "var(--ancrage-sage-deep)",
            color: "#fff",
            boxShadow: "0 6px 18px -8px rgba(124,155,120,0.6)",
          }
        : {
            background: "var(--ancrage-soft)",
            color: "var(--ancrage-ink)",
          }
    }
  >
    {children}
  </button>
);
