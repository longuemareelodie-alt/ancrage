import { useEffect, useState } from "react";
import {
  ParentType,
  getParentType,
  hasChosenParentType,
  setParentType as setParentTypeLib,
  PARENT_TYPE_CHOSEN_KEY,
} from "@/lib/parentType";

/**
 * React hook bound to the global parent-type preference.
 * Reflects changes from any tab/component via a custom event.
 *
 * Returns: [value, setter, hasChosen]
 *   - value:     current effective parent type (default = "maman")
 *   - setter:    update the parent type
 *   - hasChosen: true iff the user explicitly picked a profile (vs. default).
 *                Use this to fall back to neutral copy when false.
 */
export function useParentType(): [ParentType, (v: ParentType) => void, boolean] {
  const [value, setValue] = useState<ParentType>(() => getParentType());
  const [chosen, setChosen] = useState<boolean>(() => hasChosenParentType());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ParentType>).detail;
      if (detail) setValue(detail);
      setChosen(hasChosenParentType());
    };
    window.addEventListener("ancrage-parent-type-change", onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ancrage_parent_type" && (e.newValue === "papa" || e.newValue === "maman")) {
        setValue(e.newValue);
      }
      if (e.key === PARENT_TYPE_CHOSEN_KEY) {
        setChosen(hasChosenParentType());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("ancrage-parent-type-change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return [value, setParentTypeLib, chosen];
}
