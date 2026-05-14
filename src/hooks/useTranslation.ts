import { translate, type TranslationKey } from "../i18n";
import { useAppStore } from "../stores/appStore";

export function useTranslation() {
  const language = useAppStore(state => state.language);
  return {
    language,
    t: (key: TranslationKey) => translate(language, key)
  };
}
