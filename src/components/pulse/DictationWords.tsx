import { Undo2, X } from "lucide-react";
import { removeWordAt, toWords } from "@/lib/transcriptCleanup";
import { useState } from "react";

/**
 * Corriger la dictée sans clavier : chaque mot est une petite pastille,
 * un appui l'enlève. Une flèche annule le dernier retrait.
 */
const DictationWords = ({
  text,
  onChange,
}: {
  text: string;
  onChange: (next: string) => void;
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const words = toWords(text);

  const remove = (index: number) => {
    setHistory((h) => [...h, text]);
    navigator.vibrate?.(6);
    onChange(removeWordAt(text, index));
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    onChange(previous);
  };

  if (!words.length) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Un mot mal compris ? Touche-le pour l'enlever.
        </p>
        {history.length > 0 && (
          <button
            type="button"
            onClick={undo}
            className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary"
          >
            <Undo2 className="h-3 w-3" strokeWidth={2} />
            Annuler
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {words.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            onClick={() => remove(index)}
            aria-label={`Enlever le mot ${word}`}
            className="group inline-flex touch-manipulation items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-xs text-foreground transition-colors active:border-primary/60 active:bg-primary/10"
          >
            {word}
            <X className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DictationWords;
