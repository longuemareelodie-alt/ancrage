import { supabase } from "@/integrations/supabase/client";

export type ActionStyle = "any" | "breathing" | "sensory";
export type ResolvedActionStyle = "breathing" | "sensory";

const STORAGE_KEY = "calm_action_style";
const LAST_USED_KEY = "calm_action_style_last_used";
const SYNC_KEY = "calm_action_style_sync";

export const ACTION_STYLE_LABELS: Record<ActionStyle, string> = {
  any: "Sans préférence",
  breathing: "Respiration",
  sensory: "Eclosia sensoriel",
};

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error" | "local";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null; // ISO
  error?: string;
}

function readSyncState(): SyncState {
  if (typeof window === "undefined") return { status: "idle", lastSyncedAt: null };
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return { status: "idle", lastSyncedAt: null };
    const parsed = JSON.parse(raw) as SyncState;
    return parsed;
  } catch {
    return { status: "idle", lastSyncedAt: null };
  }
}

function writeSyncState(state: SyncState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("calm-action-style-sync", { detail: state }));
}

export function getSyncState(): SyncState {
  return readSyncState();
}

export function getActionStyle(): ActionStyle {
  if (typeof window === "undefined") return "any";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "breathing" || v === "sensory" || v === "any") return v;
  return "any";
}

function writeLocal(style: ActionStyle) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, style);
  window.dispatchEvent(new CustomEvent("calm-action-style-change", { detail: style }));
}

/**
 * Set the action style locally and attempt to sync it to the user's profile.
 * Works offline: local value is always saved; remote sync runs best-effort.
 */
export function setActionStyle(style: ActionStyle) {
  writeLocal(style);
  // Fire & forget remote sync.
  void syncStyleToRemote(style);
}

async function syncStyleToRemote(style: ActionStyle) {
  if (typeof window === "undefined") return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      writeSyncState({ status: "local", lastSyncedAt: readSyncState().lastSyncedAt });
      return;
    }
    writeSyncState({ status: "syncing", lastSyncedAt: readSyncState().lastSyncedAt });
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_style: style,
        preferred_style_synced_at: nowIso,
      })
      .eq("user_id", user.id);
    if (error) {
      writeSyncState({
        status: "error",
        lastSyncedAt: readSyncState().lastSyncedAt,
        error: error.message,
      });
      return;
    }
    writeSyncState({ status: "synced", lastSyncedAt: nowIso });
  } catch (err: any) {
    writeSyncState({
      status: "error",
      lastSyncedAt: readSyncState().lastSyncedAt,
      error: err?.message ?? "unknown",
    });
  }
}

/**
 * Pull the preferred style from the user's profile (called on login / app start).
 * Remote wins if `preferred_style_synced_at` is more recent than our local sync timestamp,
 * otherwise we push local up.
 */
export async function pullStyleFromRemote(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      writeSyncState({ status: "local", lastSyncedAt: readSyncState().lastSyncedAt });
      return;
    }
    writeSyncState({ status: "syncing", lastSyncedAt: readSyncState().lastSyncedAt });

    const { data, error } = await supabase
      .from("profiles")
      .select("preferred_style, preferred_style_synced_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      writeSyncState({
        status: "error",
        lastSyncedAt: readSyncState().lastSyncedAt,
        error: error.message,
      });
      return;
    }

    const remoteStyle = (data?.preferred_style ?? null) as ActionStyle | null;
    const remoteAt = (data?.preferred_style_synced_at ?? null) as string | null;
    const localAt = readSyncState().lastSyncedAt;
    const localStyle = getActionStyle();

    const remoteTime = remoteAt ? new Date(remoteAt).getTime() : 0;
    const localTime = localAt ? new Date(localAt).getTime() : 0;

    if (remoteStyle && remoteTime >= localTime) {
      // Remote wins → adopt it locally.
      if (remoteStyle !== localStyle) writeLocal(remoteStyle);
      writeSyncState({ status: "synced", lastSyncedAt: remoteAt });
    } else {
      // Push local up.
      await syncStyleToRemote(localStyle);
    }
  } catch (err: any) {
    writeSyncState({
      status: "error",
      lastSyncedAt: readSyncState().lastSyncedAt,
      error: err?.message ?? "unknown",
    });
  }
}

export interface LastUsedStyle {
  style: ResolvedActionStyle;
  at: string; // ISO date
  emotionId?: string;
}

export function recordLastUsedStyle(style: ResolvedActionStyle, emotionId?: string) {
  if (typeof window === "undefined") return;
  const payload: LastUsedStyle = { style, at: new Date().toISOString(), emotionId };
  localStorage.setItem(LAST_USED_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("calm-action-style-used", { detail: payload }));
}

export function getLastUsedStyle(): LastUsedStyle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_USED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastUsedStyle;
    if (parsed.style !== "breathing" && parsed.style !== "sensory") return null;
    return parsed;
  } catch {
    return null;
  }
}
