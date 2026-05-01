/**
 * School-day vs holiday context for the home micro-scenes.
 *
 * Local-only preference (no backend sync — context changes often).
 * Default = "school" (preserves the historical voice of the product).
 */

import { useEffect, useState } from "react";

export type SchoolContext = "school" | "holiday";

const STORAGE_KEY = "ancrage_school_context";
export const DEFAULT_SCHOOL_CONTEXT: SchoolContext = "school";

export const SCHOOL_CONTEXT_LABELS: Record<SchoolContext, string> = {
  school: "Avant l'école",
  holiday: "Vacances / week-end",
};

export function getSchoolContext(): SchoolContext {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_CONTEXT;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "holiday" || v === "school" ? v : DEFAULT_SCHOOL_CONTEXT;
}

export function setSchoolContext(value: SchoolContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(
    new CustomEvent<SchoolContext>("ancrage-school-context-change", { detail: value })
  );
}

export function useSchoolContext(): [SchoolContext, (v: SchoolContext) => void] {
  const [value, setValue] = useState<SchoolContext>(() => getSchoolContext());
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SchoolContext>).detail;
      if (detail) setValue(detail);
    };
    window.addEventListener("ancrage-school-context-change", onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "school" || e.newValue === "holiday")) {
        setValue(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("ancrage-school-context-change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return [value, setSchoolContext];
}
