import { Volume2 } from "lucide-react";
import { picto } from "@/data/pictograms";
import type { Presentation } from "@/lib/childAdapt";

export const speakFr = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
};

type Props = {
  keys: string[];
  pres: Presentation;
  selected?: string[];
  onPick: (key: string) => void;
  photos?: Record<string, string>;
};

/** Grandes cartes pictogramme + texte. Le texte n'est jamais retiré par défaut. */
const PictoChoice = ({ keys, pres, selected = [], onPick, photos = {} }: Props) => (
  <div className={`grid gap-3 ${pres.big ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
    {keys.map((k) => {
      const p = picto(k);
      const on = selected.includes(k);
      return (
        <button
          key={k}
          type="button"
          onClick={() => {
            if (pres.audio) speakFr(p.label);
            onPick(k);
          }}
          aria-pressed={on}
          aria-label={p.label}
          className={`flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 bg-card px-3 text-center transition-colors ${
            pres.big ? "min-h-[118px] py-4" : "min-h-[84px] py-3"
          } ${on ? "border-primary bg-secondary/60" : "border-border/70"}`}
        >
          {pres.visual &&
            (photos[k] ? (
              <img src={photos[k]} alt="" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <span className={pres.big ? "text-5xl" : "text-3xl"} aria-hidden>
                {p.emoji}
              </span>
            ))}
          {(pres.showText || !pres.visual) && (
            <span className={`font-semibold leading-tight text-foreground ${pres.big ? "text-sm uppercase tracking-wide" : "text-sm"}`}>
              {p.label}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const SpeakLine = ({ text }: { text: string }) => (
  <button
    type="button"
    onClick={() => speakFr(text)}
    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground"
  >
    <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Écouter
  </button>
);

export default PictoChoice;
