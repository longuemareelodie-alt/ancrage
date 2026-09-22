import type { Mascot } from "@/data/pulseMascots";

/**
 * Portrait doux d'un compagnon PULSE, dans sa pastille de teinte Éclosia.
 */
const MascotAvatar = ({
  mascot,
  size = 36,
  className = "",
}: {
  mascot?: Mascot | null;
  size?: number;
  className?: string;
}) => {
  if (!mascot) {
    return (
      <span
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-secondary/40 text-sm ${className}`}
        aria-hidden
      >
        ✨
      </span>
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${mascot.tint} ${className}`}
    >
      <img
        src={mascot.image}
        alt={`${mascot.name} — ${mascot.label}`}
        loading="lazy"
        width={816}
        height={816}
        className="h-full w-full scale-[1.08] object-contain"
      />
    </span>
  );
};

export default MascotAvatar;
