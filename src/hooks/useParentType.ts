import { useEffect, useState } from "react";
import {
  ParentType,
  getParentType,
  setParentType as setParentTypeLib,
} from "@/lib/parentType";

/**
 * React hook bound to the global parent-type preference.
 * Reflects changes from any tab/component via a custom event.
 */
export function useParentType(): [ParentType, (v: ParentType) => void] {
  const [value, setValue] = useState<ParentType>(() => getParentType());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ParentType>).detail;
      if (detail) setValue(detail);
    };
    window.addEventListener("ancrage-parent-type-change", onChange);
    // Cross-tab sync via storage event.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ancrage_parent_type" && (e.newValue === "papa" || e.newValue === "maman")) {
        setValue(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("ancrage-parent-type-change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return [value, setParentTypeLib];
}
