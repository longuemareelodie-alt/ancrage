import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  getSyncState,
  pullStyleFromRemote,
  type SyncState,
} from "@/lib/actionStyle";

interface StyleSyncStatusProps {
  className?: string;
  /** Show a "Sync now" button. */
  showAction?: boolean;
}

const formatRelative = (iso: string | null): string => {
  if (!iso) return "jamais";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
};

const StyleSyncStatus = ({ className = "", showAction = false }: StyleSyncStatusProps) => {
  const [state, setState] = useState<SyncState>(() => getSyncState());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SyncState>).detail;
      if (detail) setState(detail);
    };
    window.addEventListener("calm-action-style-sync", handler as EventListener);
    return () =>
      window.removeEventListener("calm-action-style-sync", handler as EventListener);
  }, []);

  let Icon = Cloud;
  let label = "Synchronisé";
  let tone = "text-primary bg-primary/10";

  switch (state.status) {
    case "syncing":
      Icon = RefreshCw;
      label = "Synchronisation…";
      tone = "text-muted-foreground bg-muted";
      break;
    case "synced":
      Icon = CheckCircle2;
      label = "Synchronisé sur tous tes appareils";
      tone = "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40";
      break;
    case "local":
      Icon = CloudOff;
      label = "Local uniquement (connecte-toi pour synchroniser)";
      tone = "text-muted-foreground bg-muted";
      break;
    case "error":
      Icon = AlertTriangle;
      label = "Échec de la synchronisation";
      tone = "text-destructive bg-destructive/10";
      break;
    case "idle":
    default:
      Icon = Cloud;
      label = "En attente de synchronisation";
      tone = "text-muted-foreground bg-muted";
  }

  const handleSync = async () => {
    setSyncing(true);
    await pullStyleFromRemote();
    setSyncing(false);
  };

  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${tone} ${className}`}>
      <div className="flex items-center gap-2 text-xs">
        <Icon
          className={`h-3.5 w-3.5 ${state.status === "syncing" || syncing ? "animate-spin" : ""}`}
        />
        <span className="font-medium">{label}</span>
        {state.lastSyncedAt && state.status !== "local" && (
          <span className="opacity-70">· {formatRelative(state.lastSyncedAt)}</span>
        )}
      </div>
      {showAction && state.status !== "local" && (
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing || state.status === "syncing"}
          className="rounded-full border border-current px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80 transition-opacity hover:opacity-100 disabled:opacity-40"
        >
          Resynchroniser
        </button>
      )}
    </div>
  );
};

export default StyleSyncStatus;
