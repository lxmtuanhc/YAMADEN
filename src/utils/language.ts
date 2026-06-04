import type { Language } from "../types";

export const LANGUAGE_STORAGE_KEY = "yamaden_language";
export const LEGACY_LANGUAGE_STORAGE_KEY = "language";

export function isLanguage(value: unknown): value is Language {
  return value === "vi" || value === "ja";
}

export function saveLanguage(language: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors; the UI can still switch language in memory.
  }
}

export function getInitialLanguage(): Language {
  try {
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (isLanguage(urlLang)) {
      saveLanguage(urlLang);
      return urlLang;
    }

    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY);
    if (isLanguage(savedLang)) return savedLang;
  } catch {
    // Fall through to the public QR/link default.
  }

  return "ja";
}
