import type { Language } from "../types";
import { useAppStore } from "../stores/appStore";
import { useTranslation } from "../hooks/useTranslation";

export function LanguageSwitch() {
  const language = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);
  const { t } = useTranslation();
  const options: Array<{ value: Language; label: string }> = [
    { value: "vi", label: t("language.vi") },
    { value: "ja", label: t("language.ja") }
  ];

  return (
    <div className="language-switch">
      {options.map(option => (
        <button
          className={language === option.value ? "active" : ""}
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
        >
          {option.value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
