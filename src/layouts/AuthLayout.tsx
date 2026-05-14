import { ArrowLeft } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { useTranslation } from "../hooks/useTranslation";

export function AuthLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const canShowBack = location.pathname !== "/";

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  return (
    <div className="app-shell auth-shell">
      <header className="top-bar auth-top">
        {canShowBack ? (
          <button className="icon-button back-button" type="button" aria-label={t("common.back")} onClick={handleBack}>
            <ArrowLeft size={19} />
          </button>
        ) : null}
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
