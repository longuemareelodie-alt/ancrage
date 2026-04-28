export type ActionStyle = "any" | "breathing" | "sensory";

const STORAGE_KEY = "calm_action_style";

export const ACTION_STYLE_LABELS: Record<ActionStyle, string> = {
  any: "Sans préférence",
  breathing: "Respiration",
  sensory: "Ancrage sensoriel",
};

export function getActionStyle(): ActionStyle {
  if (typeof window === "undefined") return "any";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "breathing" || v === "sensory" || v === "any") return v;
  return "any";
}

export function setActionStyle(style: ActionStyle) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, style);
  window.dispatchEvent(new CustomEvent("calm-action-style-change", { detail: style }));
}
