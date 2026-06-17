import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wind, Hand, Sparkles, Check, Pencil } from "lucide-react";
import {
  ActionStyle,
  ACTION_STYLE_LABELS,
  getActionStyle,
  setActionStyle,
  getLastUsedStyle,
  type LastUsedStyle,
} from "@/lib/actionStyle";

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  return `il y a ${days} j`;
}

const LastStyleCard = () => {
  const [last, setLast] = useState<LastUsedStyle | null>(() => getLastUsedStyle());
  const [current, setCurrent] = useState<ActionStyle>(() => getActionStyle());
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const onUsed = (e: Event) => {
      const detail = (e as CustomEvent<LastUsedStyle>).detail;
      if (detail) setLast(detail);
    };
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ActionStyle>).detail;
      if (detail) setCurrent(detail);
    };
    window.addEventListener("calm-action-style-used", onUsed as EventListener);
    window.addEventListener("calm-action-style-change", onChange as EventListener);
    return () => {
      window.removeEventListener("calm-action-style-used", onUsed as EventListener);
      window.removeEventListener("calm-action-style-change", onChange as EventListener);
    };
  }, []);

  if (!last) return null;

  const Icon = last.style === "breathing" ? Wind : Hand;
  const label = last.style === "breathing" ? "Respiration" : "Eclosia sensoriel";
  const otherStyle: ActionStyle = last.style === "breathing" ? "sensory" : "breathing";
  const otherLabel = ACTION_STYLE_LABELS[otherStyle];

  const handleKeep = () => {
    setActionStyle(last.style);
    setCurrent(last.style);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2000);
  };

  const handleSwitch = () => {
    setActionStyle(otherStyle);
    setCurrent(otherStyle);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2000);
  };

  const isCurrent = current === last.style;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dernier style utilisé
          </p>
          <p className="mt-0.5 font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelative(last.at)}
            {isCurrent ? " · style actuel" : ` · actuel : ${ACTION_STYLE_LABELS[current]}`}
          </p>
        </div>
      </div>

      {confirmed ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
          <Check className="h-3.5 w-3.5" />
          Préférence enregistrée
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleKeep}
            disabled={isCurrent}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Garder {label}
          </button>
          <button
            type="button"
            onClick={handleSwitch}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Passer à {otherLabel}
          </button>
          <Link
            to="/profil/style"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" />
            Modifier
          </Link>
        </div>
      )}
    </div>
  );
};

export default LastStyleCard;
