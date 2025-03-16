/**
 * Internationalization utilities
 */

import { useState, useEffect } from "react";

// Available languages
export const AVAILABLE_LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  zh: "中文",
};

// Default language
export const DEFAULT_LANGUAGE = "en";

// Get browser language
export const getBrowserLanguage = (): string => {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.split("-")[0];
  return Object.keys(AVAILABLE_LANGUAGES).includes(browserLang)
    ? browserLang
    : DEFAULT_LANGUAGE;
};

// Get user's preferred language from localStorage or browser
export const getUserLanguage = (): string => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  return localStorage.getItem("userLanguage") || getBrowserLanguage();
};

// Set user's preferred language
export const setUserLanguage = (lang: string): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem("userLanguage", lang);
};

// Load translations for a specific language
export const loadTranslations = async (lang: string) => {
  try {
    const translations = await import(`../locales/${lang}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}`, error);
    // Fallback to English
    if (lang !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE);
    }
    return {};
  }
};

// Hook to use translations
export const useTranslation = () => {
  const [language, setLanguage] = useState(getUserLanguage());
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      setLoading(true);
      const loadedTranslations = await loadTranslations(language);
      setTranslations(loadedTranslations);
      setLoading(false);
    };

    loadLanguage();
  }, [language]);

  const changeLanguage = (lang: string) => {
    setUserLanguage(lang);
    setLanguage(lang);
  };

  const t = (key: string, params: Record<string, string> = {}): string => {
    let text = translations[key] || key;

    // Replace parameters
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{{${paramKey}}}`, value);
    });

    return text;
  };

  return { t, language, changeLanguage, loading };
};
