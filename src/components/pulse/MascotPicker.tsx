import { useState } from "react";
import { Check } from "lucide-react";
import { MASCOTS, mascotOf, type PulseDomain } from "@/data/pulseMascots";
import MascotAvatar from "@/components/pulse/MascotAvatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Choix manuel du compagnon PULSE, avec les vraies illustrations.
 * `value` = domaine choisi (ou null : Éclosia devine).
 */
const MascotPicker = ({
  value,
  onChange,
  size = 34,
  showLabel = true,
}: {
  value?: string | null;
  onChange: (domain: PulseDomain | null) => void;
  size?: number;
  showLabel?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const current = mascotOf(value);

  const pick = (domain: PulseDomain | null) => {
    onChange(domain);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choisir le compagnon"
          className="flex shrink-0 items-center gap-2 rounded-2xl p-0.5 transition-transform active:scale-95"
        >
          <MascotAvatar mascot={current} size={size} className="rounded-xl" />
          {showLabel && (
            <span className="text-[11px] text-muted-foreground">
              {current ? current.name : "Choisir"}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-[20px] p-3">
        <p className="mb-2 text-xs text-muted-foreground">Qui s'occupe de ça ?</p>
        <div className="grid grid-cols-3 gap-2">
          {MASCOTS.map((m) => {
            const active = m.domain === value;
            return (
              <button
                key={m.domain}
                type="button"
                onClick={() => pick(m.domain)}
                className={`flex flex-col items-center gap-1 rounded-[16px] border px-1.5 py-2 text-center transition-colors ${
                  active ? "border-primary/60 bg-primary/5" : "border-border/60 hover:bg-muted/50"
                }`}
              >
                <MascotAvatar mascot={m} size={40} className="rounded-xl" />
                <span className="text-[11px] font-medium text-foreground">{m.name}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">{m.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => pick(null)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground"
        >
          {!value && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
          Laisser Éclosia choisir
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default MascotPicker;
