/**
 * Thème Éclosia — clair, sombre chaleureux, ou automatique (préférence système).
 *
 * Le mode sombre n'est PAS une inversion : les tokens `.dark` définis dans
 * index.css gardent une ambiance chaude (bleu nuit profond, rose poudré adouci,
 * doré doux) pour rester apaisants la nuit.
 */

export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "eclosia_theme";

export function getStoredTheme(): ThemeChoice {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* noop */
  }
  return "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Applique le thème sur <html> (classe `dark` + color-scheme). */
export function applyTheme(choice: ThemeChoice = getStoredTheme()): void {
  if (typeof document === "undefined") return;
  const dark = choice === "dark" || (choice === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* noop */
  }
  applyTheme(choice);
}

/** Suit les changements de préférence système quand le mode est « automatique ». */
export function watchSystemTheme(): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (getStoredTheme() === "system") applyTheme("system");
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
