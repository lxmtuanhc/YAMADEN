import { Bell, CalendarDays, FileText, Home, ReceiptText, User } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { useTranslation } from "../hooks/useTranslation";

const tabs = [
  { to: "/home", key: "nav.home", Icon: Home },
  { to: "/requests", key: "nav.requests", Icon: FileText },
  { to: "/quotes", key: "nav.quotes", Icon: ReceiptText },
  { to: "/schedule", key: "nav.schedule", Icon: CalendarDays },
  { to: "/account", key: "nav.account", Icon: User }
] as const;

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="top-bar">
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
