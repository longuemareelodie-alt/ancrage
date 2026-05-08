import type { Emotion } from "@/data/childEmotionsCatalog";

type Props = {
  emotions: Emotion[];
  onPick: (e: Emotion) => void;
  columns?: 2 | 3;
};

const FacePicker = ({ emotions, onPick, columns = 2 }: Props) => {
  return (
    <div
      className={`grid gap-3 ${
        columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
      }`}
    >
      {emotions.map((e) => (
        <button
          key={e.key}
          onClick={() => onPick(e)}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:scale-[1.02] hover:border-[hsl(var(--lies))] hover:shadow-soft"
        >
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-inner"
            style={{ background: `hsl(${e.hsl} / 0.35)` }}
            aria-hidden
          >
            {e.emoji}
          </span>
          <span className="text-sm font-semibold text-foreground">{e.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FacePicker;
