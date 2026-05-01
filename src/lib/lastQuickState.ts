/**
 * Memorises the last "state" the user picked from the home page
 * (either via a micro-scene CTA or a quick-state shortcut), so we can
 * propose the same shortcut on their next visit ("Reprendre où vous en
 * étiez ?").
 *
 * Local-only — this is a UX nudge, not a profile setting.
 */

import { useEffect, useState } from "react";

export type QuickStateId = "panique" | "hypervigilance" | "rumination" | "explosion";

export type LastQuickState = {
  state: QuickStateId;
  label: string;
  emoji: string;
  hint: string;
  href: string;
  /** epoch ms */
  at: number;
  /** "scene" = clicked a micro-scene CTA, "quick" = clicked a quick shortcut */
  source: "scene" | "quick";
};

const STORAGE_KEY = "ancrage_last_quick_state";
const EVENT = "ancrage-last-quick-state-change";
/** Hide the reminder after this delay — stale context is no longer useful. */
export const LAST_QUICK_STATE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function getLastQuickState(): LastQuickState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastQuickState;
    if (
      !parsed ||
      typeof parsed.state !== "string" ||
      typeof parsed.at !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.at > LAST_QUICK_STATE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function rememberLastQuickState(value: Omit<LastQuickState, "at">) {
  if (typeof window === "undefined") return;
  const payload: LastQuickState = { ...value, at: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent<LastQuickState>(EVENT, { detail: payload }));
}

export function forgetLastQuickState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent<LastQuickState | null>(EVENT, { detail: null }));
}

export function useLastQuickState(): LastQuickState | null {
  const [value, setValue] = useState<LastQuickState | null>(() => getLastQuickState());
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<LastQuickState | null>).detail;
      setValue(detail ?? null);
    };
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEY) setValue(getLastQuickState());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return value;
}
