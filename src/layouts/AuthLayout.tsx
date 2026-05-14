import { Outlet } from "react-router-dom";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { useTranslation } from "../hooks/useTranslation";

export function AuthLayout() {
  const { t } = useTranslation();
  return (
    <div className="app-shell auth-shell">
      <header className="top-bar auth-top">
        <div className="brand-mark">
          <img src="/assets/icon-192.png" alt="" />
          <div>
            <strong>{t("brand.jp")}</strong>
            <span>{t("brand.en")}</span>
          </div>
        </div>
        <LanguageSwitch />
      </header>
      <main className="content-scroll auth-content">
        <Outlet />
      </main>
    </div>
  );
}
