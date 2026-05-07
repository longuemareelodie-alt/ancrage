/**
 * Sub-mode for the "work" daily context: are there kids to manage in the
 * morning routine, or not? Defaults to "without" (current copy).
 *
 * Local-only, mirrors the schoolContext / parentType pattern.
 */

import { useEffect, useState } from "react";

export type WorkKidsMode = "without" | "with";

const STORAGE_KEY = "ancrage_work_kids_mode";
const EVENT = "ancrage-work-kids-mode-change";
export const DEFAULT_WORK_KIDS_MODE: WorkKidsMode = "without";

export const WORK_KIDS_LABELS: Record<WorkKidsMode, string> = {
  without: "Sans enfants",
  with: "Avec enfants",
};

function isValid(v: unknown): v is WorkKidsMode {
  return v === "with" || v === "without";
}

export function getWorkKidsMode(): WorkKidsMode {
  if (typeof window === "undefined") return DEFAULT_WORK_KIDS_MODE;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isValid(v) ? v : DEFAULT_WORK_KIDS_MODE;
  } catch {
    return DEFAULT_WORK_KIDS_MODE;
  }
}

export function setWorkKidsMode(value: WorkKidsMode) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  window.dispatchEvent(new CustomEvent<WorkKidsMode>(EVENT, { detail: value }));
}

export function useWorkKidsMode(): [WorkKidsMode, (v: WorkKidsMode) => void] {
  const [value, setValue] = useState<WorkKidsMode>(() => getWorkKidsMode());
  useEffect(() => {
    const refresh = () => setValue(getWorkKidsMode());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<WorkKidsMode>).detail;
      if (detail && isValid(detail)) setValue(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isValid(e.newValue)) setValue(e.newValue);
    };
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) refresh(); };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    refresh();
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  return [value, setWorkKidsMode];
}
