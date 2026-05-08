import { Link } from "react-router-dom";
import { AlertTriangle, MessageCircle, HandHeart, Sparkles, RotateCcw, Home } from "lucide-react";
import type { Emotion } from "@/data/childEmotionsCatalog";

type Props = {
  emotion: Emotion;
  isCrisis: boolean;
  onReset: () => void;
};

const ParentGuidance = ({ emotion, isCrisis, onReset }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-3xl"
          style={{ background: `hsl(${emotion.hsl} / 0.35)` }}
          aria-hidden
        >
          {emotion.emoji}
        </span>
        <p className="text-sm text-muted-foreground">
          Ton enfant exprime : <strong className="text-foreground">{emotion.label}</strong>
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-[hsl(var(--lies))]">
          <MessageCircle className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">À lui dire</h3>
        </div>
        <p className="text-base leading-relaxed text-foreground">{emotion.parent.say}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-2 flex items-center gap-2 text-[hsl(var(--lies))]">
          <HandHeart className="h-4 w-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">À faire ensemble</h3>
        </div>
        <p className="text-base leading-relaxed text-foreground">{emotion.parent.doTogether}</p>
      </section>

      {emotion.parent.exercise && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-[hsl(var(--lies))]">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Exercice simple</h3>
          </div>
          <p className="text-base leading-relaxed text-foreground">{emotion.parent.exercise}</p>
        </section>
      )}

      {isCrisis && (
        <Link
          to="/lies-autrement/crise"
          className="flex items-center justify-center gap-2 rounded-2xl bg-destructive px-5 py-4 text-base font-bold text-destructive-foreground shadow-md transition-transform hover:scale-[1.01]"
        >
          <AlertTriangle className="h-5 w-5" />
          C'est une crise — m'aider maintenant
        </Link>
      )}

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" />
          Recommencer
        </button>
        <Link
          to="/comment-tu-te-sens/historique"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          Historique
        </Link>
      </div>
    </div>
  );
};

export default ParentGuidance;
