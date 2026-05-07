/**
 * Daily progress for the morning + evening micro-sequence.
 *
 * Two slots — "morning" (scene index 0, explosion / start-of-day) and
 * "evening" (scene index 3, panique / end-of-day). Each is marked "done"
 * when the user clicks its CTA from the home page. The state resets
 * automatically at the next calendar day so the suggestion stays relevant.
 *
 * Local-only — purely a UX nudge.
 */

import { useEffect, useState } from "react";

export type DailySlot = "morning" | "evening";

type Stored = {
  /** YYYY-MM-DD of the local day this snapshot belongs to. */
  day: string;
  morning?: number; // epoch ms
  evening?: number;
};

const STORAGE_KEY = "ancrage_morning_evening_progress";
const EVENT = "ancrage-morning-evening-progress-change";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function read(): Stored {
  if (typeof window === "undefined") return { day: todayKey() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { day: todayKey() };
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed || parsed.day !== todayKey()) return { day: todayKey() };
    return parsed;
  } catch {
    return { day: todayKey() };
  }
}

function write(value: Stored) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {}
  window.dispatchEvent(new CustomEvent<Stored>(EVENT, { detail: value }));
}

export function getDailyProgress(): Stored {
  return read();
}

export function markSlotDone(slot: DailySlot) {
  if (typeof window === "undefined") return;
  const cur = read();
  write({ ...cur, [slot]: Date.now() });
}

export function resetDailyProgress() {
  if (typeof window === "undefined") return;
  write({ day: todayKey() });
}

export function useDailyProgress(): Stored {
  const [value, setValue] = useState<Stored>(() => read());
  useEffect(() => {
    const onChange = () => setValue(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setValue(read());
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setValue(read());
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);
  return value;
}

/**
 * Pick the next slot the user should tackle, based on:
 *  - what's already done today
 *  - the time of day (morning before evening before noon, evening after)
 *
 * Returns null when both slots are completed for the day.
 */
export function pickNextSlot(p: Stored): DailySlot | null {
  const morningDone = !!p.morning;
  const eveningDone = !!p.evening;
  if (morningDone && eveningDone) return null;
  if (!morningDone && !eveningDone) {
    return new Date().getHours() >= 17 ? "evening" : "morning";
  }
  return morningDone ? "evening" : "morning";
}
