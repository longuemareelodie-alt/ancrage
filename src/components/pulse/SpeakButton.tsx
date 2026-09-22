import { Loader2, Volume2, VolumeX } from "lucide-react";
import { useSoftSpeech } from "@/hooks/useSoftSpeech";
import { toast } from "@/hooks/use-toast";
import type { SoftVoice } from "@/data/softVoices";

/**
 * Petit bouton « écouter » : Éclosia lit la phrase à voix haute.
 * Discret, jamais automatique.
 */
const SpeakButton = ({
  text,
  voice,
  style,
  label = "Écouter",
}: {
  text: string;
  voice?: SoftVoice;
  style?: string;
  label?: string;
}) => {
  const { status, speak, stop } = useSoftSpeech();

  const onClick = async () => {
    if (status === "playing" || status === "loading") {
      stop();
      return;
    }
    try {
      await speak(text, { voice, style });
    } catch {
      toast({ description: "La voix n'a pas pu se lancer. Réessaie dans un instant." });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={status === "playing" ? "Arrêter la lecture" : label}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {status === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
      ) : status === "playing" ? (
        <VolumeX className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <Volume2 className="h-3.5 w-3.5" strokeWidth={2} />
      )}
      {status === "playing" ? "Stop" : label}
    </button>
  );
};

export default SpeakButton;
