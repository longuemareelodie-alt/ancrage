/**
 * Parent type preference — "maman" (default) or "papa".
 *
 * Used to personalize the home micro-scenes and a few key narrative texts
 * (lexicon identity / hero gender agreement). The value is stored locally in
 * localStorage and synced best-effort to the user's profile when authenticated.
 *
 * Default = "maman" (preserves the historical voice of the product).
 */

import { supabase } from "@/integrations/supabase/client";

export type ParentType = "maman" | "papa";

export const PARENT_TYPE_STORAGE_KEY = "ancrage_parent_type";
const STORAGE_KEY = PARENT_TYPE_STORAGE_KEY;
const SYNC_KEY = "ancrage_parent_type_sync";

export const PARENT_TYPE_LABELS: Record<ParentType, string> = {
  maman: "Maman",
  papa: "Papa",
};

export const DEFAULT_PARENT_TYPE: ParentType = "maman";

export const PARENT_TYPE_CHOSEN_KEY = "ancrage_parent_type_chosen";

export function getParentType(): ParentType {
  if (typeof window === "undefined") return DEFAULT_PARENT_TYPE;
  const v = localStorage.getItem(STORAGE_KEY);
  // Profil Papa retiré temporairement de l'interface — tout le monde repasse sur Maman.
  if (v === "papa") {
    localStorage.setItem(STORAGE_KEY, DEFAULT_PARENT_TYPE);
  }
  return v === "maman" ? "maman" : DEFAULT_PARENT_TYPE;
}

/**
 * True only if the user has explicitly picked a profile (via onboarding or
 * the home toggle / settings). When false, callers should use the neutral /
 * base copy and avoid applying gendered substitutions.
 */
export function hasChosenParentType(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PARENT_TYPE_CHOSEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markParentTypeChosen() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(PARENT_TYPE_CHOSEN_KEY, "1"); } catch {}
}

function writeLocal(value: ParentType) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent<ParentType>("ancrage-parent-type-change", { detail: value })
  );
}

export function setParentType(value: ParentType) {
  writeLocal(value);
  markParentTypeChosen();
  void syncToRemote(value);
}

async function syncToRemote(value: ParentType) {
  if (typeof window === "undefined") return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const nowIso = new Date().toISOString();
    await supabase
      .from("profiles")
      .update({
        parent_type: value,
        parent_type_synced_at: nowIso,
      } as any)
      .eq("user_id", user.id);
    if (typeof window !== "undefined") {
      localStorage.setItem(SYNC_KEY, nowIso);
    }
  } catch {
    // best-effort
  }
}

/**
 * On login / app start: pull the value from the user's profile, with a
 * "remote wins if newer" strategy mirroring the action style sync.
 */
export async function pullParentTypeFromRemote(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("parent_type, parent_type_synced_at" as any)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error || !data) return;

    const remoteValue = ((data as any).parent_type ?? null) as ParentType | null;
    const remoteAt = ((data as any).parent_type_synced_at ?? null) as string | null;
    const localAt = localStorage.getItem(SYNC_KEY);

    const remoteTime = remoteAt ? new Date(remoteAt).getTime() : 0;
    const localTime = localAt ? new Date(localAt).getTime() : 0;

    if (remoteValue && remoteTime >= localTime) {
      if (remoteValue !== getParentType()) writeLocal(remoteValue);
      localStorage.setItem(SYNC_KEY, remoteAt ?? new Date().toISOString());
    } else {
      // Push local up if user already chose something locally before login.
      const local = getParentType();
      await syncToRemote(local);
    }
  } catch {
    // ignore
  }
}
