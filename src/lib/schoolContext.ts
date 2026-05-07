/**
 * Daily-context for the home micro-scenes.
 *
 * Three values: "school" (avant l'école), "work" (avant le boulot, sans
 * enfants à gérer le matin) and "holiday" (vacances / week-end).
 *
 * Local-only preference (context changes often). Default = "school".
 *
 * Mirrors the parentType module shape so both toggles behave identically
 * across the app (same custom-event wiring, same hasChosen flag, same
 * cross-page rehydration on bfcache restore).
 */

import { useEffect, useState } from "react";

export type SchoolContext = "school" | "work" | "holiday";

const STORAGE_KEY = "ancrage_school_context";
export const SCHOOL_CONTEXT_CHOSEN_KEY = "ancrage_school_context_chosen";
export const DEFAULT_SCHOOL_CONTEXT: SchoolContext = "school";

export const SCHOOL_CONTEXT_LABELS: Record<SchoolContext, string> = {
  school: "Avant l'école",
  work: "Avant le boulot",
  holiday: "Vacances / week-end",
};

const CHANGE_EVENT = "ancrage-school-context-change";

function isValid(v: unknown): v is SchoolContext {
  return v === "school" || v === "work" || v === "holiday";
}

export function getSchoolContext(): SchoolContext {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_CONTEXT;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isValid(v) ? v : DEFAULT_SCHOOL_CONTEXT;
  } catch {
    return DEFAULT_SCHOOL_CONTEXT;
  }
}

export function hasChosenSchoolContext(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SCHOOL_CONTEXT_CHOSEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSchoolContextChosen() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(SCHOOL_CONTEXT_CHOSEN_KEY, "1"); } catch {}
}

export function setSchoolContext(value: SchoolContext) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  markSchoolContextChosen();
  window.dispatchEvent(
    new CustomEvent<SchoolContext>(CHANGE_EVENT, { detail: value })
  );
}

/**
 * Hook bound to the global school-context preference.
 * Returns [value, setter, hasChosen] — same shape as useParentType().
 *
 * Reactive to:
 *  - same-tab custom event (when set anywhere in the app)
 *  - cross-tab storage events
 *  - bfcache restore (pageshow with persisted=true), so navigating Back
 *    after changing the toggle on another page rehydrates the UI.
 */
export function useSchoolContext(): [
  SchoolContext,
  (v: SchoolContext) => void,
  boolean,
] {
  const [value, setValue] = useState<SchoolContext>(() => getSchoolContext());
  const [chosen, setChosen] = useState<boolean>(() => hasChosenSchoolContext());

  useEffect(() => {
    const refresh = () => {
      setValue(getSchoolContext());
      setChosen(hasChosenSchoolContext());
    };

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SchoolContext>).detail;
      if (detail && isValid(detail)) setValue(detail);
      setChosen(hasChosenSchoolContext());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isValid(e.newValue)) setValue(e.newValue);
      if (e.key === SCHOOL_CONTEXT_CHOSEN_KEY) setChosen(hasChosenSchoolContext());
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refresh();
    };

    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    // Also re-sync on mount in case the value was changed on another route
    // before the component was created (initial useState already covers it,
    // but this protects against any race on slow remounts).
    refresh();

    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return [value, setSchoolContext, chosen];
}
