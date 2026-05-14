import { Outlet } from "react-router-dom";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { useTranslation } from "../hooks/useTranslation";

function AuthTopBar() {
  const { t } = useTranslation();

  return (
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
  );
}

export function AuthLayout() {
  return (
    <div className="app-shell auth-shell">
      <AuthTopBar />
      <main className="content-scroll auth-content">
        <Outlet />
      </main>
    </div>
  );
}
