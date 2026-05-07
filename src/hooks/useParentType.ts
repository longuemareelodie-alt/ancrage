import { useEffect, useState } from "react";
import {
  ParentType,
  getParentType,
  hasChosenParentType,
  setParentType as setParentTypeLib,
  PARENT_TYPE_CHOSEN_KEY,
  PARENT_TYPE_STORAGE_KEY,
} from "@/lib/parentType";

/**
 * React hook bound to the global parent-type preference.
 * Returns: [value, setter, hasChosen]
 *
 * Stays in sync with useSchoolContext() — same event/storage/pageshow
 * wiring so both toggles always agree across pages.
 */
export function useParentType(): [ParentType, (v: ParentType) => void, boolean] {
  const [value, setValue] = useState<ParentType>(() => getParentType());
  const [chosen, setChosen] = useState<boolean>(() => hasChosenParentType());

  useEffect(() => {
    const refresh = () => {
      setValue(getParentType());
      setChosen(hasChosenParentType());
    };

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ParentType>).detail;
      if (detail) setValue(detail);
      setChosen(hasChosenParentType());
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === PARENT_TYPE_STORAGE_KEY &&
        (e.newValue === "papa" || e.newValue === "maman")
      ) {
        setValue(e.newValue);
      }
      if (e.key === PARENT_TYPE_CHOSEN_KEY) {
        setChosen(hasChosenParentType());
      }
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refresh();
    };

    window.addEventListener("ancrage-parent-type-change", onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    refresh();

    return () => {
      window.removeEventListener("ancrage-parent-type-change", onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return [value, setParentTypeLib, chosen];
}
