import { useEffect, useState, useCallback } from "react";

export type TourFrequency = "once" | "weekly" | "monthly" | "never";

export type TourSettings = {
  autoEnabled: boolean;
  frequency: TourFrequency;
};

const SETTINGS_KEY = "guided_tour_settings_v1";
const LAST_SHOWN_KEY = "guided_tour_last_shown_at_v1";
const LEGACY_DONE_KEY = "guided_tour_done_v1";

const DEFAULTS: TourSettings = { autoEnabled: true, frequency: "once" };

function readSettings(): TourSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TourSettings>;
    return {
      autoEnabled:
        typeof parsed.autoEnabled === "boolean" ? parsed.autoEnabled : DEFAULTS.autoEnabled,
      frequency: (
        ["once", "weekly", "monthly", "never"] as TourFrequency[]
      ).includes(parsed.frequency as TourFrequency)
        ? (parsed.frequency as TourFrequency)
        : DEFAULTS.frequency,
    };
  } catch {
    return DEFAULTS;
  }
}

function writeSettings(next: TourSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("lovable:guided-tour-settings"));
}

/**
 * Decide whether the guided tour should auto-launch right now,
 * based on user settings and the last time it ran.
 */
export function shouldAutoLaunch(): boolean {
  if (typeof window === "undefined") return false;
  const { autoEnabled, frequency } = readSettings();
  if (!autoEnabled || frequency === "never") return false;

  const lastShown = Number(localStorage.getItem(LAST_SHOWN_KEY) || "0");
  // Legacy flag: respected as "tour was completed once"
  const legacyDone = localStorage.getItem(LEGACY_DONE_KEY) === "1";

  if (frequency === "once") {
    return !legacyDone && lastShown === 0;
  }
  if (lastShown === 0) return true;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const threshold = frequency === "weekly" ? 7 * day : 30 * day;
  return now - lastShown > threshold;
}

export function markTourShown() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
  localStorage.setItem(LEGACY_DONE_KEY, "1");
}

/** React hook reflecting the persisted settings, with cross-component sync. */
export function useTourSettings(): [TourSettings, (patch: Partial<TourSettings>) => void] {
  const [settings, setSettings] = useState<TourSettings>(() => readSettings());

  useEffect(() => {
    const refresh = () => setSettings(readSettings());
    window.addEventListener("lovable:guided-tour-settings", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("lovable:guided-tour-settings", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const update = useCallback((patch: Partial<TourSettings>) => {
    const next = { ...readSettings(), ...patch };
    writeSettings(next);
    setSettings(next);
  }, []);

  return [settings, update];
}
