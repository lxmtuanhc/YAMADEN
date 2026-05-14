import { useCallback } from "react";
import { translate, type TranslationKey } from "../i18n";
import { useAppStore } from "../stores/appStore";

export function useTranslation() {
  const language = useAppStore(state => state.language);
  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);
  return {
    language,
    t
  };
}
