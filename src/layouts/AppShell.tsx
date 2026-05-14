import { ArrowLeft, Bell, CalendarDays, FileText, Home, ReceiptText, User } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { useTranslation } from "../hooks/useTranslation";

const tabs = [
  { to: "/home", key: "nav.home", Icon: Home },
  { to: "/requests", key: "nav.requests", Icon: FileText },
  { to: "/quotes", key: "nav.quotes", Icon: ReceiptText },
  { to: "/schedule", key: "nav.schedule", Icon: CalendarDays },
  { to: "/account", key: "nav.account", Icon: User }
] as const;
const tabRootPaths = tabs.map(tab => tab.to);

export function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <AppTopBar />
      <main className="content-scroll">
        <Outlet />
      </main>
      <nav className="bottom-tab">
        {tabs.map(({ to, key, Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={21} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function AppTopBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const canShowBack = !tabRootPaths.includes(location.pathname);

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/home");
  }

  return (
    <header className="top-bar">
      {canShowBack ? (
        <button className="icon-button back-button" type="button" aria-label={t("common.back")} onClick={handleBack}>
          <ArrowLeft size={19} />
        </button>
      ) : null}
      <button className="brand-mark brand-button" type="button" onClick={() => navigate("/home")}>
        <img src="/assets/icon-192.png" alt="" />
        <div>
          <strong>{t("brand.jp")}</strong>
          <span>{t("brand.en")}</span>
        </div>
      </button>
      <div className="top-actions">
        <LanguageSwitch />
        <button className="icon-button" type="button" aria-label={t("app.name")}>
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
}
