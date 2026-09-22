import { Loader2, Mic, Square } from "lucide-react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { toast } from "sonner";

/**
 * 🎙️ Petit bouton de dictée réutilisable.
 * On parle, le texte s'écrit tout seul dans le champ à côté.
 * Sur téléphone : le bouton respire avec la voix pour montrer qu'il entend bien.
 * `onText` reçoit le texte final (à insérer ou ajouter au champ).
 */
const VoiceDictationButton = ({
  onText,
  label = "Dicter",
  className = "",
}: {
  onText: (text: string) => void;
  label?: string;
  className?: string;
}) => {
  const { status, level, supported, start, stop } = useVoiceDictation({
    onDone: (text) => onText(text),
    onError: (message) => toast.error(message),
  });

  if (!supported) return null;

  const recording = status === "recording";
  const busy = status === "transcribing";

  return (
    <button
      type="button"
      onClick={() => (recording ? stop() : start())}
      disabled={busy}
      aria-label={recording ? "Arrêter la dictée" : label}
      title={recording ? "Arrêter la dictée" : label}
      style={
        recording
          ? { boxShadow: `0 0 0 ${2 + Math.round(level * 8)}px hsl(var(--primary) / 0.18)` }
          : undefined
      }
      className={`inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border transition-colors ${
        recording
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      } disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : recording ? (
        <Square className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </button>
  );
};

export default VoiceDictationButton;
