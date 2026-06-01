import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr.json";

// French-only: language switcher removed. Other locales kept on disk for later.
export const SUPPORTED_LANGUAGES = ["fr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: "Français",
};

export const RTL_LANGUAGES: SupportedLanguage[] = [];

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
  },
  lng: "fr",
  fallbackLng: "fr",
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = "fr";
  document.documentElement.dir = "ltr";
}

try {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("ancrage_lang", "fr");
  }
} catch {
  /* noop */
}

export default i18n;
