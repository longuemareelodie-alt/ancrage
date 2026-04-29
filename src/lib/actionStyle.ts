export type ActionStyle = "any" | "breathing" | "sensory";
export type ResolvedActionStyle = "breathing" | "sensory";

const STORAGE_KEY = "calm_action_style";
const LAST_USED_KEY = "calm_action_style_last_used";

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
